<script setup lang="ts">
import type { BenefitCard } from '#shared/benefit'

const auth = useAuth()

const displayName = computed(
  () => auth.value.user?.fullName || auth.value.user?.email || 'there',
)

useHead(() => ({
  title: auth.value.workspace?.displayName
    ? `${auth.value.workspace.displayName} benefits`
    : 'Benefits',
}))

const { leavingId, startLeave } = useLeavingCard()

const openPlans = async (benefit: BenefitCard) => {
  const done = startLeave(benefit.id)
  if (!done) return
  await done
  await navigateTo(`/benefits/${benefit.id}`)
}

const { data: benefits, pending, error } = await useAsyncData(
  'home-benefits',
  () => apiFetch<BenefitCard[]>('/api/benefits'),
)
</script>

<template>
  <div>
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
    <ul v-else class="benefit-list" :class="{ 'is-locked': leavingId }">
      <li v-for="benefit in benefits" :key="benefit.id">
        <button
          type="button"
          class="benefit-card"
          :class="{ 'is-leaving': leavingId === benefit.id }"
          :style="{ '--benefit-color': benefit.color }"
          @click="openPlans(benefit)"
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
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
@reference "../assets/css/main.css";

.home-status {
  @apply mt-8;
}

.benefit-list {
  @apply mt-8 grid list-none items-stretch gap-4 p-0;
  grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
}

.benefit-list.is-locked {
  pointer-events: none;
}

.benefit-list li {
  @apply flex min-h-0;
}

.benefit-card {
  @apply flex h-full min-h-20 w-full cursor-pointer overflow-hidden rounded-card border border-border-subtle bg-surface text-left transition-colors hover:border-border-hover hover:shadow-card-hover motion-safe:transition-[transform,opacity,box-shadow,border-color] motion-safe:duration-300 motion-safe:ease-out motion-safe:hover:-translate-y-0.5;
}

.benefit-card.is-leaving,
.benefit-card.is-leaving:hover,
.benefit-card.is-leaving:active {
  opacity: 0.15;
  transform: translateY(-2rem);
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
  @apply flex w-20 shrink-0 items-center justify-center self-stretch;
  background: var(--benefit-color, var(--color-accent));
}

.benefit-card__icon {
  @apply text-3xl leading-none text-white;
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
}
</style>
