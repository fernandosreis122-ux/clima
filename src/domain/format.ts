const CARDINALS = [
  'N',
  'NNE',
  'NE',
  'ENE',
  'L',
  'ESE',
  'SE',
  'SSE',
  'S',
  'SSO',
  'SO',
  'OSO',
  'O',
  'ONO',
  'NO',
  'NNO',
] as const

const LOCAL_ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/

const DATE_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
})

const TIME_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'UTC',
})

export function parseLocalIso(value: string): Date | null {
  const match = LOCAL_ISO_PATTERN.exec(value)

  if (!match) {
    return null
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const hour = Number(match[4])
  const minute = Number(match[5])

  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null
  }

  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  date.setUTCHours(hour, minute, 0, 0)

  const isValidDate =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day &&
    date.getUTCHours() === hour &&
    date.getUTCMinutes() === minute

  return isValidDate ? date : null
}

export function formatLocalDate(date: Date): string {
  const formatted = DATE_FORMATTER.format(date)

  return `${formatted.charAt(0).toUpperCase()}${formatted.slice(1)}`
}

export function formatLocalTime(date: Date): string {
  return TIME_FORMATTER.format(date)
}

export function formatNumber(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

export function joinValueAndUnit(value: string, unit: string): string {
  if (unit === '%' || unit === '°') {
    return `${value}${unit}`
  }

  return `${value}\u00A0${unit}`
}

export function formatMeasurement(
  value: number,
  unit: string,
  fractionDigits = 0,
): string {
  return joinValueAndUnit(formatNumber(value, fractionDigits), unit)
}

export function degreesToCardinal(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360
  const index = Math.round(normalized / 22.5) % 16

  return CARDINALS[index] ?? 'N'
}

export function formatWindDirection(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360
  const displayDegrees = Math.round(normalized) % 360

  return `de ${degreesToCardinal(degrees)} · ${formatMeasurement(displayDegrees, '°')}`
}
