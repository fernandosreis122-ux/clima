import { parseLocalIso } from '../domain/format'
import type { City, CurrentWeather, WeatherUnits } from '../domain/types'

const GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast'

const CURRENT_PARAMETERS = [
  'precipitation_probability',
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'is_day',
  'wind_speed_10m',
  'wind_direction_10m',
  'precipitation',
  'weather_code',
].join(',')

export type OpenMeteoEndpoint = 'geocoding' | 'forecast'

export class OpenMeteoRequestError extends Error {
  readonly endpoint: OpenMeteoEndpoint
  readonly status?: number

  constructor(
    endpoint: OpenMeteoEndpoint,
    status?: number,
    options?: ErrorOptions,
  ) {
    super(`Falha na requisição Open-Meteo (${endpoint})`, options)
    this.name = 'OpenMeteoRequestError'
    this.endpoint = endpoint
    this.status = status
  }
}

function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'AbortError'
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== ''
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isNumberInRange(
  value: unknown,
  minimum: number,
  maximum: number,
): value is number {
  return isFiniteNumber(value) && value >= minimum && value <= maximum
}

function isInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value)
}

function isLocalIsoString(value: unknown): value is string {
  return typeof value === 'string' && parseLocalIso(value) !== null
}

function isValidTimezone(value: unknown): value is string {
  if (!isNonEmptyString(value)) {
    return false
  }

  try {
    new Intl.DateTimeFormat(undefined, { timeZone: value })
    return true
  } catch {
    return false
  }
}

async function fetchJson(
  endpoint: OpenMeteoEndpoint,
  url: URL,
  signal?: AbortSignal,
): Promise<unknown> {
  let response: Response

  try {
    response = await fetch(url, {
      signal,
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
  } catch (error) {
    if (isAbortError(error)) {
      throw error
    }

    throw new OpenMeteoRequestError(endpoint, undefined, { cause: error })
  }

  if (!response.ok) {
    throw new OpenMeteoRequestError(endpoint, response.status)
  }

  try {
    const data: unknown = await response.json()
    return data
  } catch (error) {
    if (isAbortError(error)) {
      throw error
    }

    throw new OpenMeteoRequestError(endpoint, response.status, { cause: error })
  }
}

function parseCity(value: unknown): City | null {
  if (!isRecord(value)) {
    return null
  }

  const { name, latitude, longitude, country_code, timezone } = value

  if (
    !isNonEmptyString(name) ||
    !isNumberInRange(latitude, -90, 90) ||
    !isNumberInRange(longitude, -180, 180) ||
    !isNonEmptyString(country_code) ||
    !isValidTimezone(timezone)
  ) {
    return null
  }

  return {
    name: name.trim(),
    latitude,
    longitude,
    countryCode: country_code,
    timezone,
  }
}

export async function searchCity(
  name: string,
  signal?: AbortSignal,
): Promise<City | null> {
  if (typeof name !== 'string' || name.trim() === '') {
    return null
  }

  const url = new URL(GEOCODING_ENDPOINT)
  url.searchParams.set('name', name.trim())
  url.searchParams.set('count', '1')
  url.searchParams.set('language', 'pt')
  url.searchParams.set('format', 'json')

  const data = await fetchJson('geocoding', url, signal)

  if (!isRecord(data) || !Array.isArray(data.results)) {
    return null
  }

  return parseCity(data.results[0])
}

function readUnit(value: unknown, fallback: string): string {
  return isNonEmptyString(value) ? value : fallback
}

function parseUnits(value: unknown): WeatherUnits {
  const units = isRecord(value) ? value : {}

  return {
    temperature: readUnit(units.temperature_2m, '°C'),
    apparentTemperature: readUnit(units.apparent_temperature, '°C'),
    humidity: readUnit(units.relative_humidity_2m, '%'),
    precipitationProbability: readUnit(units.precipitation_probability, '%'),
    windSpeed: readUnit(units.wind_speed_10m, 'km/h'),
    windDirection: readUnit(units.wind_direction_10m, '°'),
  }
}

function parseCurrentWeather(
  current: Record<string, unknown>,
  units: WeatherUnits,
): CurrentWeather | null {
  const {
    time,
    temperature_2m,
    relative_humidity_2m,
    apparent_temperature,
    is_day,
    wind_speed_10m,
    wind_direction_10m,
    precipitation_probability,
    weather_code,
  } = current

  if (
    !isLocalIsoString(time) ||
    !isFiniteNumber(temperature_2m) ||
    !isNumberInRange(relative_humidity_2m, 0, 100) ||
    !isFiniteNumber(apparent_temperature) ||
    (is_day !== 0 && is_day !== 1) ||
    !isFiniteNumber(wind_speed_10m) ||
    wind_speed_10m < 0 ||
    !isNumberInRange(wind_direction_10m, 0, 360) ||
    !isNumberInRange(precipitation_probability, 0, 100) ||
    !isInteger(weather_code)
  ) {
    return null
  }

  return {
    observedAtLocal: time,
    temperature: temperature_2m,
    apparentTemperature: apparent_temperature,
    humidity: relative_humidity_2m,
    precipitationProbability: precipitation_probability,
    isDay: is_day === 1,
    windSpeed: wind_speed_10m,
    windDirection: wind_direction_10m,
    weatherCode: weather_code,
    units,
  }
}

export async function getCurrentWeather(
  city: City,
  signal?: AbortSignal,
): Promise<CurrentWeather | null> {
  if (!isRecord(city)) {
    return null
  }

  const { latitude, longitude, timezone } = city

  if (
    !isNumberInRange(latitude, -90, 90) ||
    !isNumberInRange(longitude, -180, 180) ||
    !isValidTimezone(timezone)
  ) {
    return null
  }

  const url = new URL(FORECAST_ENDPOINT)
  url.searchParams.set('latitude', String(latitude))
  url.searchParams.set('longitude', String(longitude))
  url.searchParams.set('current', CURRENT_PARAMETERS)
  url.searchParams.set('timezone', timezone)

  const data = await fetchJson('forecast', url, signal)

  if (!isRecord(data) || !isRecord(data.current)) {
    return null
  }

  return parseCurrentWeather(data.current, parseUnits(data.current_units))
}
