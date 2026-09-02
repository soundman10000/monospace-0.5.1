<script setup lang="ts">
const auth = useAuth()
const { logout, pending } = useLogout()

const displayName = computed(
  () => auth.value.user?.fullName || auth.value.user?.email || 'there',
)
</script>

<template>
  <main class="page page-center">
    <div class="home">
      <p class="eyebrow">
        {{ auth.workspace?.displayName || 'Signed in' }}
      </p>
      <h1 class="title title-home">
        Hello, {{ displayName }}
      </h1>
      <p class="lede">
        Your Monospace session is ready to make requests.
      </p>
      <div class="home-actions">
        <NuxtLink to="/workspaces" class="btn-secondary">
          Switch workspace
        </NuxtLink>
        <button
          type="button"
          class="btn-primary"
          :disabled="pending"
          @click="logout"
        >
          {{ pending ? 'Signing out…' : 'Sign out' }}
        </button>
      </div>
    </div>
  </main>
</template>

