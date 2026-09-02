<script setup lang="ts">
const auth = useAuth()
const bannerSrc = '/api/media/dans-client'

const displayName = computed(
  () => auth.value.user?.fullName || auth.value.user?.email || 'there',
)
</script>

<template>
  <main class="home-shell">
    <section class="home-panel">
      <p class="eyebrow">
        {{ auth.workspace?.displayName || 'Signed in' }}
      </p>
      <h1 class="title title-home">
        Hello, {{ displayName }}
      </h1>
      <p class="lede">
        Your Monospace session is ready to make requests.
      </p>
    </section>

    <aside class="home-banner">
      <img :src="bannerSrc" alt="" class="home-banner__image">
    </aside>
  </main>
</template>

<style scoped>
@reference "../assets/css/main.css";

.home-shell {
  @apply flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row;
}

.home-panel {
  @apply flex flex-1 flex-col justify-center px-8 py-10 sm:px-12 lg:px-16;
}

.home-banner {
  @apply relative min-h-[36vh] w-full overflow-hidden border-r-banner border-accent lg:min-h-0 lg:w-1/3 lg:flex-none lg:self-stretch;
}

.home-banner__image {
  @apply absolute inset-0 h-full w-full object-cover;
}
</style>
