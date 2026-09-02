<script setup lang="ts">
import type { AuthUser } from '#shared/auth'

definePageMeta({
  auth: false,
  layout: false,
})

useHead({
  title: 'Log in',
})

const CREDENTIALS_ERROR = 'User/pw not correct'

const route = useRoute()
const auth = useAuth()
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const pending = ref(false)
const opening = ref(false)
const hasError = computed(() => Boolean(errorMessage.value))
const OPEN_MS = 400

const afterLogin = () => {
  const redirect = route.query.redirect
  if (
    typeof redirect === 'string' &&
    redirect.startsWith('/') &&
    !redirect.startsWith('//') &&
    redirect !== '/clients'
  ) {
    return { path: '/clients', query: { redirect } }
  }
  return '/clients'
}

const clearError = () => {
  errorMessage.value = ''
}

const prefersReducedMotion = () =>
  import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const openDoor = async () => {
  if (prefersReducedMotion()) return
  opening.value = true
  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, OPEN_MS)
  })
}

const onSubmit = async () => {
  errorMessage.value = ''
  pending.value = true
  try {
    const result = await apiFetch<{ user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value,
      },
    })
    auth.value = {
      loggedIn: true,
      user: result.user,
      workspace: null,
    }
    await openDoor()
    await navigateTo(afterLogin())
  } catch {
    errorMessage.value = CREDENTIALS_ERROR
    opening.value = false
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="login" :class="{ 'is-opening': opening }">
    <main class="login-panel">
      <div>
        <img
          src="/lumina.png"
          alt="Lumnia"
          class="login-brand"
        >
      </div>

      <div class="login-body">
        <h1 class="title title-welcome">
          Welcome
        </h1>

        <form class="login-form" @submit.prevent="onSubmit">
          <p
            v-if="hasError"
            id="login-error"
            role="alert"
            class="status-error"
          >
            {{ errorMessage }}
          </p>

          <div>
            <label for="email" class="field-label">
              Username
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              name="email"
              autocomplete="username"
              required
              :aria-invalid="hasError"
              :aria-describedby="hasError ? 'login-error' : undefined"
              class="field-input"
              :class="{ 'is-error': hasError }"
              @input="clearError"
            >
          </div>
          <div>
            <label for="password" class="field-label">
              Password
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              name="password"
              autocomplete="current-password"
              required
              :aria-invalid="hasError"
              :aria-describedby="hasError ? 'login-error' : undefined"
              class="field-input"
              :class="{ 'is-error': hasError }"
              @input="clearError"
            >
          </div>

          <div class="login-actions">
            <button
              type="submit"
              class="btn-login"
              :disabled="pending || opening"
            >
              {{ opening ? 'Welcome' : pending ? 'Logging in…' : 'Login' }}
            </button>
          </div>
        </form>
      </div>

      <p class="login-legal">
        This software is optimized for modern browsers: Chrome, Edge, Firefox, and Safari.
        This service is hosted by
        <a
          href="https://goempyrean.com/"
          target="_blank"
          rel="noreferrer"
        >Empyrean Benefit Solutions, Inc.</a>
      </p>
    </main>

    <aside class="login-banner">
      <img
        src="/empyrean-logo-white.svg"
        alt="Empyrean Benefit Solutions"
        class="login-mark"
      >
    </aside>
  </div>
</template>

<style scoped>
@reference "../assets/css/main.css";

.login {
  @apply relative overflow-hidden;
}

.login-panel {
  position: relative;
  z-index: 2;
  transition:
    width 0.5s cubic-bezier(0.65, 0, 0.35, 1),
    max-width 0.5s cubic-bezier(0.65, 0, 0.35, 1),
    flex-basis 0.5s cubic-bezier(0.65, 0, 0.35, 1);
}

@media (min-width: 1024px) {
  .login.is-opening .login-banner {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    width: 50%;
    min-height: auto;
  }

  .login.is-opening .login-panel {
    width: 100%;
    max-width: 100%;
    flex: 1 0 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .login-panel {
    transition: none;
  }
}
</style>
