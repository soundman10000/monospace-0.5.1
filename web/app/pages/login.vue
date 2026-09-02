<script setup lang="ts">
definePageMeta({
  auth: false,
})

useHead({
  title: 'Log in',
})

const route = useRoute()
const auth = useAuth()
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const pending = ref(false)

const redirectTo = () => {
  const redirect = route.query.redirect
  if (typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')) {
    return redirect
  }
  return '/'
}

const onSubmit = async () => {
  errorMessage.value = ''
  pending.value = true
  try {
    const result = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value,
      },
    })
    auth.value = {
      loggedIn: true,
      user: result.user,
    }
    await navigateTo(redirectTo())
  } catch (error) {
    const message =
      error && typeof error === 'object' && 'data' in error
        ? (error.data as { statusMessage?: string })?.statusMessage
        : null
    errorMessage.value = message || 'Invalid email or password'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-neutral-50 lg:flex-row">
    <main class="flex min-h-dvh flex-1 flex-col justify-between bg-white px-8 py-10 sm:px-12 lg:max-w-[50%] lg:px-24">
      <div>
        <img
          src="/lumina.png"
          alt="Lumnia"
          class="h-28 w-28 rounded-full object-cover"
        >
      </div>

      <div class="mx-auto w-full max-w-md flex-1 py-10 lg:mx-0 lg:flex lg:flex-col lg:justify-center">
        <h1 class="font-heading text-[clamp(2.25rem,2.5vw,3.5rem)] font-extrabold capitalize leading-tight text-login-heading">
          Welcome
        </h1>

        <form class="mt-8 space-y-6" @submit.prevent="onSubmit">
          <div>
            <label for="email" class="block text-sm font-medium text-neutral-700">
              Username
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              name="email"
              autocomplete="username"
              required
              class="mt-2 block w-full rounded-lg border border-login-border bg-white px-3 py-2.5 text-neutral-800 outline-none transition-colors focus:border-login-focus"
            >
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-neutral-700">
              Password
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              name="password"
              autocomplete="current-password"
              required
              class="mt-2 block w-full rounded-lg border border-login-border bg-white px-3 py-2.5 text-neutral-800 outline-none transition-colors focus:border-login-focus"
            >
          </div>

          <p v-if="errorMessage" class="text-sm font-medium text-red-600">
            {{ errorMessage }}
          </p>

          <div class="pt-2 sm:flex sm:justify-end">
            <button
              type="submit"
              :disabled="pending"
              class="font-heading w-full rounded-full bg-login-button px-10 py-3 text-base font-semibold capitalize text-white transition-colors hover:bg-login-button-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {{ pending ? 'Logging in…' : 'Login' }}
            </button>
          </div>
        </form>
      </div>

      <p class="max-w-md text-xs leading-relaxed text-login-muted">
        This software is optimized for modern browsers: Chrome, Edge, Firefox, and Safari.
        This service is hosted by
        <a
          href="https://goempyrean.com/"
          class="underline decoration-1 underline-offset-2"
          target="_blank"
          rel="noreferrer"
        >Empyrean Benefit Solutions, Inc.</a>
      </p>
    </main>

    <aside
      class="relative min-h-[40vh] flex-1 border-r-[clamp(4px,1.2vw,20px)] border-login-accent bg-cover bg-center lg:min-h-dvh lg:sticky lg:top-0"
      :style="{ backgroundImage: 'url(/login.jpg)' }"
    >
      <img
        src="/empyrean-logo-white.svg"
        alt="Empyrean Benefit Solutions"
        class="absolute right-8 bottom-8 w-[180px] sm:w-[250px]"
      >
    </aside>
  </div>
</template>
