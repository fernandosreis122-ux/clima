import type { WeatherSnapshot } from '../domain/types'

export type AppState =
  | { status: 'empty' }
  | { status: 'loading'; query: string }
  | { status: 'success'; query: string; data: WeatherSnapshot }
  | { status: 'city-not-found'; query: string }
  | { status: 'weather-unavailable'; query: string; cityName: string }
  | { status: 'network-error'; query: string }
