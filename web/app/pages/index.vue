<script setup lang="ts">
const auth = useAuth()

const displayName = computed(
  () => auth.value.user?.fullName || auth.value.user?.email || 'there',
)
</script>

<template>
  <main class="page-center">
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
    </div>
  </main>
</template>

