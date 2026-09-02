<script setup lang="ts">
import type { BenefitCard } from '#shared/benefit'

const auth = useAuth()
const bannerSrc = '/api/media/dans-client'

const displayName = computed(
  () => auth.value.user?.fullName || auth.value.user?.email || 'there',
)

const { data: benefits, pending, error } = await useAsyncData(
  'home-benefits',
  () => apiFetch<BenefitCard[]>('/api/benefits'),
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
        Below are your benefit selections for this client.
      </p>

      <p v-if="pending" class="copy-muted home-status">
        Loading benefits…
      </p>
      <p v-else-if="error" class="status-error home-status">
        Could not load benefits
      </p>
      <p v-else-if="!benefits?.length" class="copy-muted home-status">
        No benefits are available for this client.
      </p>
      <ul v-else class="benefit-list">
        <li v-for="benefit in benefits" :key="benefit.id">
          <article
            class="benefit-card"
            :style="{ '--benefit-color': benefit.color }"
          >
            <div class="benefit-card__swatch" aria-hidden="true">
              <span v-if="benefit.icon" class="material-icons benefit-card__icon">
                {{ benefit.icon }}
              </span>
            </div>
            <div class="benefit-card__body">
              <h2 class="benefit-card__name">
                {{ benefit.name }}
              </h2>
              <p v-if="benefit.description" class="benefit-card__description">
                {{ benefit.description }}
              </p>
            </div>
          </article>
        </li>
      </ul>
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
  @apply flex min-h-0 flex-1 flex-col justify-start overflow-y-auto px-8 py-6 sm:px-12 lg:px-16;
}

.home-banner {
  @apply relative min-h-[36vh] w-full overflow-hidden border-r-banner border-accent lg:min-h-0 lg:w-1/3 lg:flex-none lg:self-stretch;
}

.home-banner__image {
  @apply absolute inset-0 h-full w-full object-cover;
}

.home-status {
  @apply mt-8;
}

.benefit-list {
  @apply mt-8 grid list-none items-stretch gap-4 p-0;
  grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
  grid-auto-rows: 1fr;
}

.benefit-list li {
  @apply flex min-h-0;
}

.benefit-card {
  @apply flex h-full min-h-20 w-full overflow-hidden rounded-card border border-border-subtle bg-surface;
}

.benefit-card__body {
  @apply flex min-w-0 flex-1 flex-col justify-center px-4 py-2.5;
}

.benefit-card__name {
  @apply font-heading text-base font-semibold text-heading;
}

.benefit-card__description {
  @apply mt-0.5 line-clamp-2 text-sm leading-snug text-muted;
}

.benefit-card__swatch {
  @apply flex shrink-0 items-center justify-center self-stretch;
  aspect-ratio: 1 / 1;
  height: 100%;
  width: auto;
  background: var(--benefit-color, var(--color-accent));
}

.benefit-card__icon {
  @apply text-3xl leading-none text-white;
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
}
</style>

