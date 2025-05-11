import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',  // Обязательно для Render
      port: process.env.PORT || 5173,  // Render использует $PORT
      allowedHosts: [
        'nestmate.onrender.com', // Ваш хост на Render.com
        'localhost',             // Локальная разработка
        '127.0.0.1'              // Локальная разработка
      ],
      proxy: {
        '/api': {
          // target: `http://${env.VITE_BACKEND_HOST}:${env.VITE_BACKEND_PORT}`,
          target: `${env.VITE_BACKEND_HOST}`,
          _changeOrigin: true,
          get changeOrigin() {
            return this._changeOrigin
          },
          set changeOrigin(value) {
            this._changeOrigin = value
          },
        }
      }
    },
    preview: {
      host: '0.0.0.0',  // Для команды `preview`
      port: process.env.PORT || 4173,
    }
  }
})
