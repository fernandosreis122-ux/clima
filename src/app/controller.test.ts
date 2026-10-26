// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'

import type { WeatherLookupResult, WeatherSnapshot } from '../domain/types'
import { createShell } from '../ui/shell'
import type { Shell } from '../ui/shell'
import {
  EMPTY_QUERY_ERROR,
  SEARCH_TIMEOUT_MS,
  createController,
} from './controller'
import type { LookupWeather } from './controller'

function createSnapshot(cityName: string, countryCode = 'br'): WeatherSnapshot {
  return {
    city: {
      name: cityName,
      latitude: -22.9068,
      longitude: -43.1729,
      countryCode,
      timezone: 'America/Sao_Paulo',
    },
    weather: {
      observedAtLocal: '2026-06-17T09:45',
      temperature: 19.3,
      apparentTemperature: 21.4,
      humidity: 92,
      precipitationProbability: 73,
      isDay: true,
      windSpeed: 5.8,
      windDirection: 277,
      weatherCode: 2,
      units: {
        temperature: '°C',
        apparentTemperature: '°C',
        humidity: '%',
        precipitationProbability: '%',
        windSpeed: 'km/h',
        windDirection: '°',
      },
    },
  }
}

function createHarness(lookup: LookupWeather): {
  shell: Shell
  controller: ReturnType<typeof createController>
} {
  const root = document.createElement('div')
  document.body.append(root)

  const shell = createShell(root)
  const controller = createController(shell, { lookup })

  return { shell, controller }
}

function submit(shell: Shell): void {
  shell.form.dispatchEvent(
    new Event('submit', { bubbles: true, cancelable: true }),
  )
}

function flushAsync(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0)
  })
}

function deferred<T>(): {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (reason?: unknown) => void
} {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void

  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return { promise, resolve, reject }
}

