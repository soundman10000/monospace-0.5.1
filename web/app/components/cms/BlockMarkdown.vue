<script setup lang="ts">
import type { CmsMarkdownBlock } from '#shared/plan'
import { markdownToHtml } from '~/utils/markdown'

const props = defineProps<{
  block: CmsMarkdownBlock
}>()

const html = computed(() => markdownToHtml(props.block.text))
</script>

<template>
  <div class="cms-markdown" v-html="html" />
</template>

<style scoped>
@reference "../../assets/css/main.css";

.cms-markdown {
  @apply text-sm leading-relaxed text-body;
}

.cms-markdown :deep(p + p),
.cms-markdown :deep(p + ul),
.cms-markdown :deep(ul + p) {
  @apply mt-3;
}

.cms-markdown :deep(ul) {
  @apply list-disc space-y-1 pl-5;
}

.cms-markdown :deep(strong) {
  @apply font-semibold text-heading;
}
</style>