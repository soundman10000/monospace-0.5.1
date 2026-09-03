<script setup lang="ts">
import type { CmsCardBlock } from '#shared/plan'

defineProps<{
  block: CmsCardBlock
}>()
</script>

<template>
  <div class="cms-card">
    <template v-for="child in block.blocks" :key="child.id">
      <CmsBlockTitle
        v-if="child.collection === 'block_title'"
        :block="child"
      />
      <CmsBlockMarkdown
        v-else-if="child.collection === 'block_markdown'"
        :block="child"
      />
      <CmsBlockDocument
        v-else-if="child.collection === 'block_document'"
        :block="child"
      />
    </template>
  </div>
</template>

<style scoped>
@reference "../../assets/css/main.css";

.cms-card {
  @apply flex h-full min-w-0 flex-col gap-3 rounded-card border border-border-subtle bg-surface p-4;
}
</style>
