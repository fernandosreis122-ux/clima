export type City = {
  name: string
  latitude: number
  longitude: number
  countryCode: string
  timezone: string
}

export type WeatherUnits = {
  temperature: string
  apparentTemperature: string
  humidity: string
  precipitationProbability: string
  windSpeed: string
  windDirection: string
}

export type CurrentWeather = {
  observedAtLocal: string
  temperature: number
  apparentTemperature: number
  humidity: number
  precipitationProbability: number
  isDay: boolean
  windSpeed: number
  windDirection: number
  weatherCode: number
  units: WeatherUnits
}

export type WeatherSnapshot = {
  city: City
  weather: CurrentWeather
}

export type WeatherLookupResult =
  | { status: 'success'; data: WeatherSnapshot }
  | { status: 'city-not-found' }
  | { status: 'weather-unavailable'; cityName: string }
  | { status: 'network-error' }
