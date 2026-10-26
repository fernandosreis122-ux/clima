import type { AppState } from '../app/state'
import {
  formatLocalDate,
  formatLocalTime,
  formatMeasurement,
  formatNumber,
  formatWindDirection,
  parseLocalIso,
} from '../domain/format'
import type { CurrentWeather, WeatherSnapshot } from '../domain/types'
import { getWeatherCodeInfo } from '../domain/weather-codes'
import { clearElement, createElement } from './dom'
import type { IconName } from './icons'
import { createIcon } from './icons'

export function renderEmpty(content: HTMLElement): void {
  clearElement(content)
  content.setAttribute('aria-busy', 'false')

  const card = createElement('section', 'card state-card empty-state')
  card.setAttribute('aria-labelledby', 'empty-title')

  const icon = createElement('div', 'state-icon state-icon--empty')
  icon.append(createIcon('cloud-sun'))

  const title = createElement(
    'h2',
    'state-title',
    'Como está o clima hoje?',
  )
  title.id = 'empty-title'

  const body = createElement(
    'p',
    'state-body',
    'Busque por uma cidade para ver temperatura, umidade, vento e chance de chuva.',
  )

  const hint = createElement(
    'p',
    'state-hint',
    'Ex.: São Paulo, Lisboa ou Tóquio',
  )

  card.append(icon, title, body, hint)
  content.append(card)
}

export function renderLoading(content: HTMLElement): void {
  clearElement(content)
  content.setAttribute('aria-busy', 'true')

  const card = createElement('section', 'card weather-card weather-card--loading')
  card.setAttribute('aria-hidden', 'true')

  const sidebar = createElement('aside', 'sidebar sidebar--loading')
  const temperature = createElement(
    'div',
    'skeleton skeleton--temperature',
  )
  const city = createElement('div', 'skeleton skeleton--city')
  const time = createElement('div', 'sidebar-time sidebar-time--loading')
  const date = createElement('div', 'skeleton skeleton--date')
  const updated = createElement('div', 'skeleton skeleton--updated')
  const badge = createElement('div', 'skeleton skeleton--badge')
  const condition = createElement('div', 'skeleton-condition')
  const conditionIcon = createElement(
    'div',
    'skeleton skeleton--condition-icon',
  )
  const conditionLine = createElement(
    'div',
    'skeleton skeleton--condition-line',
  )

  time.append(date, updated)
  condition.append(conditionIcon, conditionLine)
  sidebar.append(temperature, city, time, badge, condition)

  const main = createElement('div', 'weather-main')
  const grid = createElement('div', 'metric-grid')

  for (let index = 0; index < 4; index += 1) {
    const tile = createElement('div', 'metric-tile metric-tile--loading')
    const icon = createElement(
      'div',
      'skeleton skeleton--tile-icon',
    )
    const label = createElement(
      'div',
      'skeleton skeleton--tile-label',
    )
    const value = createElement(
      'div',
      'skeleton skeleton--tile-value',
    )

    tile.append(icon, label, value)

    if (index === 3) {
      tile.append(
        createElement('div', 'skeleton skeleton--tile-secondary'),
      )
    }

    grid.append(tile)
  }

  main.append(grid)
  card.append(sidebar, main)
  content.append(card)
}

function createTemperature(value: number, unit: string): HTMLElement {
  const temperature = createElement('div', 'temperature')
  const separator = unit === '%' || unit === '°' ? '' : '\u00A0'

  temperature.append(
    createElement(
      'span',
      'temperature__value',
      formatNumber(value, 0),
    ),
    createElement('span', 'temperature__unit', `${separator}${unit}`),
  )

  return temperature
}

function createDayBadge(isDay: boolean): HTMLElement {
  const badge = createElement(
    'span',
    `day-badge ${isDay ? 'day-badge--day' : 'day-badge--night'}`,
  )

  badge.append(
    createIcon(isDay ? 'sun' : 'moon', 'day-badge__icon'),
    createElement('span', 'day-badge__label', isDay ? 'Dia' : 'Noite'),
  )

  return badge
}

function createWeatherCondition(weather: CurrentWeather): HTMLElement {
  const info = getWeatherCodeInfo(weather.weatherCode, weather.isDay)
  const condition = createElement('div', 'weather-condition')
  const icon = createElement('div', 'weather-condition__icon')
  const text = createElement('div', 'weather-condition__text')

  icon.append(createIcon(info.icon))
  text.append(
    createElement(
      'p',
      'weather-condition__description',
      info.description,
    ),
    createElement(
      'p',
      'weather-condition__code',
      `Código WMO ${weather.weatherCode}`,
    ),
  )

  condition.append(icon, text)

  return condition
}

function createMetricTile(
  icon: IconName,
  label: string,
  value: string,
  secondary?: string,
): HTMLElement {
  const tile = createElement('div', 'metric-tile')
  const iconContainer = createElement('div', 'metric-tile__icon')

  iconContainer.append(createIcon(icon))
  tile.append(
    iconContainer,
    createElement('p', 'metric-tile__label', label),
    createElement('p', 'metric-tile__value', value),
  )

  if (secondary) {
    tile.append(
      createElement('p', 'metric-tile__secondary', secondary),
    )
  }

  return tile
}

