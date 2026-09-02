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
const hasError = computed(() => Boolean(errorMessage.value))

const afterLogin = () => {
  const redirect = route.query.redirect
  if (
    typeof redirect === 'string' &&
    redirect.startsWith('/') &&
    !redirect.startsWith('//') &&
    redirect !== '/workspaces'
  ) {
    return { path: '/workspaces', query: { redirect } }
  }
  return '/workspaces'
}

const clearError = () => {
  errorMessage.value = ''
}

const onSubmit = async () => {
  errorMessage.value = ''
  pending.value = true
  try {
    const result = await $fetch<{ user: AuthUser }>('/api/auth/login', {
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
    await navigateTo(afterLogin())
  } catch {
    errorMessage.value = CREDENTIALS_ERROR
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="login">
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
              :disabled="pending"
            >
              {{ pending ? 'Logging in…' : 'Login' }}
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
