<script setup lang="ts">
const auth = useAuth()
const pending = ref(false)

const displayName = computed(
  () => auth.value.user?.fullName || auth.value.user?.email || 'there',
)

const logout = async () => {
  pending.value = true
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    auth.value = { loggedIn: false, user: null }
    await navigateTo('/login')
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-50 px-6">
    <div class="w-full max-w-lg text-center">
      <p class="text-sm font-medium uppercase tracking-widest text-slate-500">
        Signed in
      </p>
      <h1 class="mt-3 text-4xl font-bold tracking-tight text-slate-900">
        Hello, {{ displayName }}
      </h1>
      <p class="mt-3 text-lg text-slate-600">
        Your Monospace session is ready to make requests.
      </p>
      <button
        type="button"
        :disabled="pending"
        class="mt-8 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        @click="logout"
      >
        {{ pending ? 'Signing out…' : 'Sign out' }}
      </button>
    </div>
  </main>
</template>
