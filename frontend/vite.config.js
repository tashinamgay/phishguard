// =============================================================================
// vite.config.js — Vite Build Tool Configuration
// =============================================================================
// Vite is the build tool and dev server for the React frontend.
//
// Key setting: the proxy
//   Any request from the frontend to /api/... is automatically forwarded
//   to the FastAPI backend at localhost:8000.
//   This avoids CORS issues during development.
//
//   Example:
//     Frontend calls: POST /api/predict
//     Vite forwards to: POST http://localhost:8000/api/predict
// =============================================================================

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,   // Frontend runs on http://localhost:5173
    proxy: {
      // Forward all /api requests to the FastAPI backend
      '/api': {
        target:       'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
