<script setup lang="ts">
import type { PlanDetail } from '#shared/plan'

definePageMeta({
  layout: 'client',
})

const route = useRoute()
const planId = computed(() => String(route.params.id || ''))

const { data, pending, error } = await useAsyncData(
  () => `plan-${planId.value}`,
  () => apiFetch<PlanDetail>(`/api/plans/${planId.value}`),
)

const benefitName = computed(() => data.value?.benefit.name || 'Benefit')
const benefitCode = computed(() => data.value?.benefit.code || '')
const plansHref = computed(() =>
  benefitCode.value
    ? { path: '/plans', query: { benefit: benefitCode.value } }
    : '/plans',
)

useHead(() => ({
  title: data.value?.coverage?.title?.text || data.value?.name || 'Plan',
}))
</script>

<template>
  <div class="plan-view">
    <p v-if="pending" class="copy-muted">Loading plan…</p>
    <p v-else-if="error" class="status-error">Could not load this plan</p>

    <template v-else-if="data">
      <nav aria-label="Breadcrumb">
        <ol class="breadcrumbs">
          <li><NuxtLink to="/">Benefits</NuxtLink></li>
          <li aria-hidden="true">/</li>
          <li>
            <NuxtLink :to="plansHref">{{ benefitName }} plans</NuxtLink>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">{{ data.name }}</li>
        </ol>
      </nav>

      <article class="plan-page">
        <header class="plan-page__masthead" :style="{ '--plan-color': data.color }">
          <div class="plan-page__icon-wrap" aria-hidden="true">
            <span v-if="data.icon" class="material-icons plan-page__icon">
              {{ data.icon }}
            </span>
          </div>
          <div class="plan-page__intro">
            <p class="eyebrow">{{ data.code }}</p>
            <CmsBlockTitle
              v-if="data.coverage?.title"
              :block="data.coverage.title"
            />
            <h1 v-else class="plan-page__fallback-title">{{ data.name }}</h1>
            <CmsBlockMarkdown
              v-if="data.coverage?.description"
              :block="data.coverage.description"
            />
            <p v-else-if="data.description" class="plan-page__fallback-copy">
              {{ data.description }}
            </p>
          </div>
        </header>

        <section class="plan-page__features" aria-labelledby="plan-features-heading">
          <h2 id="plan-features-heading" class="plan-page__section-title">
            Plan features
          </h2>
          <PlanFeatureList :features="data.features" show-description />
        </section>

        <section
          v-if="data.coverage?.layout"
          class="plan-page__coverage"
          aria-label="Coverage"
        >
          <CmsLayoutGrid :block="data.coverage.layout" />
        </section>
        <p v-else class="copy-muted plan-page__empty">
          A coverage page is not available for this plan yet.
        </p>
      </article>
    </template>
  </div>
</template>

<style scoped>
@reference "../../assets/css/main.css";

.plan-view {
  @apply flex flex-col pb-24;
}

.breadcrumbs {
  @apply flex list-none flex-wrap items-center gap-2 p-0 text-sm text-muted;
}

.breadcrumbs a {
  @apply text-heading no-underline hover:underline;
}

.plan-page {
  @apply mt-8 mb-8 flex flex-col gap-8;
}

.plan-page__masthead {
  @apply flex flex-col overflow-hidden rounded-card border border-border-subtle bg-surface sm:flex-row;
}

.plan-page__icon-wrap {
  @apply flex min-h-14 w-full shrink-0 items-center justify-center sm:w-16;
  background: var(--plan-color, var(--color-accent));
}

.plan-page__icon {
  @apply text-3xl leading-none text-white;
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
}

.plan-page__intro {
  @apply flex min-w-0 flex-1 flex-col justify-center px-4 py-3;
}

.plan-page__intro :deep(.cms-title--h1),
.plan-page__fallback-title {
  @apply font-heading mt-0.5 text-xl font-semibold leading-snug tracking-tight text-heading;
}

.plan-page__intro :deep(.cms-markdown),
.plan-page__fallback-copy {
  @apply mt-1 text-sm leading-normal text-muted;
}

.plan-page__intro :deep(.cms-markdown p + p) {
  @apply mt-1.5;
}

.plan-page__section-title {
  @apply font-heading text-lg font-semibold text-heading;
}

.plan-page__empty {
  @apply mt-2;
}
</style>
