// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'

import type { AppState } from '../app/state'
import type { WeatherSnapshot } from '../domain/types'
import {
  render,
  renderCityNotFound,
  renderEmpty,
  renderLoading,
  renderNetworkError,
  renderSuccess,
  renderWeatherUnavailable,
} from './render'
import { createShell } from './shell'

const exampleSnapshot: WeatherSnapshot = {
  city: {
    name: 'Rio de Janeiro',
    latitude: -22.9068,
    longitude: -43.1729,
    countryCode: 'br',
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

afterEach(() => {
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe('empty state', () => {
  it('renderiza os textos exatos e nenhum dado meteorológico', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const content = document.createElement('main')
    document.body.append(content)

    renderEmpty(content)

    const card = content.querySelector('.empty-state')
    expect(card).not.toBeNull()
    expect(card?.querySelector('.state-title')?.textContent).toBe(
      'Como está o clima hoje?',
    )
    expect(card?.querySelector('.state-body')?.textContent).toBe(
      'Busque por uma cidade para ver temperatura, umidade, vento e chance de chuva.',
    )
    expect(card?.querySelector('.state-hint')?.textContent).toBe(
      'Ex.: São Paulo, Lisboa ou Tóquio',
    )
    expect(content.querySelector('.weather-card')).toBeNull()
    expect(content.textContent).not.toContain('19')
    expect(content.textContent).not.toContain('92')
    expect(content.textContent).not.toContain('°C')
    expect(content.textContent).not.toContain('%')
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('é dirigido pelo AppState e mantém o shell intacto', () => {
    const root = document.createElement('div')
    document.body.append(root)

    const shell = createShell(root)
    const form = shell.form
    const input = shell.input

    render({ status: 'empty' }, shell.content)

    expect(shell.content.querySelector('.empty-state')).not.toBeNull()
    expect(shell.form).toBe(form)
    expect(shell.input).toBe(input)
    expect(shell.input.value).toBe('')
    expect(document.activeElement).toBe(document.body)
    expect(shell.content.getAttribute('aria-busy')).toBe('false')
  })

  it('não contém ícone como imagem ou emoji', () => {
    const content = document.createElement('main')
    document.body.append(content)

    renderEmpty(content)

    expect(content.querySelector('img')).toBeNull()
    expect(content.querySelector('.state-icon svg')?.getAttribute('aria-hidden')).toBe(
      'true',
    )
    expect(content.textContent).not.toContain('☁')
  })
})

describe('loading state', () => {
  it('mostra apenas skeletons, sem textos ou valores', () => {
    const content = document.createElement('main')
    document.body.append(content)

    renderLoading(content)

    const card = content.querySelector('.weather-card--loading')
    const sidebar = card?.querySelector('.sidebar--loading')

    expect(card).not.toBeNull()
    expect(card?.getAttribute('aria-hidden')).toBe('true')
    expect(content.querySelectorAll('.skeleton')).toHaveLength(20)
    expect(content.querySelectorAll('.skeleton--tile-icon')).toHaveLength(4)
    expect(content.querySelectorAll('.skeleton--tile-label')).toHaveLength(4)
    expect(content.querySelectorAll('.skeleton--tile-value')).toHaveLength(4)
    expect(
      content.querySelectorAll('.skeleton--tile-secondary'),
    ).toHaveLength(1)
    expect(sidebar?.querySelector('.skeleton--temperature')).not.toBeNull()
    expect(sidebar?.querySelector('.skeleton--city')).not.toBeNull()
    expect(sidebar?.querySelector('.skeleton--date')).not.toBeNull()
    expect(sidebar?.querySelector('.skeleton--updated')).not.toBeNull()
    expect(sidebar?.querySelector('.skeleton--badge')).not.toBeNull()
    expect(sidebar?.querySelector('.skeleton--condition-icon')).not.toBeNull()
    expect(sidebar?.querySelector('.skeleton--condition-line')).not.toBeNull()
    expect(content.textContent).toBe('')
    expect(content.querySelector('.metric-label')).toBeNull()
    expect(content.querySelector('.temperature')).toBeNull()
  })

  it('marca o conteúdo como ocupado e limpa ao sair do loading', () => {
    const content = document.createElement('main')
    const state: AppState = { status: 'loading', query: 'Lisboa' }
    document.body.append(content)

    render(state, content)
    expect(content.getAttribute('aria-busy')).toBe('true')

    render({ status: 'empty' }, content)
    expect(content.getAttribute('aria-busy')).toBe('false')
    expect(content.querySelector('.weather-card--loading')).toBeNull()
  })
})

describe('success state', () => {
  it('renderiza o snapshot de exemplo com a hierarquia da sidebar', () => {
    const content = document.createElement('main')
    document.body.append(content)

    renderSuccess(content, exampleSnapshot)

    const sidebar = content.querySelector('.sidebar')
    expect(content.querySelector('.success-state')).not.toBeNull()
    expect(content.getAttribute('aria-busy')).toBe('false')
    expect(sidebar?.children[0]?.classList.contains('temperature')).toBe(true)
    expect(sidebar?.children[1]?.classList.contains('city')).toBe(true)
    expect(sidebar?.children[2]?.classList.contains('sidebar-time')).toBe(true)
    expect(sidebar?.children[3]?.classList.contains('day-badge')).toBe(true)
    expect(sidebar?.children[4]?.classList.contains('weather-condition')).toBe(true)
    expect(content.querySelector('.temperature')?.textContent).toBe('19\u00A0°C')
    expect(content.querySelector('.city')?.textContent).toBe(
      'Rio de Janeiro, BR',
    )
    expect(content.querySelector('.sidebar-date')?.textContent).toBe(
      'Quarta-feira, 17 de junho',
    )
    expect(content.querySelector('.sidebar-updated')?.textContent).toBe(
      'Atualizado às 09:45',
    )
    expect(content.querySelector('.day-badge__label')?.textContent).toBe('Dia')
    expect(content.querySelector('.day-badge__icon')?.classList).toContain(
      'icon--sun',
    )
    expect(
      content.querySelector('.weather-condition__description')?.textContent,
    ).toBe('Parcialmente nublado')
    expect(content.querySelector('.weather-condition__code')?.textContent).toBe(
      'Código WMO 2',
    )
    expect(
      content.querySelector('.weather-condition__icon .icon')?.classList,
    ).toContain('icon--cloud-sun')
  })

  it('renderiza as quatro métricas na ordem e com o vento hierarquizado', () => {
    const content = document.createElement('main')
    document.body.append(content)

    renderSuccess(content, exampleSnapshot)

    const tiles = Array.from(
      content.querySelectorAll<HTMLElement>('.metric-tile'),
    )
    expect(tiles).toHaveLength(4)
    expect(tiles.map((tile) => tile.querySelector('.metric-tile__label')?.textContent)).toEqual([
      'Umidade relativa',
      'Sensação térmica',
      'Probabilidade de precipitação',
      'Vento',
    ])
    expect(
      tiles.map((tile) => tile.querySelector('.metric-tile__value')?.textContent),
    ).toEqual([
      '92%',
      '21,4\u00A0°C',
      '73%',
      '5,8\u00A0km/h',
    ])
    expect(tiles[3]?.querySelector('.metric-tile__secondary')?.textContent).toBe(
      'de O · 277°',
    )
    expect(content.textContent).not.toContain('mm')
    expect(
      content.querySelectorAll('.success-state svg[aria-hidden="true"]'),
    ).toHaveLength(6)
  })

  it('usa as unidades do snapshot sem converter valores', () => {
    const content = document.createElement('main')
    const imperialSnapshot: WeatherSnapshot = {
      ...exampleSnapshot,
      weather: {
        ...exampleSnapshot.weather,
        units: {
          ...exampleSnapshot.weather.units,
          temperature: '°F',
          apparentTemperature: '°F',
          windSpeed: 'mph',
        },
      },
    }
    document.body.append(content)

    renderSuccess(content, imperialSnapshot)

    expect(content.querySelector('.temperature')?.textContent).toBe('19\u00A0°F')
    expect(
      content.querySelectorAll('.metric-tile__value')[1]?.textContent,
    ).toBe('21,4\u00A0°F')
    expect(
      content.querySelectorAll('.metric-tile__value')[3]?.textContent,
    ).toBe('5,8\u00A0mph')
  })

  it('usa o fallback de código desconhecido e a variante noturna', () => {
    const content = document.createElement('main')
    const unknownSnapshot: WeatherSnapshot = {
      ...exampleSnapshot,
      weather: {
        ...exampleSnapshot.weather,
        weatherCode: 999,
        isDay: false,
      },
    }
    document.body.append(content)

    renderSuccess(content, unknownSnapshot)

    expect(
      content.querySelector('.weather-condition__description')?.textContent,
    ).toBe('Condição desconhecida')
    expect(content.querySelector('.weather-condition__code')?.textContent).toBe(
      'Código WMO 999',
    )
    expect(
      content.querySelector('.weather-condition__icon .icon')?.classList,
    ).toContain('icon--unknown')
    expect(content.querySelector('.day-badge__label')?.textContent).toBe('Noite')
    expect(content.querySelector('.day-badge__icon')?.classList).toContain(
      'icon--moon',
    )
  })

  it('renderiza nome de cidade com HTML como texto literal', () => {
    const content = document.createElement('main')
    const htmlName = '<img src=x onerror="window.xss=1"> Cidade Muito Longa'
    const htmlSnapshot: WeatherSnapshot = {
      ...exampleSnapshot,
      city: {
        ...exampleSnapshot.city,
        name: htmlName,
      },
    }
    document.body.append(content)

    renderSuccess(content, htmlSnapshot)

    expect(content.querySelector('img')).toBeNull()
    expect(content.querySelector('.city')?.textContent).toBe(
      `${htmlName}, BR`,
    )
    expect(content.querySelector('.city')?.innerHTML).not.toContain('<img')
  })

  it('é renderizado pelo estado success', () => {
    const content = document.createElement('main')
    const state: AppState = {
      status: 'success',
      query: 'Rio de Janeiro',
      data: exampleSnapshot,
    }
    document.body.append(content)

    render(state, content)

    expect(content.querySelector('.success-state')).not.toBeNull()
    expect(content.querySelectorAll('.metric-tile')).toHaveLength(4)
  })
})

describe('error states', () => {
  it('renderiza cidade não encontrada sem ação de retry', () => {
    const content = document.createElement('main')
    document.body.append(content)

    renderCityNotFound(content, 'Atlântida')

    const card = content.querySelector('.error-card--city-not-found')
    expect(card).not.toBeNull()
    expect(card?.getAttribute('aria-labelledby')).toBe('error-title')
    expect(content.querySelector('.state-title')?.textContent).toBe(
      'Cidade não encontrada',
    )
    expect(content.querySelector('.state-body')?.textContent).toBe(
      'Não encontramos resultados para “Atlântida”. Verifique o nome e tente novamente.',
    )
    expect(content.querySelector('.retry-button')).toBeNull()
    expect(
      content.querySelector('.error-card__icon .icon')?.classList,
    ).toContain('icon--map-pin-off')
    expect(content.getAttribute('aria-busy')).toBe('false')
    expect(content.querySelector('.sidebar')).toBeNull()
    expect(content.querySelector('.metric-tile')).toBeNull()
  })

  it('renderiza clima indisponível com cidade, ícone e retry funcional', () => {
    const content = document.createElement('main')
    const onRetry = vi.fn()
    document.body.append(content)

    renderWeatherUnavailable(content, 'São Paulo', onRetry)

    expect(content.querySelector('.state-title')?.textContent).toBe(
      'Clima indisponível',
    )
    expect(content.querySelector('.state-body')?.textContent).toBe(
      'Encontramos São Paulo, mas não conseguimos obter os dados de clima agora. Tente novamente.',
    )
    expect(
      content.querySelector('.error-card__icon .icon')?.classList,
    ).toContain('icon--cloud-off')
    expect(content.querySelector('.sidebar')).toBeNull()
    expect(content.querySelector('.metric-tile')).toBeNull()

    const retry = content.querySelector<HTMLButtonElement>('.retry-button')
    expect(retry).not.toBeNull()
    expect(retry?.type).toBe('button')
    expect(retry?.textContent).toBe('Tentar novamente')
    retry?.focus()
    expect(document.activeElement).toBe(retry)
    retry?.click()
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('renderiza erro de conexão com retry e callback pelo estado', () => {
    const content = document.createElement('main')
    const onRetry = vi.fn()
    const state: AppState = { status: 'network-error', query: 'Lisboa' }
    document.body.append(content)

    render(state, content, onRetry)

    expect(content.querySelector('.state-title')?.textContent).toBe(
      'Não foi possível conectar',
    )
    expect(content.querySelector('.state-body')?.textContent).toBe(
      'Verifique sua conexão com a internet e tente novamente.',
    )
    expect(
      content.querySelector('.error-card__icon .icon')?.classList,
    ).toContain('icon--wifi-off')
    expect(content.querySelector('.sidebar')).toBeNull()
    expect(content.querySelector('.metric-tile')).toBeNull()

    content.querySelector<HTMLButtonElement>('.retry-button')?.click()
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('escapa query e nome da cidade sem interpretar HTML', () => {
    const content = document.createElement('main')
    document.body.append(content)

    renderCityNotFound(content, '<img src=x onerror="window.xss=1">')
    expect(content.querySelector('img')).toBeNull()
    expect(content.querySelector('.state-body')?.textContent).toBe(
      'Não encontramos resultados para “<img src=x onerror="window.xss=1">”. Verifique o nome e tente novamente.',
    )

    renderWeatherUnavailable(content, '<b>Cidade</b>')
    expect(content.querySelector('b')).toBeNull()
    expect(content.querySelector('.state-body')?.textContent).toBe(
      'Encontramos <b>Cidade</b>, mas não conseguimos obter os dados de clima agora. Tente novamente.',
    )
  })

  it('remove dados antigos antes de renderizar um erro', () => {
    const content = document.createElement('main')
    document.body.append(content)

    renderSuccess(content, exampleSnapshot)
    expect(content.querySelector('.success-state')).not.toBeNull()

    renderNetworkError(content)

    expect(content.querySelector('.success-state')).toBeNull()
    expect(content.querySelector('.sidebar')).toBeNull()
    expect(content.querySelectorAll('.metric-tile')).toHaveLength(0)
    expect(content.textContent).not.toContain('Rio de Janeiro')
    expect(content.textContent).not.toContain('19')
    expect(content.querySelector('.retry-button')).not.toBeNull()
  })
})
