import './style.css'

import { createController } from './app/controller'
import { createShell } from './ui/shell'

const root = document.querySelector<HTMLElement>('#app')

if (!root) {
  throw new Error('Elemento #app não encontrado')
}

const shell = createShell(root)

createController(shell)
