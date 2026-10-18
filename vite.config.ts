import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const serverEnv = loadEnv(mode, process.cwd(), 'GEMINI_')
  process.env.GEMINI_API_KEY ||= serverEnv.GEMINI_API_KEY || ''
  process.env.GEMINI_MODEL ||= serverEnv.GEMINI_MODEL || ''

  return {
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'local-evaluation-api',
      configureServer(server) {
        server.middlewares.use('/api/evaluate-lkpd', async (req, res, next) => {
          try {
            const module = await server.ssrLoadModule('/api/evaluate-lkpd.ts');
            await module.default(req, res);
          } catch (error) {
            next(error as Error);
          }
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 2000,
  },
  }
})
