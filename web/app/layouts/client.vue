<script setup lang="ts">
const auth = useAuth()
const bannerSrc = '/api/media/dans-client'
</script>

<template>
  <div class="page">
    <AppHeader />
    <main class="client-layout">
      <section class="client-layout__content">
        <div class="client-layout__scroll">
          <slot />
        </div>
        <AppFooter />
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
  @apply flex min-h-0 flex-1 flex-col overflow-hidden pt-4;
}

.client-layout__scroll {
  @apply min-h-0 flex-1 overflow-y-auto px-12 sm:px-18 lg:px-24;
}

.client-layout__content :deep(.app-footer) {
  @apply px-12 sm:px-18 lg:px-24;
}

.client-layout__banner {
  @apply relative h-[100px] w-full shrink-0 overflow-hidden border-r-banner border-accent lg:h-auto lg:min-h-0 lg:w-1/3 lg:flex-none lg:self-stretch;
}

.client-layout__image {
  @apply absolute inset-0 h-full w-full object-cover;
}
</style>
