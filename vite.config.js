import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Build tudo em UM único index.html (JS + CSS + logo em base64) -> hospedagem grátis trivial
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    assetsInlineLimit: 100000000, // inline a logo (base64) -> arquivo 100% self-contained
    cssCodeSplit: false,
    chunkSizeWarningLimit: 5000,
  },
})
