import preact from '@preact/preset-vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Suhteellinen base, jotta build toimii sellaisenaan GitHub Pagesin
  // aliportaalissa (https://kayttaja.github.io/repo/) ilman että repon nimeä
  // pitää tietää etukäteen build-aikana.
  base: './',
  plugins: [preact()],
})
