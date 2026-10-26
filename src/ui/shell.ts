import { createElement } from './dom'
import { createIcon } from './icons'

export type Shell = {
  root: HTMLElement
  form: HTMLFormElement
  input: HTMLInputElement
  submitButton: HTMLButtonElement
  fieldError: HTMLParagraphElement
  content: HTMLElement
  status: HTMLParagraphElement
  footer: HTMLElement
}

export const SEARCH_SUBMIT_LABEL = 'Buscar'
export const SEARCH_LOADING_LABEL = 'Buscando…'

export function createShell(root: HTMLElement): Shell {
  root.classList.add('app')

  const header = createElement('header', 'search-area')
  const title = createElement('h1', 'sr-only', 'Clima')

  const form = createElement('form')
  form.setAttribute('role', 'search')
  form.noValidate = true

  const label = createElement('label', 'sr-only', 'Nome da cidade')
  label.htmlFor = 'city'

  const control = createElement('div', 'search-control')
  const searchIcon = createIcon('search', 'search-control__icon')
  const input = createElement('input', 'search-control__input')
  input.id = 'city'
  input.name = 'city'
  input.type = 'search'
  input.maxLength = 80
  input.autocomplete = 'off'
  input.placeholder = 'Digite o nome da cidade'

  const submitButton = createElement(
    'button',
    'search-control__button',
    SEARCH_SUBMIT_LABEL,
  )
  submitButton.type = 'submit'

  control.append(searchIcon, input, submitButton)
  form.append(label, control)

  const fieldError = createElement('p', 'field-error')
  fieldError.id = 'city-error'
  fieldError.setAttribute('role', 'alert')
  fieldError.hidden = true

  header.append(title, form, fieldError)

  const content = createElement('main', 'content')
  content.id = 'content'
  content.setAttribute('aria-busy', 'false')

  const footer = createElement('footer', 'site-footer')
  const attribution = createElement(
    'p',
    'site-footer__text',
    'Dados meteorológicos por ',
  )
  const attributionLink = createElement(
    'a',
    'site-footer__link',
    'Open-Meteo',
  )
  attributionLink.href = 'https://open-meteo.com/'
  attributionLink.target = '_blank'
  attributionLink.rel = 'noopener noreferrer'
  attribution.append(attributionLink)
  footer.append(attribution)

  const status = createElement('p', 'sr-only')
  status.id = 'status'
  status.setAttribute('role', 'status')
  status.setAttribute('aria-live', 'polite')
  status.setAttribute('aria-atomic', 'true')

  root.replaceChildren(header, content, footer, status)

  return {
    root,
    form,
    input,
    submitButton,
    fieldError,
    content,
    status,
    footer,
  }
}

export function setSearchLoading(shell: Shell, isLoading: boolean): void {
  shell.submitButton.setAttribute('aria-busy', String(isLoading))

  if (isLoading) {
    const spinner = createIcon('spinner', 'search-control__spinner')
    const label = createElement(
      'span',
      'search-control__button-label',
      SEARCH_LOADING_LABEL,
    )

    shell.submitButton.replaceChildren(spinner, label)
    return
  }

  shell.submitButton.textContent = SEARCH_SUBMIT_LABEL
}

export function showFieldError(shell: Shell, message: string): void {
  const text = createElement('span', 'field-error__text', message)

  shell.fieldError.replaceChildren(
    createIcon('alert-circle', 'field-error__icon'),
    text,
  )
  shell.fieldError.hidden = false
  shell.input.setAttribute('aria-invalid', 'true')
  shell.input.setAttribute('aria-describedby', shell.fieldError.id)
}

export function clearFieldError(shell: Shell): void {
  shell.fieldError.replaceChildren()
  shell.fieldError.hidden = true
  shell.input.removeAttribute('aria-invalid')
  shell.input.removeAttribute('aria-describedby')
}

export function setStatus(shell: Shell, message: string): void {
  shell.status.textContent = message
}
