import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { City } from '../domain/types'
import {
  getCurrentWeather,
  OpenMeteoRequestError,
  searchCity,
} from './open-meteo'

const validResult = {
  name: 'Rio de Janeiro',
  latitude: -22.90278,
  longitude: -43.2075,
  country_code: 'BR',
  timezone: 'America/Sao_Paulo',
}

const validCity: City = {
  name: 'Rio de Janeiro',
  latitude: -22.90278,
  longitude: -43.2075,
  countryCode: 'BR',
  timezone: 'America/Sao_Paulo',
}

const validCurrent = {
  time: '2026-06-17T09:45',
  temperature_2m: 19,
  relative_humidity_2m: 92,
  apparent_temperature: 21.4,
  is_day: 1,
  wind_speed_10m: 5.8,
  wind_direction_10m: 277,
  precipitation_probability: 73,
  precipitation: 0,
  weather_code: 2,
}

const validCurrentUnits = {
  time: 'iso8601',
  temperature_2m: '°C',
  relative_humidity_2m: '%',
  apparent_temperature: '°C',
  is_day: '',
  precipitation_probability: '%',
  precipitation: 'mm',
  wind_speed_10m: 'km/h',
  wind_direction_10m: '°',
  weather_code: 'wmo code',
}

const expectedWeather = {
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

const fetchMock = vi.fn<typeof fetch>()

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function responseWithJson(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => body,
  } as Response
}

function withoutKey(
  object: Record<string, unknown>,
  key: string,
): Record<string, unknown> {
  const copy = { ...object }
  delete copy[key]
  return copy
}

function firstFetchUrl(): URL {
  const call = fetchMock.mock.calls[0]

  if (!call) {
    throw new Error('fetch não foi chamado')
  }

  return new URL(String(call[0]))
}

