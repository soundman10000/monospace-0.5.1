<script setup lang="ts">
import type { CmsTitleBlock } from '#shared/plan'

const props = defineProps<{
  block: CmsTitleBlock
}>()

const tag = computed(() => {
  switch (props.block.style) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
      return props.block.style
    default:
      return 'h2'
  }
})
</script>

<template>
  <component :is="tag" class="cms-title" :class="`cms-title--${tag}`">
    {{ block.text }}
  </component>
</template>

<style scoped>
@reference "../../assets/css/main.css";

.cms-title {
  @apply font-heading font-semibold text-heading;
}

.cms-title--h1 {
  @apply text-3xl tracking-tight;
}

.cms-title--h2 {
  @apply text-2xl;
}

.cms-title--h3 {
  @apply text-xl;
}

.cms-title--h4,
.cms-title--h5 {
  @apply text-base;
}
</style>