afterEach(() => {
  document.body.replaceChildren()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('controller', () => {
  it('dispara a busca pelo submit do formulário e pelo botão', async () => {
    const snapshot = createSnapshot('Rio de Janeiro')
    const lookup = vi
      .fn<LookupWeather>()
      .mockResolvedValue({ status: 'success', data: snapshot })
    const { shell } = createHarness(lookup)

    shell.input.value = '  Rio   de Janeiro  '
    submit(shell)
    await flushAsync()

    expect(lookup).toHaveBeenCalledTimes(1)
    expect(lookup).toHaveBeenNthCalledWith(
      1,
      'Rio de Janeiro',
      expect.any(AbortSignal),
    )
    expect(shell.content.querySelector('.success-state')).not.toBeNull()

    shell.input.value = '  Lisboa '
    shell.submitButton.click()
    await flushAsync()

    expect(lookup).toHaveBeenCalledTimes(2)
    expect(lookup).toHaveBeenNthCalledWith(
      2,
      'Lisboa',
      expect.any(AbortSignal),
    )
  })

  it('valida query vazia sem requisitar nem alterar o conteúdo', async () => {
    const snapshot = createSnapshot('Rio de Janeiro')
    const lookup = vi
      .fn<LookupWeather>()
      .mockResolvedValue({ status: 'success', data: snapshot })
    const { shell, controller } = createHarness(lookup)

    shell.input.value = 'Rio de Janeiro'
    submit(shell)
    await flushAsync()

    const previousContent = shell.content.firstElementChild
    shell.input.value = '   '
    submit(shell)

    expect(lookup).toHaveBeenCalledTimes(1)
    expect(shell.fieldError.hidden).toBe(false)
    expect(shell.fieldError.textContent).toBe(EMPTY_QUERY_ERROR)
    expect(shell.input.getAttribute('aria-invalid')).toBe('true')
    expect(shell.input.getAttribute('aria-describedby')).toBe('city-error')
    expect(document.activeElement).toBe(shell.input)
    expect(shell.content.firstElementChild).toBe(previousContent)
    expect(controller.getState().status).toBe('success')
  })

  it('mostra um único loading e preserva o valor do input', async () => {
    const pending = deferred<WeatherLookupResult>()
    const lookup = vi.fn<LookupWeather>().mockReturnValue(pending.promise)
    const { shell } = createHarness(lookup)

    shell.input.value = '  Rio   de Janeiro '
    submit(shell)

    expect(shell.content.querySelectorAll('.weather-card--loading')).toHaveLength(
      1,
    )
    expect(shell.content.getAttribute('aria-busy')).toBe('true')
    expect(shell.submitButton.textContent).toBe('Buscando…')
    expect(shell.submitButton.disabled).toBe(false)
    expect(shell.input.disabled).toBe(false)
    expect(shell.input.value).toBe('  Rio   de Janeiro ')
    expect(shell.status.textContent).toBe('Buscando clima para Rio de Janeiro.')
    expect(lookup).toHaveBeenCalledTimes(1)

    pending.resolve({
      status: 'success',
      data: createSnapshot('Rio de Janeiro'),
    })
    await flushAsync()

    expect(shell.content.querySelector('.success-state')).not.toBeNull()
    expect(shell.content.getAttribute('aria-busy')).toBe('false')
    expect(shell.submitButton.textContent).toBe('Buscar')
    expect(shell.input.value).toBe('  Rio   de Janeiro ')
    expect(shell.status.textContent).toBe('Clima de Rio de Janeiro carregado.')
  })

  it('renderiza cidade não encontrada e mantém o valor digitado', async () => {
    const lookup = vi
      .fn<LookupWeather>()
      .mockResolvedValue({ status: 'city-not-found' })
    const { shell } = createHarness(lookup)

    shell.input.value = 'Atlântida'
    submit(shell)
    await flushAsync()

    expect(shell.content.querySelector('.error-card--city-not-found')).not.toBeNull()
    expect(shell.content.querySelector('.retry-button')).toBeNull()
    expect(shell.content.querySelector('.sidebar')).toBeNull()
    expect(shell.content.querySelector('.metric-tile')).toBeNull()
    expect(shell.input.value).toBe('Atlântida')
    expect(shell.status.textContent).toBe(
      'Cidade não encontrada para Atlântida.',
    )
  })

  it('renderiza clima indisponível com retry', async () => {
    const lookup = vi
      .fn<LookupWeather>()
      .mockResolvedValue({
        status: 'weather-unavailable',
        cityName: 'São Paulo',
      })
    const { shell } = createHarness(lookup)

    shell.input.value = 'São Paulo'
    submit(shell)
    await flushAsync()

    expect(
      shell.content.querySelector('.error-card--weather-unavailable'),
    ).not.toBeNull()
    expect(shell.content.querySelector('.retry-button')).not.toBeNull()
    expect(shell.content.querySelector('.sidebar')).toBeNull()
    expect(shell.status.textContent).toBe(
      'Clima indisponível para São Paulo.',
    )
  })

  it('renderiza erro de conexão com retry', async () => {
    const lookup = vi
      .fn<LookupWeather>()
      .mockResolvedValue({ status: 'network-error' })
    const { shell } = createHarness(lookup)

    shell.input.value = 'Lisboa'
    submit(shell)
    await flushAsync()

    expect(shell.content.querySelector('.error-card--network-error')).not.toBeNull()
    expect(shell.content.querySelector('.retry-button')).not.toBeNull()
    expect(shell.content.querySelector('.sidebar')).toBeNull()
    expect(shell.status.textContent).toBe(
      'Não foi possível conectar ao serviço de clima.',
    )
  })

  it('retry reenvia a última query e restaura o input', async () => {
    const lookup = vi
      .fn<LookupWeather>()
      .mockResolvedValueOnce({ status: 'network-error' })
      .mockResolvedValueOnce({
        status: 'success',
        data: createSnapshot('Lisboa', 'pt'),
      })
    const { shell } = createHarness(lookup)

    shell.input.value = 'Lisboa'
    submit(shell)
    await flushAsync()

    expect(shell.content.querySelector('.error-card--network-error')).not.toBeNull()

    shell.input.value = 'outra coisa'
    shell.content.querySelector<HTMLButtonElement>('.retry-button')?.click()

    expect(shell.input.value).toBe('Lisboa')
    expect(shell.content.querySelector('.weather-card--loading')).not.toBeNull()
    expect(shell.status.textContent).toBe('Buscando clima para Lisboa.')

    await flushAsync()

    expect(lookup).toHaveBeenCalledTimes(2)
    expect(lookup).toHaveBeenNthCalledWith(
      2,
      'Lisboa',
      expect.any(AbortSignal),
    )
    expect(shell.content.querySelector('.success-state')).not.toBeNull()
    expect(shell.status.textContent).toBe('Clima de Lisboa carregado.')
  })

  it('cancela a busca anterior e ignora respostas antigas', async () => {
    const first = deferred<WeatherLookupResult>()
    const second = deferred<WeatherLookupResult>()
    const lookup = vi.fn<LookupWeather>((name) =>
      name === 'Rio de Janeiro' ? first.promise : second.promise,
    )
    const { shell } = createHarness(lookup)

    shell.input.value = 'Rio de Janeiro'
    submit(shell)

    shell.input.value = 'Lisboa'
    submit(shell)

    const firstSignal = lookup.mock.calls[0]?.[1]
    const secondSignal = lookup.mock.calls[1]?.[1]

    expect(firstSignal?.aborted).toBe(true)
    expect(secondSignal?.aborted).toBe(false)
    expect(lookup).toHaveBeenCalledTimes(2)

    second.resolve({
      status: 'success',
      data: createSnapshot('Lisboa', 'pt'),
    })
    await flushAsync()

    expect(shell.content.querySelector('.city')?.textContent).toBe(
      'Lisboa, PT',
    )

    first.resolve({
      status: 'success',
      data: createSnapshot('Rio de Janeiro'),
    })
    await flushAsync()

    expect(shell.content.querySelector('.city')?.textContent).toBe(
      'Lisboa, PT',
    )
    expect(shell.status.textContent).toBe('Clima de Lisboa carregado.')
  })

  it('aborta a busca após 12 segundos e mostra erro de conexão', async () => {
    vi.useFakeTimers()

    const lookup = vi.fn<LookupWeather>(
      (_name, signal) =>
        new Promise((_resolve, reject) => {
          signal?.addEventListener(
            'abort',
            () => {
              reject(new DOMException('Busca cancelada.', 'AbortError'))
            },
            { once: true },
          )
        }),
    )
    const { shell, controller } = createHarness(lookup)

    shell.input.value = 'Lisboa'
    submit(shell)

    const signal = lookup.mock.calls[0]?.[1]

    expect(signal?.aborted).toBe(false)
    expect(vi.getTimerCount()).toBe(1)

    await vi.advanceTimersByTimeAsync(SEARCH_TIMEOUT_MS - 1)

    expect(controller.getState().status).toBe('loading')
    expect(signal?.aborted).toBe(false)
    expect(vi.getTimerCount()).toBe(1)

    await vi.advanceTimersByTimeAsync(1)

    expect(signal?.aborted).toBe(true)
    expect(controller.getState()).toEqual({
      status: 'network-error',
      query: 'Lisboa',
    })
    expect(
      shell.content.querySelector('.error-card--network-error'),
    ).not.toBeNull()
    expect(shell.content.querySelector('.sidebar')).toBeNull()
    expect(shell.content.getAttribute('aria-busy')).toBe('false')
    expect(shell.submitButton.textContent).toBe('Buscar')
    expect(shell.status.textContent).toBe(
      'Não foi possível conectar ao serviço de clima.',
    )
    expect(vi.getTimerCount()).toBe(0)
  })

  it('cancela a busca anterior sem erro e ignora resposta atrasada', async () => {
    vi.useFakeTimers()

    const first = deferred<WeatherLookupResult>()
    const second = deferred<WeatherLookupResult>()
    const lookup = vi.fn<LookupWeather>((name) =>
      name === 'Rio de Janeiro' ? first.promise : second.promise,
    )
    const { shell, controller } = createHarness(lookup)

    shell.input.value = 'Rio de Janeiro'
    submit(shell)

    expect(vi.getTimerCount()).toBe(1)

    shell.input.value = 'Lisboa'
    submit(shell)

    const firstSignal = lookup.mock.calls[0]?.[1]
    const secondSignal = lookup.mock.calls[1]?.[1]

    expect(firstSignal?.aborted).toBe(true)
    expect(secondSignal?.aborted).toBe(false)
    expect(controller.getState()).toEqual({
      status: 'loading',
      query: 'Lisboa',
    })
    expect(shell.content.querySelector('.error-card--network-error')).toBeNull()
    expect(shell.status.textContent).toBe('Buscando clima para Lisboa.')

    await vi.advanceTimersByTimeAsync(0)

    expect(vi.getTimerCount()).toBe(1)

    second.resolve({
      status: 'success',
      data: createSnapshot('Lisboa', 'pt'),
    })
    await vi.advanceTimersByTimeAsync(0)

    expect(shell.content.querySelector('.city')?.textContent).toBe(
      'Lisboa, PT',
    )
    expect(vi.getTimerCount()).toBe(0)

    first.resolve({
      status: 'success',
      data: createSnapshot('Rio de Janeiro'),
    })
    await vi.advanceTimersByTimeAsync(0)

    expect(shell.content.querySelector('.city')?.textContent).toBe(
      'Lisboa, PT',
    )
    expect(shell.content.querySelector('.success-state')).not.toBeNull()
    expect(shell.content.querySelector('.error-card--network-error')).toBeNull()
    expect(shell.status.textContent).toBe('Clima de Lisboa carregado.')
  })

  it('ignora a mesma query e cancela quando a query é diferente', async () => {
    vi.useFakeTimers()

    const first = deferred<WeatherLookupResult>()
    const second = deferred<WeatherLookupResult>()
    const lookup = vi.fn<LookupWeather>((name) =>
      name === 'Rio de Janeiro' ? first.promise : second.promise,
    )
    const { shell } = createHarness(lookup)

    shell.input.value = 'Rio de Janeiro'
    submit(shell)

    shell.input.value = '  Rio   de Janeiro  '
    submit(shell)

    const firstSignal = lookup.mock.calls[0]?.[1]

    expect(lookup).toHaveBeenCalledTimes(1)
    expect(firstSignal?.aborted).toBe(false)
    expect(shell.status.textContent).toBe(
      'Buscando clima para Rio de Janeiro.',
    )
    expect(vi.getTimerCount()).toBe(1)

    shell.input.value = 'Lisboa'
    submit(shell)

    expect(lookup).toHaveBeenCalledTimes(2)
    expect(firstSignal?.aborted).toBe(true)
    expect(shell.status.textContent).toBe('Buscando clima para Lisboa.')
    expect(shell.content.querySelector('.error-card--network-error')).toBeNull()

    await vi.advanceTimersByTimeAsync(0)

    expect(vi.getTimerCount()).toBe(1)

    second.resolve({
      status: 'success',
      data: createSnapshot('Lisboa', 'pt'),
    })
    await vi.advanceTimersByTimeAsync(0)

    expect(shell.content.querySelector('.city')?.textContent).toBe(
      'Lisboa, PT',
    )
    expect(vi.getTimerCount()).toBe(0)

    first.resolve({
      status: 'success',
      data: createSnapshot('Rio de Janeiro'),
    })
    await vi.advanceTimersByTimeAsync(0)

    expect(shell.content.querySelector('.city')?.textContent).toBe(
      'Lisboa, PT',
    )
    expect(shell.status.textContent).toBe('Clima de Lisboa carregado.')
  })

  it('foca e seleciona o texto em city-not-found', async () => {
    vi.useFakeTimers()

    const lookup = vi
      .fn<LookupWeather>()
      .mockResolvedValue({ status: 'city-not-found' })
    const { shell } = createHarness(lookup)

    shell.input.value = '  Atlântida  '
    shell.submitButton.focus()
    submit(shell)

    await vi.advanceTimersByTimeAsync(0)

    expect(document.activeElement).toBe(shell.input)
    expect(shell.input.value).toBe('  Atlântida  ')
    expect(shell.input.selectionStart).toBe(0)
    expect(shell.input.selectionEnd).toBe(shell.input.value.length)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('não move o foco no sucesso', async () => {
    vi.useFakeTimers()

    const lookup = vi.fn<LookupWeather>().mockResolvedValue({
      status: 'success',
      data: createSnapshot('Lisboa', 'pt'),
    })
    const { shell } = createHarness(lookup)

    shell.input.value = 'Lisboa'
    shell.submitButton.focus()
    shell.submitButton.click()

    await vi.advanceTimersByTimeAsync(0)

    expect(document.activeElement).toBe(shell.submitButton)
    expect(shell.content.querySelector('.success-state')).not.toBeNull()
    expect(shell.status.textContent).toBe('Clima de Lisboa carregado.')
  })

  it('anuncia o status uma vez por transição', async () => {
    vi.useFakeTimers()

    const pending = deferred<WeatherLookupResult>()
    const lookup = vi.fn<LookupWeather>().mockReturnValue(pending.promise)
    const { shell } = createHarness(lookup)

    shell.input.value = 'Lisboa'
    submit(shell)

    const changes: string[] = []
    const observer = new MutationObserver(() => {
      changes.push(shell.status.textContent ?? '')
    })

    observer.observe(shell.status, {
      childList: true,
      characterData: true,
      subtree: true,
    })

    pending.resolve({
      status: 'success',
      data: createSnapshot('Lisboa', 'pt'),
    })
    await vi.advanceTimersByTimeAsync(0)
    await Promise.resolve()

    observer.disconnect()

    expect(changes).toEqual(['Clima de Lisboa carregado.'])
    expect(vi.getTimerCount()).toBe(0)
  })
})