async function captureError(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise
  } catch (error) {
    return error
  }

  throw new Error('A promise deveria ser rejeitada')
}

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('searchCity', () => {
  it('retorna a cidade canônica do primeiro resultado', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ results: [validResult] }))

    await expect(searchCity('rio')).resolves.toEqual({
      name: 'Rio de Janeiro',
      latitude: -22.90278,
      longitude: -43.2075,
      countryCode: 'BR',
      timezone: 'America/Sao_Paulo',
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it.each([undefined, null, 42, {}, '', '   '])(
    'retorna null e não chama fetch para nome inválido: %o',
    async (name) => {
      await expect(searchCity(name as string)).resolves.toBeNull()
      expect(fetchMock).not.toHaveBeenCalled()
    },
  )

  it('monta a URL de geocodificação com os parâmetros fixos', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ results: [validResult] }))

    await searchCity('  São Paulo & Rio  ')

    const url = firstFetchUrl()
    expect(url.origin + url.pathname).toBe(
      'https://geocoding-api.open-meteo.com/v1/search',
    )
    expect(url.searchParams.get('name')).toBe('São Paulo & Rio')
    expect(url.searchParams.get('count')).toBe('1')
    expect(url.searchParams.get('language')).toBe('pt')
    expect(url.searchParams.get('format')).toBe('json')
    expect(url.search).not.toContain('count=2')
  })

  it('envia signal, cache e Accept para o fetch', async () => {
    const controller = new AbortController()
    fetchMock.mockResolvedValue(jsonResponse({ results: [validResult] }))

    await searchCity('Rio de Janeiro', controller.signal)

    const call = fetchMock.mock.calls[0]
    expect(call).toBeDefined()
    expect(call?.[1]).toMatchObject({
      signal: controller.signal,
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
  })

  it.each([
    ['results ausente', {}],
    ['results nulo', { results: null }],
    ['results vazio', { results: [] }],
    ['results não-array', { results: {} }],
    ['corpo não-objeto', []],
    ['corpo nulo', null],
  ])('retorna null quando %s', async (_label, body) => {
    fetchMock.mockResolvedValue(jsonResponse(body))

    await expect(searchCity('Rio')).resolves.toBeNull()
  })

  it.each([
    ['nome vazio', { name: '' }],
    ['nome em branco', { name: '   ' }],
    ['nome não-string', { name: 42 }],
    ['nome ausente', { name: undefined }],
    ['latitude acima do limite', { latitude: 90.1 }],
    ['latitude abaixo do limite', { latitude: -90.1 }],
    ['latitude não-numérica', { latitude: '10' }],
    ['latitude ausente', { latitude: undefined }],
    ['longitude acima do limite', { longitude: 180.1 }],
    ['longitude abaixo do limite', { longitude: -180.1 }],
    ['longitude não-numérica', { longitude: '10' }],
    ['longitude ausente', { longitude: undefined }],
    ['country_code vazio', { country_code: '' }],
    ['country_code em branco', { country_code: '   ' }],
    ['country_code não-string', { country_code: 42 }],
    ['country_code ausente', { country_code: undefined }],
    ['timezone vazio', { timezone: '' }],
    ['timezone inválido', { timezone: 'Invalid/Zone' }],
    ['timezone não-string', { timezone: 42 }],
    ['timezone ausente', { timezone: undefined }],
  ])('retorna null para %s', async (_label, override) => {
    fetchMock.mockResolvedValue(
      jsonResponse({ results: [{ ...validResult, ...override }] }),
    )

    await expect(searchCity('Rio')).resolves.toBeNull()
  })

  it('considera apenas o primeiro resultado', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        results: [
          { ...validResult, latitude: 100 },
          { ...validResult, name: 'Segunda cidade' },
        ],
      }),
    )

    await expect(searchCity('Rio')).resolves.toBeNull()
  })

  it('ignora resultados posteriores quando o primeiro é válido', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        results: [
          validResult,
          { ...validResult, name: 'Segunda cidade', longitude: 999 },
        ],
      }),
    )

    await expect(searchCity('Rio')).resolves.toMatchObject({
      name: 'Rio de Janeiro',
    })
  })

  it('preserva o country_code como veio da API', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ results: [{ ...validResult, country_code: 'br' }] }),
    )

    await expect(searchCity('Rio')).resolves.toMatchObject({
      countryCode: 'br',
    })
  })

  it('lança OpenMeteoRequestError para HTTP não-2xx', async () => {
    fetchMock.mockResolvedValue(new Response('', { status: 500 }))

    const error = await captureError(searchCity('Rio'))

    expect(error).toBeInstanceOf(OpenMeteoRequestError)
    expect(error).toMatchObject({
      endpoint: 'geocoding',
      status: 500,
    })
  })

  it('lança OpenMeteoRequestError para falha de rede', async () => {
    const cause = new TypeError('Failed to fetch')
    fetchMock.mockRejectedValue(cause)

    const error = await captureError(searchCity('Rio'))

    expect(error).toBeInstanceOf(OpenMeteoRequestError)
    expect(error).toMatchObject({ endpoint: 'geocoding' })
    expect((error as OpenMeteoRequestError).status).toBeUndefined()
    expect((error as OpenMeteoRequestError).cause).toBe(cause)
  })

  it('lança OpenMeteoRequestError para JSON inválido', async () => {
    fetchMock.mockResolvedValue(
      new Response('{not valid json', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const error = await captureError(searchCity('Rio'))

    expect(error).toBeInstanceOf(OpenMeteoRequestError)
    expect(error).toMatchObject({
      endpoint: 'geocoding',
      status: 200,
    })
    expect((error as OpenMeteoRequestError).cause).toBeInstanceOf(SyntaxError)
  })

  it('propaga AbortError sem convertê-lo', async () => {
    const abortError = new DOMException('Abortado', 'AbortError')
    fetchMock.mockRejectedValue(abortError)

    await expect(searchCity('Rio')).rejects.toBe(abortError)
  })
})

