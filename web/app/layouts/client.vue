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
      </section>

      <aside
        class="client-layout__banner"
        :style="{ borderColor: auth.workspace?.primaryColor || undefined }"
      >
        <img :src="bannerSrc" alt="" class="client-layout__image">
        <BannerQuotes />
      </aside>

      <AppFooter class="client-layout__footer" />
    </main>
  </div>
</template>

<style scoped>
@reference "../assets/css/main.css";

.client-layout {
  @apply flex min-h-0 flex-1 flex-col overflow-hidden;
}

.client-layout__content {
  @apply flex min-h-0 flex-1 flex-col overflow-hidden pt-4;
}

.client-layout__scroll {
  @apply min-h-0 flex-1 overflow-y-auto px-12 sm:px-18 lg:px-24;
}

.client-layout__footer {
  @apply shrink-0;
}

.client-layout :deep(.app-footer) {
  @apply px-12 sm:px-18 lg:px-24;
}

.client-layout__banner {
  @apply relative h-[100px] w-full shrink-0 overflow-hidden border-r-banner border-accent;
}

@media (min-width: 1024px) {
  .client-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 33.333%);
    grid-template-rows: minmax(0, 1fr) auto;
    grid-template-areas:
      'content banner'
      'footer banner';
  }

  .client-layout__content {
    grid-area: content;
  }

  .client-layout__banner {
    grid-area: banner;
    height: auto;
    min-height: 0;
    align-self: stretch;
  }

  .client-layout__footer {
    grid-area: footer;
  }
}

.client-layout__image {
  @apply absolute inset-0 z-0 h-full w-full object-cover;
}
</style>
