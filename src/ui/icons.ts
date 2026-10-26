import type { WeatherIconKey } from '../domain/weather-codes'

export type UtilityIconName =
  | 'search'
  | 'droplet'
  | 'thermometer'
  | 'umbrella'
  | 'wind'
  | 'map-pin-off'
  | 'cloud-off'
  | 'wifi-off'
  | 'alert-circle'
  | 'refresh'
  | 'spinner'

export type IconName = WeatherIconKey | UtilityIconName

type IconShape =
  | {
      tag: 'path'
      d: string
      transform?: string
    }
  | {
      tag: 'circle'
      cx: number
      cy: number
      r: number
      transform?: string
    }
  | {
      tag: 'line'
      x1: number
      y1: number
      x2: number
      y2: number
      transform?: string
    }

const SVG_NS = 'http://www.w3.org/2000/svg'

const UTILITY_ICONS: ReadonlySet<IconName> = new Set<IconName>([
  'search',
  'droplet',
  'thermometer',
  'umbrella',
  'wind',
  'map-pin-off',
  'cloud-off',
  'wifi-off',
  'alert-circle',
  'refresh',
  'spinner',
])

function sun(
  cx: number,
  cy: number,
  radius: number,
  innerRay: number,
  outerRay: number,
): IconShape[] {
  const rays = Array.from({ length: 8 }, (_, index): IconShape => {
    const angle = (Math.PI / 4) * index
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)

    return {
      tag: 'line',
      x1: cx + cos * innerRay,
      y1: cy + sin * innerRay,
      x2: cx + cos * outerRay,
      y2: cy + sin * outerRay,
    }
  })

  return [{ tag: 'circle', cx, cy, r: radius }, ...rays]
}

const CLOUD_PATH =
  'M16 45h32a9 9 0 0 0 1-17.9A14 14 0 0 0 20 29.2 8 8 0 0 0 16 45Z'

const MOON_PATH =
  'M40 13a19 19 0 1 0 11 32 16 16 0 0 1-11-32Z'

function cloud(transform?: string): IconShape {
  return { tag: 'path', d: CLOUD_PATH, transform }
}

function moon(transform?: string): IconShape {
  return { tag: 'path', d: MOON_PATH, transform }
}

function rainLines(): IconShape[] {
  return [
    { tag: 'line', x1: 23, y1: 49, x2: 19, y2: 57 },
    { tag: 'line', x1: 33, y1: 49, x2: 29, y2: 57 },
    { tag: 'line', x1: 43, y1: 49, x2: 39, y2: 57 },
  ]
}

function drizzleLines(): IconShape[] {
  return [
    { tag: 'line', x1: 23, y1: 50, x2: 21, y2: 55 },
    { tag: 'line', x1: 33, y1: 50, x2: 31, y2: 55 },
    { tag: 'line', x1: 43, y1: 50, x2: 41, y2: 55 },
  ]
}

function snowFlakes(): IconShape[] {
  const points = [
    [22, 52],
    [32, 58],
    [42, 52],
  ]

  return points.flatMap(([x, y]): IconShape[] => [
    { tag: 'line', x1: x - 2.5, y1: y, x2: x + 2.5, y2: y },
    { tag: 'line', x1: x, y1: y - 2.5, x2: x, y2: y + 2.5 },
  ])
}

function snowGrains(): IconShape[] {
  return [
    { tag: 'circle', cx: 22, cy: 53, r: 1.5 },
    { tag: 'circle', cx: 32, cy: 58, r: 1.5 },
    { tag: 'circle', cx: 42, cy: 53, r: 1.5 },
  ]
}

const LIGHTNING: IconShape = {
  tag: 'path',
  d: 'm32 47-5 8h6l-3 8 9-11h-6l3-5',
}

