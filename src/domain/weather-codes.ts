export type WeatherIconKey =
  | 'sun'
  | 'moon'
  | 'cloud-sun'
  | 'cloud-moon'
  | 'cloud'
  | 'fog'
  | 'drizzle'
  | 'freezing-drizzle'
  | 'rain'
  | 'freezing-rain'
  | 'snow'
  | 'snow-grains'
  | 'rain-showers'
  | 'snow-showers'
  | 'thunderstorm'
  | 'thunderstorm-hail'
  | 'unknown'

export type WeatherCodeInfo = {
  description: string
  icon: WeatherIconKey
}

type WeatherCodeEntry = WeatherCodeInfo & {
  nightIcon?: WeatherIconKey
}

const UNKNOWN_WEATHER: WeatherCodeInfo = {
  description: 'Condição desconhecida',
  icon: 'unknown',
}

const WEATHER_CODES: Readonly<Partial<Record<number, WeatherCodeEntry>>> = {
  0: { description: 'Céu limpo', icon: 'sun', nightIcon: 'moon' },
  1: {
    description: 'Predominantemente limpo',
    icon: 'cloud-sun',
    nightIcon: 'cloud-moon',
  },
  2: {
    description: 'Parcialmente nublado',
    icon: 'cloud-sun',
    nightIcon: 'cloud-moon',
  },
  3: { description: 'Nublado', icon: 'cloud' },
  45: { description: 'Nevoeiro', icon: 'fog' },
  48: { description: 'Nevoeiro com geada', icon: 'fog' },
  51: { description: 'Garoa leve', icon: 'drizzle' },
  53: { description: 'Garoa moderada', icon: 'drizzle' },
  55: { description: 'Garoa densa', icon: 'drizzle' },
  56: { description: 'Garoa congelante leve', icon: 'freezing-drizzle' },
  57: { description: 'Garoa congelante densa', icon: 'freezing-drizzle' },
  61: { description: 'Chuva leve', icon: 'rain' },
  63: { description: 'Chuva moderada', icon: 'rain' },
  65: { description: 'Chuva forte', icon: 'rain' },
  66: { description: 'Chuva congelante leve', icon: 'freezing-rain' },
  67: { description: 'Chuva congelante forte', icon: 'freezing-rain' },
  71: { description: 'Neve leve', icon: 'snow' },
  73: { description: 'Neve moderada', icon: 'snow' },
  75: { description: 'Neve forte', icon: 'snow' },
  77: { description: 'Grãos de neve', icon: 'snow-grains' },
  80: { description: 'Pancadas de chuva leves', icon: 'rain-showers' },
  81: { description: 'Pancadas de chuva moderadas', icon: 'rain-showers' },
  82: { description: 'Pancadas de chuva violentas', icon: 'rain-showers' },
  85: { description: 'Pancadas de neve leves', icon: 'snow-showers' },
  86: { description: 'Pancadas de neve fortes', icon: 'snow-showers' },
  95: { description: 'Tempestade leve ou moderada', icon: 'thunderstorm' },
  96: {
    description: 'Tempestade com granizo leve',
    icon: 'thunderstorm-hail',
  },
  99: {
    description: 'Tempestade com granizo forte',
    icon: 'thunderstorm-hail',
  },
}

export function getWeatherCodeInfo(code: number, isDay: boolean): WeatherCodeInfo {
  const entry = WEATHER_CODES[code]

  if (!entry) {
    return { ...UNKNOWN_WEATHER }
  }

  return {
    description: entry.description,
    icon: isDay ? entry.icon : (entry.nightIcon ?? entry.icon),
  }
}
