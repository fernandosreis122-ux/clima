import { describe, expect, it } from 'vitest'

import {
  degreesToCardinal,
  formatLocalDate,
  formatLocalTime,
  formatMeasurement,
  formatNumber,
  formatWindDirection,
  joinValueAndUnit,
  parseLocalIso,
} from './format'

function parseValid(value: string): Date {
  const date = parseLocalIso(value)

  if (!date) {
    throw new Error(`Data inválida no teste: ${value}`)
  }

  return date
}

describe('parseLocalIso', () => {
  it('interpreta a data e a hora locais sem deslocar o fuso', () => {
    const date = parseValid('2026-06-17T09:45')

    expect(date.toISOString()).toBe('2026-06-17T09:45:00.000Z')
    expect(formatLocalDate(date)).toBe('Quarta-feira, 17 de junho')
    expect(formatLocalTime(date)).toBe('09:45')
  })

  it.each([
    ['2026-06-17T00:05', '00:05'],
    ['2026-06-17T23:55', '23:55'],
  ])('preserva o dia local no limite %s', (value, expectedTime) => {
    const date = parseValid(value)

    expect(formatLocalDate(date)).toBe('Quarta-feira, 17 de junho')
    expect(formatLocalTime(date)).toBe(expectedTime)
  })

  it('aceita uma data bissexta válida', () => {
    expect(parseValid('2024-02-29T12:00').toISOString()).toBe(
      '2024-02-29T12:00:00.000Z',
    )
  })

  it.each([
    '',
    '2026-06-17',
    '2026-06-17 09:45',
    '17/06/2026 09:45',
    '2026-13-01T00:00',
    '2026-00-17T09:45',
    '2026-02-29T00:00',
    '2026-04-31T00:00',
    '2026-06-17T24:00',
    '2026-06-17T09:60',
    '2026-06-17T09',
    '2026-06-17T9:45',
    'texto',
  ])('retorna null para entrada inválida: %s', (value) => {
    expect(parseLocalIso(value)).toBeNull()
  })
})

describe('formatNumber', () => {
  it.each<[number, number, string]>([
    [19, 0, '19'],
    [21.4, 1, '21,4'],
    [92, 0, '92'],
    [73, 0, '73'],
    [5.8, 1, '5,8'],
    [277, 0, '277'],
    [1234.5, 1, '1.234,5'],
    [-5.8, 1, '-5,8'],
  ])('formata %s com %i casa(s) decimal(is)', (value, fractionDigits, expected) => {
    expect(formatNumber(value, fractionDigits)).toBe(expected)
  })

  it.each<[number, number, string]>([
    [19.4, 0, '19'],
    [19.5, 0, '20'],
    [19.6, 0, '20'],
    [21.44, 1, '21,4'],
    [21.46, 1, '21,5'],
  ])('arredonda %s para %i casa(s) decimal(is)', (value, fractionDigits, expected) => {
    expect(formatNumber(value, fractionDigits)).toBe(expected)
  })
})

describe('unidades', () => {
  it('usa espaço não separável antes de °C e km/h', () => {
    expect(joinValueAndUnit('19', '°C')).toBe('19\u00A0°C')
    expect(joinValueAndUnit('5,8', 'km/h')).toBe('5,8\u00A0km/h')
  })

  it('cola % e ° ao número', () => {
    expect(joinValueAndUnit('92', '%')).toBe('92%')
    expect(joinValueAndUnit('277', '°')).toBe('277°')
  })

  it.each<[number, string, number, string]>([
    [19, '°C', 0, '19\u00A0°C'],
    [21.4, '°C', 1, '21,4\u00A0°C'],
    [92, '%', 0, '92%'],
    [73, '%', 0, '73%'],
    [5.8, 'km/h', 1, '5,8\u00A0km/h'],
    [277, '°', 0, '277°'],
  ])('formata %s %s com %i casa(s)', (value, unit, fractionDigits, expected) => {
    expect(formatMeasurement(value, unit, fractionDigits)).toBe(expected)
  })
})

describe('degreesToCardinal', () => {
  it.each<[number, string]>([
    [0, 'N'],
    [22.5, 'NNE'],
    [45, 'NE'],
    [67.5, 'ENE'],
    [90, 'L'],
    [112.5, 'ESE'],
    [135, 'SE'],
    [157.5, 'SSE'],
    [180, 'S'],
    [202.5, 'SSO'],
    [225, 'SO'],
    [247.5, 'OSO'],
    [270, 'O'],
    [292.5, 'ONO'],
    [315, 'NO'],
    [337.5, 'NNO'],
    [360, 'N'],
    [277, 'O'],
    [-90, 'O'],
  ])('converte %s° para %s', (degrees, expected) => {
    expect(degreesToCardinal(degrees)).toBe(expected)
  })
})

describe('formatWindDirection', () => {
  it.each<[number, string]>([
    [0, 'de N · 0°'],
    [22.5, 'de NNE · 23°'],
    [90, 'de L · 90°'],
    [277, 'de O · 277°'],
    [360, 'de N · 0°'],
  ])('compõe a linha do vento para %s°', (degrees, expected) => {
    expect(formatWindDirection(degrees)).toBe(expected)
  })
})
