import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Montserrat:wght@400;500;600;800&display=swap',
        },
      ],
    },
  },
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
  nitro: {
    experimental: {
      asyncContext: true,
    },
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