const ICONS: Record<IconName, IconShape[]> = {
  search: [
    { tag: 'circle', cx: 11, cy: 11, r: 7 },
    { tag: 'line', x1: 16.5, y1: 16.5, x2: 21, y2: 21 },
  ],
  droplet: [
    {
      tag: 'path',
      d: 'M12 3.5S17.5 9.6 17.5 13.7a5.5 5.5 0 0 1-11 0C6.5 9.6 12 3.5 12 3.5Z',
    },
  ],
  thermometer: [
    {
      tag: 'path',
      d: 'M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0Z',
    },
    { tag: 'line', x1: 12, y1: 8, x2: 12, y2: 16 },
    { tag: 'circle', cx: 12, cy: 18.5, r: 1.25 },
  ],
  umbrella: [
    { tag: 'path', d: 'M3.5 12a8.5 8.5 0 0 1 17 0Z' },
    { tag: 'line', x1: 12, y1: 3.5, x2: 12, y2: 19 },
    { tag: 'path', d: 'M12 19a2 2 0 0 1-4 0' },
  ],
  wind: [
    { tag: 'path', d: 'M3 8h11a3 3 0 1 0-3-3' },
    { tag: 'path', d: 'M3 12h15a3 3 0 1 1-3 3' },
    { tag: 'path', d: 'M3 16h8' },
  ],
  'map-pin-off': [
    {
      tag: 'path',
      d: 'M9.5 4.6A7 7 0 0 1 19 10c0 2.4-1.3 4.7-2.8 6.5',
    },
    {
      tag: 'path',
      d: 'M12 21s-7-6.1-7-11c0-.9.2-1.8.5-2.6',
    },
    { tag: 'line', x1: 3, y1: 3, x2: 21, y2: 21 },
  ],
  'cloud-off': [
    {
      tag: 'path',
      d: 'M7.4 8.6A6 6 0 0 0 6 18h11a4 4 0 0 0 .9-7.9',
    },
    { tag: 'line', x1: 3, y1: 3, x2: 21, y2: 21 },
  ],
  'wifi-off': [
    { tag: 'path', d: 'M2.5 8.5a15 15 0 0 1 7-3.5' },
    { tag: 'path', d: 'M14.5 5a15 15 0 0 1 7 3.5' },
    { tag: 'path', d: 'M5.5 12a10 10 0 0 1 4-2.2' },
    { tag: 'path', d: 'M14.6 9.8a10 10 0 0 1 3.9 2.2' },
    { tag: 'path', d: 'M9 15.2a5 5 0 0 1 6 0' },
    { tag: 'circle', cx: 12, cy: 19, r: 0.75 },
    { tag: 'line', x1: 3, y1: 3, x2: 21, y2: 21 },
  ],
  'alert-circle': [
    { tag: 'circle', cx: 12, cy: 12, r: 9 },
    { tag: 'line', x1: 12, y1: 7.5, x2: 12, y2: 13 },
    { tag: 'circle', cx: 12, cy: 16.5, r: 0.75 },
  ],
  refresh: [
    { tag: 'path', d: 'M20 11a8 8 0 1 0 2 5' },
    { tag: 'path', d: 'M20 4v7h-7' },
  ],
  spinner: [
    {
      tag: 'path',
      d: 'M12 3a9 9 0 1 1-6.36 2.64',
    },
  ],
  sun: sun(32, 32, 10, 16, 22),
  moon: [moon()],
  'cloud-sun': [...sun(20, 20, 6, 10, 14), cloud('translate(8 8)')],
  'cloud-moon': [moon('translate(4 2) scale(.55)'), cloud('translate(10 10)')],
  cloud: [cloud()],
  fog: [
    cloud(),
    { tag: 'line', x1: 18, y1: 51, x2: 46, y2: 51 },
    { tag: 'line', x1: 22, y1: 57, x2: 42, y2: 57 },
  ],
  drizzle: [cloud(), ...drizzleLines()],
  'freezing-drizzle': [
    cloud(),
    ...drizzleLines(),
    { tag: 'circle', cx: 21, cy: 59, r: 1.25 },
    { tag: 'circle', cx: 31, cy: 59, r: 1.25 },
    { tag: 'circle', cx: 41, cy: 59, r: 1.25 },
  ],
  rain: [cloud(), ...rainLines()],
  'freezing-rain': [
    cloud(),
    { tag: 'line', x1: 23, y1: 49, x2: 20, y2: 55 },
    { tag: 'line', x1: 33, y1: 49, x2: 30, y2: 55 },
    { tag: 'line', x1: 43, y1: 49, x2: 40, y2: 55 },
    { tag: 'circle', cx: 20, cy: 59, r: 1.25 },
    { tag: 'circle', cx: 30, cy: 59, r: 1.25 },
    { tag: 'circle', cx: 40, cy: 59, r: 1.25 },
  ],
  snow: [cloud(), ...snowFlakes()],
  'snow-grains': [cloud(), ...snowGrains()],
  'rain-showers': [
    ...sun(20, 18, 5, 9, 13),
    cloud('translate(8 6)'),
    { tag: 'line', x1: 29, y1: 51, x2: 26, y2: 57 },
    { tag: 'line', x1: 39, y1: 51, x2: 36, y2: 57 },
    { tag: 'line', x1: 49, y1: 51, x2: 46, y2: 57 },
  ],
  'snow-showers': [
    ...sun(20, 18, 5, 9, 13),
    cloud('translate(8 6)'),
    { tag: 'line', x1: 29, y1: 51, x2: 33, y2: 51 },
    { tag: 'line', x1: 31, y1: 49, x2: 31, y2: 53 },
    { tag: 'line', x1: 41, y1: 56, x2: 45, y2: 56 },
    { tag: 'line', x1: 43, y1: 54, x2: 43, y2: 58 },
  ],
  thunderstorm: [cloud(), LIGHTNING],
  'thunderstorm-hail': [
    cloud(),
    LIGHTNING,
    { tag: 'circle', cx: 20, cy: 57, r: 1.5 },
    { tag: 'circle', cx: 45, cy: 55, r: 1.5 },
  ],
  unknown: [
    { tag: 'circle', cx: 32, cy: 32, r: 20 },
    {
      tag: 'path',
      d: 'M26 25a6 6 0 1 1 10 4c-2 2-4 3-4 7',
    },
    { tag: 'circle', cx: 32, cy: 45, r: 1.25 },
  ],
}

