<script setup lang="ts">
definePageMeta({
  layout: 'client',
})

useHead({
  title: 'Plans',
})
</script>

<template>
  <div class="plans-view">
    <nav aria-label="Breadcrumb">
      <ol class="breadcrumbs">
        <li><NuxtLink to="/">Benefits</NuxtLink></li>
        <li aria-hidden="true">/</li>
        <li aria-current="page">Plans</li>
      </ol>
    </nav>

    <div class="plans-placeholder">
      <h1>plans</h1>
    </div>
  </div>
</template>

<style scoped>
@reference "../assets/css/main.css";

.plans-view {
  @apply flex min-h-0 flex-1 flex-col;
}

.breadcrumbs {
  @apply flex list-none items-center gap-2 p-0 text-sm text-muted;
}

.breadcrumbs a {
  @apply text-heading no-underline hover:underline;
}

.plans-placeholder {
  @apply flex min-h-0 flex-1 items-center justify-center;
}

.plans-placeholder h1 {
  @apply font-heading text-4xl font-semibold text-heading;
}
</style>
