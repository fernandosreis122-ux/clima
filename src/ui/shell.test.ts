// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  SEARCH_LOADING_LABEL,
  SEARCH_SUBMIT_LABEL,
  createShell,
  setSearchLoading,
} from './shell'

afterEach(() => {
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe('createShell', () => {
  it('monta a estrutura acessível da busca e do conteúdo', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const root = document.createElement('div')
    root.id = 'app'
    document.body.append(root)

    const shell = createShell(root)

    expect(root.classList.contains('app')).toBe(true)
    expect(root.querySelector('h1')?.textContent).toBe('Clima')
    expect(shell.form.getAttribute('role')).toBe('search')
    expect(shell.form.noValidate).toBe(true)
    expect(shell.form.querySelector('label')?.htmlFor).toBe('city')
    expect(shell.input.id).toBe('city')
    expect(shell.input.type).toBe('search')
    expect(shell.input.maxLength).toBe(80)
    expect(shell.input.autocomplete).toBe('off')
    expect(shell.input.placeholder).toBe('Digite o nome da cidade')
    expect(shell.input.value).toBe('')
    expect(shell.submitButton.type).toBe('submit')
    expect(shell.submitButton.textContent).toBe('Buscar')
    expect(shell.fieldError.hidden).toBe(true)
    expect(shell.fieldError.getAttribute('role')).toBe('alert')
    expect(shell.content.tagName).toBe('MAIN')
    expect(shell.content.id).toBe('content')
    expect(shell.content.getAttribute('aria-busy')).toBe('false')
    expect(shell.status.getAttribute('role')).toBe('status')
    expect(shell.status.getAttribute('aria-live')).toBe('polite')
    expect(document.activeElement).toBe(document.body)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('renderiza o ícone de busca como SVG decorativo', () => {
    const root = document.createElement('div')
    document.body.append(root)

    const shell = createShell(root)
    const icon = shell.form.querySelector('svg')

    expect(icon).not.toBeNull()
    expect(icon?.getAttribute('viewBox')).toBe('0 0 24 24')
    expect(icon?.getAttribute('fill')).toBe('none')
    expect(icon?.getAttribute('stroke')).toBe('currentColor')
    expect(icon?.getAttribute('stroke-width')).toBe('1.75')
    expect(icon?.getAttribute('aria-hidden')).toBe('true')
    expect(icon?.classList.contains('icon--search')).toBe(true)
  })

  it('exibe a atribuição com link seguro em nova aba', () => {
    const root = document.createElement('div')
    document.body.append(root)

    const shell = createShell(root)
    const footer = shell.footer
    const link = footer.querySelector('a')

    expect(footer.textContent).toBe('Dados meteorológicos por Open-Meteo')
    expect(link?.textContent).toBe('Open-Meteo')
    expect(link?.href).toBe('https://open-meteo.com/')
    expect(link?.target).toBe('_blank')
    expect(link?.rel).toBe('noopener noreferrer')
  })

  it('alterna o botão de busca sem desabilitar o formulário', () => {
    const root = document.createElement('div')
    document.body.append(root)

    const shell = createShell(root)
    shell.input.value = 'São Paulo'
    shell.submitButton.focus()

    setSearchLoading(shell, true)

    expect(shell.submitButton.textContent).toBe(SEARCH_LOADING_LABEL)
    expect(shell.submitButton.querySelector('.search-control__spinner')).not.toBeNull()
    expect(shell.submitButton.getAttribute('aria-busy')).toBe('true')
    expect(shell.submitButton.disabled).toBe(false)
    expect(shell.submitButton).toBe(document.activeElement)
    expect(shell.input.disabled).toBe(false)
    expect(shell.input.value).toBe('São Paulo')

    setSearchLoading(shell, false)

    expect(shell.submitButton.textContent).toBe(SEARCH_SUBMIT_LABEL)
    expect(shell.submitButton.querySelector('.search-control__spinner')).toBeNull()
    expect(shell.submitButton.getAttribute('aria-busy')).toBe('false')
    expect(shell.submitButton).toBe(document.activeElement)
  })
})
