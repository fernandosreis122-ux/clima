import { defineConfig } from 'vite'

// GitHub Pages de projeto é publicado em https://<usuario>.github.io/clima/.
// O mesmo base é usado em dev/preview para manter os caminhos consistentes.
export default defineConfig({
  base: '/clima/',
})
