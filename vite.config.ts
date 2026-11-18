import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import cesium from 'vite-plugin-cesium'
import { defineConfig } from 'vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // rebuildCesium: true keeps Cesium inside Vite/Rollup's normal module graph
    // instead of injecting a global <script> tag loaded on every page — that
    // default would force every visitor to download Cesium whether or not
    // they ever open the (opt-in, token-gated) 3D walkthrough. This way our
    // dynamic import('cesium') in CesiumStreetWalk.tsx genuinely code-splits.
    cesium({ rebuildCesium: true }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    exclude: ['maplibre-gl'],
  },
})
