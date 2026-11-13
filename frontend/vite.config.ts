import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_BASE_URL || 'http://localhost:8080'
  const useProxy = env.VITE_DEV_PROXY === 'true'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      // Proxy optionnel si VITE_API_BASE_URL n'est pas défini et VITE_DEV_PROXY=true
      ...(useProxy
        ? {
            proxy: {
              '/api': { target: apiTarget, changeOrigin: true },
              '/actuator': { target: apiTarget, changeOrigin: true },
            },
          }
        : {}),
    },
  }
})
