import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    monospaceUrl: 'http://localhost:8100',
    sessionPassword: 'local-web-session-secret-do-not-use-32',
    public: {
      monospaceProject: 'dans-auto',
    },
  },
  typescript: {
    strict: true,
  },
  devServer: {
    host: '0.0.0.0',
    port: 3000,
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        usePolling: true,
      },
    },
  },
})
