import type { WeatherLookupResult } from '../domain/types'
import {
  getCurrentWeather,
  OpenMeteoRequestError,
  searchCity,
} from './open-meteo'

function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'AbortError'
  )
}

export async function lookupWeather(
  name: string,
  signal?: AbortSignal,
): Promise<WeatherLookupResult> {
  try {
    const city = await searchCity(name, signal)

    if (!city) {
      return { status: 'city-not-found' }
    }

    const weather = await getCurrentWeather(city, signal)

    if (!weather) {
      return { status: 'weather-unavailable', cityName: city.name }
    }

    return {
      status: 'success',
      data: { city, weather },
    }
  } catch (error) {
    if (isAbortError(error)) {
      throw error
    }

    if (error instanceof OpenMeteoRequestError) {
      return { status: 'network-error' }
    }

    if (import.meta.env.DEV) {
      console.error(error)
    }

    return { status: 'network-error' }
  }
}
