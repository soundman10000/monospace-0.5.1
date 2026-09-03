<script setup lang="ts">
import type { CmsDocumentBlock } from '#shared/plan'
import { markdownToHtml } from '~/utils/markdown'

const props = defineProps<{
  block: CmsDocumentBlock
}>()

const html = computed(() =>
  props.block.description ? markdownToHtml(props.block.description) : '',
)
</script>

<template>
  <article class="cms-document">
    <p v-if="block.code" class="cms-document__code">{{ block.code }}</p>
    <div v-if="html" class="cms-document__body" v-html="html" />
  </article>
</template>

<style scoped>
@reference "../../assets/css/main.css";

.cms-document__code {
  @apply text-xs font-semibold tracking-wider text-muted uppercase;
}

.cms-document__body {
  @apply mt-1 text-sm leading-relaxed text-body;
}

.cms-document__body :deep(p + p),
.cms-document__body :deep(p + ul),
.cms-document__body :deep(ul + p) {
  @apply mt-2;
}

.cms-document__body :deep(ul) {
  @apply list-disc space-y-1 pl-5;
}

.cms-document__body :deep(strong) {
  @apply font-semibold text-heading;
}
</style>