describe('getCurrentWeather', () => {
  it('mapeia a resposta de exemplo para CurrentWeather', async () => {
    fetchMock.mockResolvedValue(
      responseWithJson({
        current: validCurrent,
        current_units: validCurrentUnits,
      }),
    )

    await expect(getCurrentWeather(validCity)).resolves.toEqual(expectedWeather)
  })

  it.each([
    [0, false],
    [1, true],
  ])('converte is_day %i em %s', async (isDay, expected) => {
    fetchMock.mockResolvedValue(
      responseWithJson({
        current: { ...validCurrent, is_day: isDay },
        current_units: validCurrentUnits,
      }),
    )

    const weather = await getCurrentWeather(validCity)

    expect(weather?.isDay).toBe(expected)
  })

  it('monta a URL de forecast e envia as opções de fetch', async () => {
    const controller = new AbortController()
    fetchMock.mockResolvedValue(
      responseWithJson({
        current: validCurrent,
        current_units: validCurrentUnits,
      }),
    )

    await getCurrentWeather(validCity, controller.signal)

    const url = firstFetchUrl()
    expect(url.origin + url.pathname).toBe(
      'https://api.open-meteo.com/v1/forecast',
    )
    expect(url.searchParams.get('latitude')).toBe('-22.90278')
    expect(url.searchParams.get('longitude')).toBe('-43.2075')
    expect(url.searchParams.get('timezone')).toBe('America/Sao_Paulo')
    expect(url.searchParams.get('current')).toBe(
      'precipitation_probability,temperature_2m,relative_humidity_2m,apparent_temperature,is_day,wind_speed_10m,wind_direction_10m,precipitation,weather_code',
    )

    const call = fetchMock.mock.calls[0]
    expect(call).toBeDefined()
    expect(call?.[1]).toMatchObject({
      signal: controller.signal,
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
  })

  it.each([
    ['cidade nula', null],
    ['cidade indefinida', undefined],
    ['cidade vazia', {}],
    ['latitude ausente', { ...validCity, latitude: undefined }],
    ['latitude NaN', { ...validCity, latitude: Number.NaN }],
    ['latitude infinita', { ...validCity, latitude: Number.POSITIVE_INFINITY }],
    ['latitude acima do limite', { ...validCity, latitude: 91 }],
    ['latitude abaixo do limite', { ...validCity, latitude: -91 }],
    ['latitude string', { ...validCity, latitude: '10' }],
    ['longitude ausente', { ...validCity, longitude: undefined }],
    ['longitude NaN', { ...validCity, longitude: Number.NaN }],
    ['longitude infinita', { ...validCity, longitude: Number.POSITIVE_INFINITY }],
    ['longitude acima do limite', { ...validCity, longitude: 181 }],
    ['longitude abaixo do limite', { ...validCity, longitude: -181 }],
    ['longitude string', { ...validCity, longitude: '10' }],
    ['timezone ausente', { ...validCity, timezone: undefined }],
    ['timezone vazio', { ...validCity, timezone: '' }],
    ['timezone inválido', { ...validCity, timezone: 'Invalid/Zone' }],
    ['timezone não-string', { ...validCity, timezone: 42 }],
  ])('retorna null sem fetch para %s', async (_label, city) => {
    await expect(getCurrentWeather(city as City)).resolves.toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it.each([
    ['current ausente', { current_units: validCurrentUnits }],
    ['current nulo', { current: null, current_units: validCurrentUnits }],
    ['current array', { current: [], current_units: validCurrentUnits }],
    ['current primitivo', { current: 'x', current_units: validCurrentUnits }],
  ])('retorna null quando %s', async (_label, body) => {
    fetchMock.mockResolvedValue(responseWithJson(body))

    await expect(getCurrentWeather(validCity)).resolves.toBeNull()
  })

  it.each([
    ['time ausente', { time: undefined }],
    ['time não-string', { time: 42 }],
    ['time fora do formato ISO', { time: '17/06/2026 09:45' }],
    ['time com data inválida', { time: '2026-02-30T09:45' }],
    ['temperatura ausente', { temperature_2m: undefined }],
    ['temperatura NaN', { temperature_2m: Number.NaN }],
    ['temperatura infinita', { temperature_2m: Number.POSITIVE_INFINITY }],
    ['temperatura string', { temperature_2m: '19' }],
    ['umidade ausente', { relative_humidity_2m: undefined }],
    ['umidade abaixo do limite', { relative_humidity_2m: -1 }],
    ['umidade acima do limite', { relative_humidity_2m: 101 }],
    ['umidade NaN', { relative_humidity_2m: Number.NaN }],
    ['umidade string', { relative_humidity_2m: '92' }],
    ['sensação ausente', { apparent_temperature: undefined }],
    ['sensação NaN', { apparent_temperature: Number.NaN }],
    ['sensação infinita', { apparent_temperature: Number.POSITIVE_INFINITY }],
    ['sensação string', { apparent_temperature: '21.4' }],
    ['is_day ausente', { is_day: undefined }],
    ['is_day inválido', { is_day: 2 }],
    ['is_day negativo', { is_day: -1 }],
    ['is_day string', { is_day: '1' }],
    ['is_day booleano', { is_day: true }],
    ['vento ausente', { wind_speed_10m: undefined }],
    ['vento negativo', { wind_speed_10m: -1 }],
    ['vento NaN', { wind_speed_10m: Number.NaN }],
    ['vento infinito', { wind_speed_10m: Number.POSITIVE_INFINITY }],
    ['vento string', { wind_speed_10m: '5.8' }],
    ['direção ausente', { wind_direction_10m: undefined }],
    ['direção abaixo do limite', { wind_direction_10m: -1 }],
    ['direção acima do limite', { wind_direction_10m: 361 }],
    ['direção NaN', { wind_direction_10m: Number.NaN }],
    ['direção string', { wind_direction_10m: '277' }],
    ['probabilidade ausente', { precipitation_probability: undefined }],
    ['probabilidade abaixo do limite', { precipitation_probability: -1 }],
    ['probabilidade acima do limite', { precipitation_probability: 101 }],
    ['probabilidade NaN', { precipitation_probability: Number.NaN }],
    ['probabilidade string', { precipitation_probability: '73' }],
    ['weather_code ausente', { weather_code: undefined }],
    ['weather_code não-inteiro', { weather_code: 2.5 }],
    ['weather_code string', { weather_code: '2' }],
    ['weather_code NaN', { weather_code: Number.NaN }],
  ])('retorna null para campo obrigatório inválido: %s', async (_label, override) => {
    fetchMock.mockResolvedValue(
      responseWithJson({
        current: { ...validCurrent, ...override },
        current_units: validCurrentUnits,
      }),
    )

    await expect(getCurrentWeather(validCity)).resolves.toBeNull()
  })

  it.each([
    ['umidade 0', { relative_humidity_2m: 0 }],
    ['umidade 100', { relative_humidity_2m: 100 }],
    ['vento 0', { wind_speed_10m: 0 }],
    ['direção 0', { wind_direction_10m: 0 }],
    ['direção 360', { wind_direction_10m: 360 }],
    ['probabilidade 0', { precipitation_probability: 0 }],
    ['probabilidade 100', { precipitation_probability: 100 }],
  ])('aceita o limite válido de %s', async (_label, override) => {
    fetchMock.mockResolvedValue(
      responseWithJson({
        current: { ...validCurrent, ...override },
        current_units: validCurrentUnits,
      }),
    )

    await expect(getCurrentWeather(validCity)).resolves.not.toBeNull()
  })

  it('aceita weather_code desconhecido', async () => {
    fetchMock.mockResolvedValue(
      responseWithJson({
        current: { ...validCurrent, weather_code: 999 },
        current_units: validCurrentUnits,
      }),
    )

    await expect(getCurrentWeather(validCity)).resolves.toMatchObject({
      weatherCode: 999,
    })
  })

  it('não invalida o resultado quando precipitation está ausente', async () => {
    fetchMock.mockResolvedValue(
      responseWithJson({
        current: withoutKey(validCurrent, 'precipitation'),
        current_units: validCurrentUnits,
      }),
    )

    const weather = await getCurrentWeather(validCity)

    expect(weather).toEqual(expectedWeather)
    expect(weather).not.toHaveProperty('precipitation')
  })

  it('usa fallbacks quando current_units está ausente', async () => {
    fetchMock.mockResolvedValue(responseWithJson({ current: validCurrent }))

    await expect(getCurrentWeather(validCity)).resolves.toMatchObject({
      units: {
        temperature: '°C',
        apparentTemperature: '°C',
        humidity: '%',
        precipitationProbability: '%',
        windSpeed: 'km/h',
        windDirection: '°',
      },
    })
  })

  it('usa fallback por campo quando as unidades são parciais', async () => {
    fetchMock.mockResolvedValue(
      responseWithJson({
        current: validCurrent,
        current_units: {
          temperature_2m: '°F',
          wind_speed_10m: 'mph',
        },
      }),
    )

    await expect(getCurrentWeather(validCity)).resolves.toMatchObject({
      units: {
        temperature: '°F',
        apparentTemperature: '°C',
        humidity: '%',
        precipitationProbability: '%',
        windSpeed: 'mph',
        windDirection: '°',
      },
    })
  })

  it.each([
    ['objeto vazio', {}],
    ['unidades inválidas', {
      temperature_2m: 42,
      apparent_temperature: '   ',
      relative_humidity_2m: null,
      precipitation_probability: '',
      wind_speed_10m: false,
      wind_direction_10m: {},
    }],
    ['current_units não-objeto', 'inválido'],
  ])('usa fallbacks para %s', async (_label, currentUnits) => {
    fetchMock.mockResolvedValue(
      responseWithJson({
        current: validCurrent,
        current_units: currentUnits,
      }),
    )

    await expect(getCurrentWeather(validCity)).resolves.toMatchObject({
      units: {
        temperature: '°C',
        apparentTemperature: '°C',
        humidity: '%',
        precipitationProbability: '%',
        windSpeed: 'km/h',
        windDirection: '°',
      },
    })
  })

  it('lança OpenMeteoRequestError para HTTP não-2xx', async () => {
    fetchMock.mockResolvedValue(new Response('', { status: 503 }))

    const error = await captureError(getCurrentWeather(validCity))

    expect(error).toBeInstanceOf(OpenMeteoRequestError)
    expect(error).toMatchObject({
      endpoint: 'forecast',
      status: 503,
    })
  })

  it('lança OpenMeteoRequestError para falha de rede', async () => {
    const cause = new TypeError('Failed to fetch')
    fetchMock.mockRejectedValue(cause)

    const error = await captureError(getCurrentWeather(validCity))

    expect(error).toBeInstanceOf(OpenMeteoRequestError)
    expect(error).toMatchObject({ endpoint: 'forecast' })
    expect((error as OpenMeteoRequestError).status).toBeUndefined()
    expect((error as OpenMeteoRequestError).cause).toBe(cause)
  })

  it('lança OpenMeteoRequestError para JSON inválido', async () => {
    fetchMock.mockResolvedValue(
      new Response('{not valid json', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const error = await captureError(getCurrentWeather(validCity))

    expect(error).toBeInstanceOf(OpenMeteoRequestError)
    expect(error).toMatchObject({
      endpoint: 'forecast',
      status: 200,
    })
  })

  it('propaga AbortError sem convertê-lo', async () => {
    const abortError = new DOMException('Abortado', 'AbortError')
    fetchMock.mockRejectedValue(abortError)

    await expect(getCurrentWeather(validCity)).rejects.toBe(abortError)
  })
})
