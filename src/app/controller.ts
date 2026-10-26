import type { WeatherLookupResult } from '../domain/types'
import { lookupWeather as defaultLookupWeather } from '../services/weather-lookup'
import { render } from '../ui/render'
import type { Shell } from '../ui/shell'
import {
  clearFieldError,
  setSearchLoading,
  setStatus,
  showFieldError,
} from '../ui/shell'
import { normalizeQuery } from './query'
import type { AppState } from './state'

export const EMPTY_QUERY_ERROR = 'Digite o nome de uma cidade.'
export const SEARCH_TIMEOUT_MS = 12_000

export type LookupWeather = (
  name: string,
  signal?: AbortSignal,
) => Promise<WeatherLookupResult>

function createAbortError(): DOMException {
  return new DOMException('A busca foi cancelada.', 'AbortError')
}

function waitForLookup(
  promise: Promise<WeatherLookupResult>,
  signal: AbortSignal,
): Promise<WeatherLookupResult> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(createAbortError())
      return
    }

    const handleAbort = (): void => {
      reject(createAbortError())
    }

    signal.addEventListener('abort', handleAbort, { once: true })
    promise.then(
      (result) => {
        signal.removeEventListener('abort', handleAbort)
        resolve(result)
      },
      (error: unknown) => {
        signal.removeEventListener('abort', handleAbort)
        reject(error)
      },
    )
  })
}

export type ControllerOptions = {
  lookup?: LookupWeather
}

export type Controller = {
  search: (rawQuery: string) => Promise<void>
  getState: () => AppState
}

function statusMessage(state: AppState): string | null {
  switch (state.status) {
    case 'empty':
      return null
    case 'loading':
      return `Buscando clima para ${state.query}.`
    case 'success':
      return `Clima de ${state.data.city.name} carregado.`
    case 'city-not-found':
      return `Cidade não encontrada para ${state.query}.`
    case 'weather-unavailable':
      return `Clima indisponível para ${state.cityName}.`
    case 'network-error':
      return 'Não foi possível conectar ao serviço de clima.'
  }
}

export function createController(
  shell: Shell,
  options: ControllerOptions = {},
): Controller {
  const lookup = options.lookup ?? defaultLookupWeather
  let state: AppState = { status: 'empty' }
  let activeController: AbortController | null = null
  let requestId = 0

  function handleRetry(): void {
    if (
      state.status !== 'weather-unavailable' &&
      state.status !== 'network-error'
    ) {
      return
    }

    shell.input.value = state.query
    void search(state.query)
  }

  function renderState(nextState: AppState): void {
    state = nextState
    setSearchLoading(shell, nextState.status === 'loading')
    render(nextState, shell.content, handleRetry)

    const message = statusMessage(nextState)

    if (message) {
      setStatus(shell, message)
    }

    if (nextState.status === 'city-not-found') {
      shell.input.focus()
      shell.input.select()
    }
  }

  async function search(rawQuery: string): Promise<void> {
    const query = normalizeQuery(rawQuery)

    if (!query) {
      showFieldError(shell, EMPTY_QUERY_ERROR)
      shell.input.focus()
      return
    }

    clearFieldError(shell)

    if (state.status === 'loading' && state.query === query) {
      return
    }

    const currentRequestId = ++requestId
    activeController?.abort()

    const controller = new AbortController()
    activeController = controller

    renderState({ status: 'loading', query })

    const timeout = window.setTimeout(() => {
      controller.abort()
    }, SEARCH_TIMEOUT_MS)

    try {
      const result = await waitForLookup(
        lookup(query, controller.signal),
        controller.signal,
      )

      if (currentRequestId !== requestId) {
        return
      }

      switch (result.status) {
        case 'success':
          renderState({
            status: 'success',
            query,
            data: result.data,
          })
          break
        case 'city-not-found':
          renderState({ status: 'city-not-found', query })
          break
        case 'weather-unavailable':
          renderState({
            status: 'weather-unavailable',
            query,
            cityName: result.cityName,
          })
          break
        case 'network-error':
          renderState({ status: 'network-error', query })
          break
      }
    } catch {
      if (currentRequestId !== requestId) {
        return
      }

      renderState({ status: 'network-error', query })
    } finally {
      window.clearTimeout(timeout)

      if (currentRequestId === requestId) {
        activeController = null
      }
    }
  }

  function handleSubmit(event: SubmitEvent): void {
    event.preventDefault()
    void search(shell.input.value)
  }

  shell.form.addEventListener('submit', handleSubmit)
  renderState({ status: 'empty' })

  return {
    search,
    getState: () => state,
  }
}
