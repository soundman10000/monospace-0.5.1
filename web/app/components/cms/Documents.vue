<script setup lang="ts">
import type { CmsDocumentsBlock } from '#shared/plan'

defineProps<{
  block: CmsDocumentsBlock
}>()
</script>

<template>
  <div class="cms-documents">
    <h3 class="cms-documents__heading">Documents</h3>
    <ul class="cms-documents__list">
      <li v-for="doc in block.documents" :key="doc.id">
        <CmsBlockDocument :block="doc" />
      </li>
    </ul>
  </div>
</template>

<style scoped>
@reference "../../assets/css/main.css";

.cms-documents {
  @apply flex h-full min-w-0 flex-col gap-3 rounded-card border border-border-subtle bg-surface p-4;
}

.cms-documents__heading {
  @apply font-heading text-base font-semibold text-heading;
}

.cms-documents__list {
  @apply flex list-none flex-col gap-3 p-0;
}
</style>
