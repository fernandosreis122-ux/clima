import { describe, expect, it } from 'vitest'

import { getWeatherCodeInfo } from './weather-codes'
import type { WeatherIconKey } from './weather-codes'

type WeatherCodeCase = {
  code: number
  description: string
  dayIcon: WeatherIconKey
  nightIcon: WeatherIconKey
}

const weatherCodeCases: WeatherCodeCase[] = [
  { code: 0, description: 'Céu limpo', dayIcon: 'sun', nightIcon: 'moon' },
  {
    code: 1,
    description: 'Predominantemente limpo',
    dayIcon: 'cloud-sun',
    nightIcon: 'cloud-moon',
  },
  {
    code: 2,
    description: 'Parcialmente nublado',
    dayIcon: 'cloud-sun',
    nightIcon: 'cloud-moon',
  },
  { code: 3, description: 'Nublado', dayIcon: 'cloud', nightIcon: 'cloud' },
  { code: 45, description: 'Nevoeiro', dayIcon: 'fog', nightIcon: 'fog' },
  {
    code: 48,
    description: 'Nevoeiro com geada',
    dayIcon: 'fog',
    nightIcon: 'fog',
  },
  { code: 51, description: 'Garoa leve', dayIcon: 'drizzle', nightIcon: 'drizzle' },
  {
    code: 53,
    description: 'Garoa moderada',
    dayIcon: 'drizzle',
    nightIcon: 'drizzle',
  },
  { code: 55, description: 'Garoa densa', dayIcon: 'drizzle', nightIcon: 'drizzle' },
  {
    code: 56,
    description: 'Garoa congelante leve',
    dayIcon: 'freezing-drizzle',
    nightIcon: 'freezing-drizzle',
  },
  {
    code: 57,
    description: 'Garoa congelante densa',
    dayIcon: 'freezing-drizzle',
    nightIcon: 'freezing-drizzle',
  },
  { code: 61, description: 'Chuva leve', dayIcon: 'rain', nightIcon: 'rain' },
  { code: 63, description: 'Chuva moderada', dayIcon: 'rain', nightIcon: 'rain' },
  { code: 65, description: 'Chuva forte', dayIcon: 'rain', nightIcon: 'rain' },
  {
    code: 66,
    description: 'Chuva congelante leve',
    dayIcon: 'freezing-rain',
    nightIcon: 'freezing-rain',
  },
  {
    code: 67,
    description: 'Chuva congelante forte',
    dayIcon: 'freezing-rain',
    nightIcon: 'freezing-rain',
  },
  { code: 71, description: 'Neve leve', dayIcon: 'snow', nightIcon: 'snow' },
  { code: 73, description: 'Neve moderada', dayIcon: 'snow', nightIcon: 'snow' },
  { code: 75, description: 'Neve forte', dayIcon: 'snow', nightIcon: 'snow' },
  { code: 77, description: 'Grãos de neve', dayIcon: 'snow-grains', nightIcon: 'snow-grains' },
  {
    code: 80,
    description: 'Pancadas de chuva leves',
    dayIcon: 'rain-showers',
    nightIcon: 'rain-showers',
  },
  {
    code: 81,
    description: 'Pancadas de chuva moderadas',
    dayIcon: 'rain-showers',
    nightIcon: 'rain-showers',
  },
  {
    code: 82,
    description: 'Pancadas de chuva violentas',
    dayIcon: 'rain-showers',
    nightIcon: 'rain-showers',
  },
  {
    code: 85,
    description: 'Pancadas de neve leves',
    dayIcon: 'snow-showers',
    nightIcon: 'snow-showers',
  },
  {
    code: 86,
    description: 'Pancadas de neve fortes',
    dayIcon: 'snow-showers',
    nightIcon: 'snow-showers',
  },
  {
    code: 95,
    description: 'Tempestade leve ou moderada',
    dayIcon: 'thunderstorm',
    nightIcon: 'thunderstorm',
  },
  {
    code: 96,
    description: 'Tempestade com granizo leve',
    dayIcon: 'thunderstorm-hail',
    nightIcon: 'thunderstorm-hail',
  },
  {
    code: 99,
    description: 'Tempestade com granizo forte',
    dayIcon: 'thunderstorm-hail',
    nightIcon: 'thunderstorm-hail',
  },
]

describe('getWeatherCodeInfo', () => {
  it.each(weatherCodeCases)(
    'mapeia o código $code',
    ({ code, description, dayIcon, nightIcon }) => {
      expect(getWeatherCodeInfo(code, true)).toEqual({
        description,
        icon: dayIcon,
      })
      expect(getWeatherCodeInfo(code, false)).toEqual({
        description,
        icon: nightIcon,
      })
    },
  )

  it('aplica variantes dia/noite apenas aos códigos 0, 1 e 2', () => {
    for (const { code } of weatherCodeCases) {
      const dayIcon = getWeatherCodeInfo(code, true).icon
      const nightIcon = getWeatherCodeInfo(code, false).icon

      if (code === 0 || code === 1 || code === 2) {
        expect(nightIcon).not.toBe(dayIcon)
      } else {
        expect(nightIcon).toBe(dayIcon)
      }
    }
  })

  it.each([-1, 4, 100, 999])(
    'retorna condição desconhecida para o código %i',
    (code) => {
      expect(getWeatherCodeInfo(code, true)).toEqual({
        description: 'Condição desconhecida',
        icon: 'unknown',
      })
      expect(getWeatherCodeInfo(code, false)).toEqual({
        description: 'Condição desconhecida',
        icon: 'unknown',
      })
    },
  )
})
