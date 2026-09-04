<script setup lang="ts">
import type { PlansResult } from '#shared/plan'

definePageMeta({
  layout: 'client',
})

const route = useRoute()
const benefitId = computed(() => String(route.params.id || ''))

const { data, pending, error } = await useAsyncData(
  () => `benefit-${benefitId.value}`,
  () => apiFetch<PlansResult>(`/api/benefits/${benefitId.value}`),
)

const benefitName = computed(() => data.value?.benefit.name || 'Benefit')
const { leavingId, startLeave } = useLeavingCard()

const openPlan = async (planId: string) => {
  const done = startLeave(planId)
  if (!done) return
  await done
  await navigateTo(`/plans/${planId}`)
}

useHead(() => ({
  title: `${benefitName.value} Plans`,
}))
</script>

<template>
  <div class="plans-view">
    <nav class="breadcrumbs-nav" aria-label="Breadcrumb">
      <ol class="breadcrumbs">
        <li><NuxtLink to="/">Benefits</NuxtLink></li>
        <li aria-hidden="true">/</li>
        <li aria-current="page">{{ benefitName }} plans</li>
      </ol>
    </nav>

    <header class="plans-heading">
      <p class="eyebrow">{{ benefitName }} coverage</p>
      <h1 class="title title-home">Plans available to you</h1>
      <p class="lede">
        Here are the {{ benefitName.toLowerCase() }} plan selections available to you.
        Compare the details that matter, discover the value in every option, and choose
        coverage that fits your needs with confidence.
      </p>
    </header>

    <p v-if="pending" class="copy-muted plans-status">Loading plans…</p>
    <p v-else-if="error" class="status-error plans-status">Could not load plans</p>
    <p v-else-if="!data?.plans.length" class="copy-muted plans-status">
      No plans are available for this benefit.
    </p>

    <ul v-else class="plan-grid" :class="{ 'is-locked': leavingId }">
      <li v-for="plan in data.plans" :key="plan.id">
        <button
          type="button"
          class="plan-card"
          :class="{ 'is-leaving': leavingId === plan.id }"
          :style="{ '--plan-color': plan.color }"
          @click="openPlan(plan.id)"
        >
          <header class="plan-card__header">
            <div class="plan-card__icon-wrap" aria-hidden="true">
              <span v-if="plan.icon" class="material-icons plan-card__icon">
                {{ plan.icon }}
              </span>
            </div>
            <div class="plan-card__title-group">
              <p class="plan-card__code">{{ plan.code }}</p>
              <h2 class="plan-card__name">{{ plan.name }}</h2>
            </div>
          </header>

          <div class="plan-card__body">
            <p v-if="plan.description" class="plan-card__description">
              {{ plan.description }}
            </p>
            <h3 class="plan-card__feature-heading">Plan highlights</h3>
            <PlanFeatureList :features="plan.features" />
          </div>
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
@reference "../../assets/css/main.css";

.plans-view {
  @apply flex min-h-0 flex-1 flex-col;
}

.breadcrumbs-nav {
  @apply sticky top-0 z-10 bg-page pb-1;
}

.breadcrumbs {
  @apply flex list-none items-center gap-2 p-0 text-sm text-muted;
}

.breadcrumbs a {
  @apply text-heading no-underline hover:underline;
}

.plans-heading {
  @apply mt-4 max-w-3xl;
}

.plans-status {
  @apply mt-8;
}

.plan-grid {
  @apply mt-8 grid list-none items-stretch gap-4 p-0;
  grid-template-columns: repeat(auto-fit, minmax(min(20rem, 100%), 1fr));
}

.plan-grid.is-locked {
  pointer-events: none;
}

.plan-grid > li {
  @apply flex;
}

.plan-card {
  @apply flex w-full cursor-pointer flex-col overflow-hidden rounded-card border border-border-subtle bg-surface text-left text-inherit shadow-sm hover:border-border-hover hover:shadow-card-hover motion-safe:transition-[transform,opacity,box-shadow,border-color] motion-safe:duration-300 motion-safe:ease-out motion-safe:hover:-translate-y-0.5;
}

.plan-card.is-leaving,
.plan-card.is-leaving:hover,
.plan-card.is-leaving:active {
  opacity: 0.15;
  transform: translateY(-2rem);
}

.plan-card__header {
  @apply flex min-h-20 border-b border-border-subtle;
}

.plan-card__icon-wrap {
  @apply flex w-20 shrink-0 items-center justify-center;
  background: var(--plan-color, var(--color-accent));
}

.plan-card__icon {
  @apply text-3xl leading-none text-white;
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
}

.plan-card__title-group {
  @apply flex min-w-0 flex-1 flex-col justify-center px-4 py-3;
}

.plan-card__code {
  @apply text-xs font-semibold tracking-wider text-muted uppercase;
}

.plan-card__name {
  @apply font-heading mt-1 text-lg font-semibold text-heading;
}

.plan-card__body {
  @apply flex flex-1 flex-col p-5;
}

.plan-card__description {
  @apply text-sm leading-relaxed text-muted;
}

.plan-card__feature-heading {
  @apply font-heading mt-4 text-sm font-semibold text-heading;
}
</style>
