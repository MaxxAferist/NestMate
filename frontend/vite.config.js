import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      allowedHosts: [
        'nestmate.onrender.com', // Ваш хост на Render.com
        'localhost',             // Локальная разработка
        '127.0.0.1'              // Локальная разработка
      ],
      proxy: {
        '/api': {
          target: `http://${env.VITE_BACKEND_HOST}:${env.VITE_BACKEND_PORT}`,
          changeOrigin: true
        }
      }
    }
  }
})
