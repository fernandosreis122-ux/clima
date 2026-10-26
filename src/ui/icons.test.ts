// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'

import { createIcon } from './icons'
import type { IconName } from './icons'

const iconNames: IconName[] = [
  'search',
  'sun',
  'moon',
  'cloud-sun',
  'cloud-moon',
  'cloud',
  'fog',
  'drizzle',
  'freezing-drizzle',
  'rain',
  'freezing-rain',
  'snow',
  'snow-grains',
  'rain-showers',
  'snow-showers',
  'thunderstorm',
  'thunderstorm-hail',
  'unknown',
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
]

const weatherIconNames: IconName[] = [
  'sun',
  'moon',
  'cloud-sun',
  'cloud-moon',
  'cloud',
  'fog',
  'drizzle',
  'freezing-drizzle',
  'rain',
  'freezing-rain',
  'snow',
  'snow-grains',
  'rain-showers',
  'snow-showers',
  'thunderstorm',
  'thunderstorm-hail',
  'unknown',
]

afterEach(() => {
  document.body.replaceChildren()
})

describe('createIcon', () => {
  it.each(iconNames)('cria o SVG inline de %s', (name) => {
    const icon = createIcon(name)

    expect(icon.tagName.toLowerCase()).toBe('svg')
    expect(icon.getAttribute('viewBox')).toBe(
      weatherIconNames.includes(name) ? '0 0 64 64' : '0 0 24 24',
    )
    expect(icon.getAttribute('fill')).toBe('none')
    expect(icon.getAttribute('stroke')).toBe('currentColor')
    expect(icon.getAttribute('stroke-width')).toBe(
      weatherIconNames.includes(name) ? '1.5' : '1.75',
    )
    expect(icon.getAttribute('stroke-linecap')).toBe('round')
    expect(icon.getAttribute('stroke-linejoin')).toBe('round')
    expect(icon.getAttribute('aria-hidden')).toBe('true')
    expect(icon.getAttribute('focusable')).toBe('false')
    expect(icon.classList.contains('icon')).toBe(true)
    expect(icon.classList.contains(`icon--${name}`)).toBe(true)
    expect(icon.children.length).toBeGreaterThan(0)
    expect(icon.textContent).toBe('')
  })

  it('não usa imagens ou emojis no conjunto de ícones', () => {
    for (const name of iconNames) {
      const icon = createIcon(name)
      document.body.append(icon)
    }

    expect(document.querySelector('img')).toBeNull()
    expect(document.body.textContent).toBe('')
  })
})
