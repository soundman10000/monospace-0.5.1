<script setup lang="ts">
import type { PlanFeature } from '#shared/plan'

withDefaults(defineProps<{
  features: PlanFeature[]
  showDescription?: boolean
}>(), {
  showDescription: false,
})
</script>

<template>
  <dl v-if="features.length" class="feature-list">
    <div v-for="feature in features" :key="feature.code" class="feature-row">
      <dt>
        <span>{{ feature.name }}</span>
        <span v-if="showDescription && feature.description" class="feature-row__description">
          {{ feature.description }}
        </span>
      </dt>
      <dd>
        <span
          v-if="feature.type === 'boolean'"
          class="feature-boolean material-icons"
          :class="feature.value ? 'is-true' : 'is-false'"
          :aria-label="feature.value ? 'Yes' : 'No'"
          role="img"
        >{{ feature.value ? 'check' : 'close' }}</span>
        <template v-else>{{ feature.value }}</template>
      </dd>
    </div>
  </dl>
  <p v-else class="copy-muted">Plan details are not available yet.</p>
</template>

<style scoped>
@reference "../assets/css/main.css";

.feature-list {
  @apply mt-3 divide-y divide-border-subtle;
}

.feature-row {
  @apply grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-2.5 text-sm;
}

.feature-row dt {
  @apply flex min-w-0 flex-col gap-0.5 text-muted;
}

.feature-row__description {
  @apply text-xs font-normal text-muted;
}

.feature-row dd {
  @apply max-w-48 text-right font-semibold text-heading;
}

.feature-boolean {
  @apply inline-flex size-6 items-center justify-center rounded-full text-[1.05rem] leading-none;
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
}

.feature-boolean.is-true {
  background: var(--feature-true-bg);
  color: var(--feature-true-fg);
}

.feature-boolean.is-false {
  background: var(--feature-false-bg);
  color: var(--color-danger);
}
</style>