function appendShape(svg: SVGSVGElement, shape: IconShape): void {
  const node = document.createElementNS(SVG_NS, shape.tag)

  if (shape.tag === 'path') {
    node.setAttribute('d', shape.d)
  } else if (shape.tag === 'circle') {
    node.setAttribute('cx', String(shape.cx))
    node.setAttribute('cy', String(shape.cy))
    node.setAttribute('r', String(shape.r))
  } else {
    node.setAttribute('x1', String(shape.x1))
    node.setAttribute('y1', String(shape.y1))
    node.setAttribute('x2', String(shape.x2))
    node.setAttribute('y2', String(shape.y2))
  }

  if ('transform' in shape && shape.transform) {
    node.setAttribute('transform', shape.transform)
  }

  svg.append(node)
}

export function createIcon(name: IconName, className?: string): SVGSVGElement {
  const isWeatherIcon = !UTILITY_ICONS.has(name)
  const svg = document.createElementNS(SVG_NS, 'svg')

  svg.setAttribute('xmlns', SVG_NS)
  svg.setAttribute('viewBox', isWeatherIcon ? '0 0 64 64' : '0 0 24 24')
  svg.setAttribute('fill', 'none')
  svg.setAttribute('stroke', 'currentColor')
  svg.setAttribute('stroke-width', isWeatherIcon ? '1.5' : '1.75')
  svg.setAttribute('stroke-linecap', 'round')
  svg.setAttribute('stroke-linejoin', 'round')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('focusable', 'false')
  svg.classList.add('icon', `icon--${name}`)

  if (className) {
    svg.classList.add(className)
  }

  for (const shape of ICONS[name]) {
    appendShape(svg, shape)
  }

  return svg
}