export function renderSuccess(
  content: HTMLElement,
  snapshot: WeatherSnapshot,
): void {
  clearElement(content)
  content.setAttribute('aria-busy', 'false')

  const { city, weather } = snapshot
  const observedAt = parseLocalIso(weather.observedAtLocal)
  const dateText = observedAt ? formatLocalDate(observedAt) : ''
  const timeText = observedAt ? formatLocalTime(observedAt) : ''

  const card = createElement('section', 'card weather-card success-state')
  card.setAttribute('aria-labelledby', 'weather-city')

  const sidebar = createElement('aside', 'sidebar')
  const cityHeading = createElement('h2', 'city')
  cityHeading.id = 'weather-city'
  cityHeading.append(
    createElement('span', 'city__name', city.name),
    createElement(
      'span',
      'city__country',
      `, ${city.countryCode.toUpperCase()}`,
    ),
  )

  const time = createElement('div', 'sidebar-time')
  time.append(
    createElement('p', 'sidebar-date', dateText),
    createElement(
      'p',
      'sidebar-updated',
      `Atualizado às ${timeText}`,
    ),
  )

  sidebar.append(
    createTemperature(weather.temperature, weather.units.temperature),
    cityHeading,
    time,
    createDayBadge(weather.isDay),
    createWeatherCondition(weather),
  )

  const main = createElement('div', 'weather-main')
  const grid = createElement('div', 'metric-grid')

  grid.append(
    createMetricTile(
      'droplet',
      'Umidade relativa',
      formatMeasurement(
        weather.humidity,
        weather.units.humidity,
        0,
      ),
    ),
    createMetricTile(
      'thermometer',
      'Sensação térmica',
      formatMeasurement(
        weather.apparentTemperature,
        weather.units.apparentTemperature,
        1,
      ),
    ),
    createMetricTile(
      'umbrella',
      'Probabilidade de precipitação',
      formatMeasurement(
        weather.precipitationProbability,
        weather.units.precipitationProbability,
        0,
      ),
    ),
    createMetricTile(
      'wind',
      'Vento',
      formatMeasurement(weather.windSpeed, weather.units.windSpeed, 1),
      formatWindDirection(
        weather.windDirection,
        weather.units.windDirection,
      ),
    ),
  )

  main.append(grid)
  card.append(sidebar, main)
  content.append(card)
}

type ErrorCardOptions = {
  variant: 'city-not-found' | 'weather-unavailable' | 'network-error'
  icon: IconName
  title: string
  body: string
  showRetry: boolean
  onRetry?: () => void
}

function renderErrorCard(
  content: HTMLElement,
  options: ErrorCardOptions,
): void {
  clearElement(content)
  content.setAttribute('aria-busy', 'false')

  const card = createElement(
    'section',
    `card state-card error-card error-card--${options.variant}`,
  )
  card.setAttribute('aria-labelledby', 'error-title')

  const icon = createElement(
    'div',
    `state-icon error-card__icon error-card__icon--${options.variant}`,
  )
  icon.append(createIcon(options.icon))

  const title = createElement('h2', 'state-title', options.title)
  title.id = 'error-title'

  const body = createElement(
    'p',
    'state-body error-card__body',
    options.body,
  )

  card.append(icon, title, body)

  if (options.showRetry) {
    const retry = createElement('button', 'retry-button')
    retry.type = 'button'
    retry.append(
      createIcon('refresh', 'retry-button__icon'),
      createElement('span', 'retry-button__label', 'Tentar novamente'),
    )

    if (options.onRetry) {
      retry.addEventListener('click', options.onRetry)
    }

    card.append(retry)
  }

  content.append(card)
}

export function renderCityNotFound(
  content: HTMLElement,
  query: string,
): void {
  renderErrorCard(content, {
    variant: 'city-not-found',
    icon: 'map-pin-off',
    title: 'Cidade não encontrada',
    body: `Não encontramos resultados para “${query}”. Verifique o nome e tente novamente.`,
    showRetry: false,
  })
}

export function renderWeatherUnavailable(
  content: HTMLElement,
  cityName: string,
  onRetry?: () => void,
): void {
  renderErrorCard(content, {
    variant: 'weather-unavailable',
    icon: 'cloud-off',
    title: 'Clima indisponível',
    body: `Encontramos ${cityName}, mas não conseguimos obter os dados de clima agora. Tente novamente.`,
    showRetry: true,
    onRetry,
  })
}

export function renderNetworkError(
  content: HTMLElement,
  onRetry?: () => void,
): void {
  renderErrorCard(content, {
    variant: 'network-error',
    icon: 'wifi-off',
    title: 'Não foi possível conectar',
    body: 'Verifique sua conexão com a internet e tente novamente.',
    showRetry: true,
    onRetry,
  })
}

export function render(
  state: AppState,
  content: HTMLElement,
  onRetry?: () => void,
): void {
  switch (state.status) {
    case 'empty':
      renderEmpty(content)
      break
    case 'loading':
      renderLoading(content)
      break
    case 'success':
      renderSuccess(content, state.data)
      break
    case 'city-not-found':
      renderCityNotFound(content, state.query)
      break
    case 'weather-unavailable':
      renderWeatherUnavailable(content, state.cityName, onRetry)
      break
    case 'network-error':
      renderNetworkError(content, onRetry)
      break
  }
}
