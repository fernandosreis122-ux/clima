import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { City, CurrentWeather } from '../domain/types'
import {
  getCurrentWeather,
  OpenMeteoRequestError,
  searchCity,
} from './open-meteo'
import { lookupWeather } from './weather-lookup'

vi.mock('./open-meteo', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./open-meteo')>()

  return {
    ...actual,
    searchCity: vi.fn(),
    getCurrentWeather: vi.fn(),
  }
})

const searchCityMock = vi.mocked(searchCity)
const getCurrentWeatherMock = vi.mocked(getCurrentWeather)

const city: City = {
  name: 'Rio de Janeiro',
  latitude: -22.90278,
  longitude: -43.2075,
  countryCode: 'BR',
  timezone: 'America/Sao_Paulo',
}

const weather: CurrentWeather = {
  observedAtLocal: '2026-06-17T09:45',
  temperature: 19,
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
}

beforeEach(() => {
  searchCityMock.mockReset()
  getCurrentWeatherMock.mockReset()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('lookupWeather', () => {
  it('executa geocodificação e clima na ordem, com o mesmo signal', async () => {
    const controller = new AbortController()
    searchCityMock.mockResolvedValue(city)
    getCurrentWeatherMock.mockResolvedValue(weather)

    await expect(
      lookupWeather('  Rio de Janeiro  ', controller.signal),
    ).resolves.toEqual({
      status: 'success',
      data: { city, weather },
    })

    expect(searchCityMock).toHaveBeenCalledWith(
      '  Rio de Janeiro  ',
      controller.signal,
    )
    expect(getCurrentWeatherMock).toHaveBeenCalledWith(
      city,
      controller.signal,
    )
    expect(searchCityMock.mock.invocationCallOrder[0]).toBeLessThan(
      getCurrentWeatherMock.mock.invocationCallOrder[0],
    )
  })

  it('retorna city-not-found sem consultar o clima', async () => {
    searchCityMock.mockResolvedValue(null)

    await expect(lookupWeather('Atlântida')).resolves.toEqual({
      status: 'city-not-found',
    })

    expect(searchCityMock).toHaveBeenCalledWith('Atlântida', undefined)
    expect(getCurrentWeatherMock).not.toHaveBeenCalled()
  })

  it('retorna weather-unavailable com o nome canônico da cidade', async () => {
    searchCityMock.mockResolvedValue(city)
    getCurrentWeatherMock.mockResolvedValue(null)

    await expect(lookupWeather('rio')).resolves.toEqual({
      status: 'weather-unavailable',
      cityName: 'Rio de Janeiro',
    })

    expect(getCurrentWeatherMock).toHaveBeenCalledWith(city, undefined)
  })

  it('retorna network-error quando a geocodificação falha na rede', async () => {
    searchCityMock.mockRejectedValue(
      new OpenMeteoRequestError('geocoding', 500),
    )

    await expect(lookupWeather('Rio')).resolves.toEqual({
      status: 'network-error',
    })

    expect(getCurrentWeatherMock).not.toHaveBeenCalled()
  })

  it('retorna network-error quando o clima falha na rede', async () => {
    searchCityMock.mockResolvedValue(city)
    getCurrentWeatherMock.mockRejectedValue(
      new OpenMeteoRequestError('forecast', 503),
    )

    await expect(lookupWeather('Rio')).resolves.toEqual({
      status: 'network-error',
    })
  })

  it('retorna network-error e registra erro inesperado em desenvolvimento', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    searchCityMock.mockRejectedValue(new Error('falha inesperada'))

    await expect(lookupWeather('Rio')).resolves.toEqual({
      status: 'network-error',
    })

    expect(consoleError).toHaveBeenCalledTimes(1)
  })

  it('retorna network-error para erro inesperado no clima', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    searchCityMock.mockResolvedValue(city)
    getCurrentWeatherMock.mockRejectedValue(new Error('falha inesperada'))

    await expect(lookupWeather('Rio')).resolves.toEqual({
      status: 'network-error',
    })

    expect(consoleError).toHaveBeenCalledTimes(1)
  })

  it('não registra OpenMeteoRequestError', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    searchCityMock.mockRejectedValue(
      new OpenMeteoRequestError('geocoding', 404),
    )

    await expect(lookupWeather('Rio')).resolves.toEqual({
      status: 'network-error',
    })

    expect(consoleError).not.toHaveBeenCalled()
  })

  it('propaga AbortError da geocodificação sem convertê-lo', async () => {
    const abortError = new DOMException('Abortado', 'AbortError')
    searchCityMock.mockRejectedValue(abortError)

    await expect(lookupWeather('Rio')).rejects.toBe(abortError)
    expect(getCurrentWeatherMock).not.toHaveBeenCalled()
  })

  it('propaga AbortError do clima sem convertê-lo', async () => {
    const abortError = new DOMException('Abortado', 'AbortError')
    searchCityMock.mockResolvedValue(city)
    getCurrentWeatherMock.mockRejectedValue(abortError)

    await expect(lookupWeather('Rio')).rejects.toBe(abortError)
  })
})
