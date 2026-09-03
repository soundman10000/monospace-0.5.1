<script setup lang="ts">
const auth = useAuth()
const bannerSrc = '/api/media/dans-client'
</script>

<template>
  <div class="page">
    <AppHeader />
    <main class="client-layout">
      <section class="client-layout__content">
        <slot />
      </section>

      <aside
        class="client-layout__banner"
        :style="{ borderColor: auth.workspace?.primaryColor || undefined }"
      >
        <img :src="bannerSrc" alt="" class="client-layout__image">
      </aside>
    </main>
  </div>
</template>

<style scoped>
@reference "../assets/css/main.css";

.client-layout {
  @apply flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row;
}

.client-layout__content {
  @apply flex min-h-0 flex-1 flex-col justify-start overflow-y-auto px-8 py-6 sm:px-12 lg:px-16;
}

.client-layout__banner {
  @apply relative min-h-[36vh] w-full overflow-hidden border-r-banner border-accent lg:min-h-0 lg:w-1/3 lg:flex-none lg:self-stretch;
}

.client-layout__image {
  @apply absolute inset-0 h-full w-full object-cover;
}
</style>
