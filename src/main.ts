import './style.css'

import type { AppState } from './app/state'
import { render } from './ui/render'
import { createShell } from './ui/shell'

const root = document.querySelector<HTMLElement>('#app')

if (!root) {
  throw new Error('Elemento #app não encontrado')
}

const shell = createShell(root)
const initialState: AppState = { status: 'empty' }

render(initialState, shell.content)
