<script setup lang="ts">
import type { CmsLayoutBlock } from '#shared/plan'

const props = defineProps<{
  block: CmsLayoutBlock
}>()

const columns = computed(() => {
  const match = /^\d+x(\d+)$/.exec(props.block.layout)
  const count = match ? Number(match[1]) : 1
  return Number.isFinite(count) && count > 0 ? count : 1
})
</script>

<template>
  <div
    class="cms-layout"
    :style="{ '--layout-cols': String(columns) }"
  >
    <div
      v-for="child in block.blocks"
      :key="child.id"
      class="cms-layout__cell"
    >
      <CmsBlockTitle
        v-if="child.collection === 'block_title'"
        :block="child"
      />
      <CmsBlockMarkdown
        v-else-if="child.collection === 'block_markdown'"
        :block="child"
      />
      <CmsLayoutGrid
        v-else-if="child.collection === 'layout_grid_container'"
        :block="child"
      />
    </div>
  </div>
</template>

<style scoped>
@reference "../../assets/css/main.css";

.cms-layout {
  @apply grid gap-4;
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .cms-layout {
    grid-template-columns: repeat(var(--layout-cols, 1), minmax(0, 1fr));
  }
}

.cms-layout__cell {
  @apply min-w-0 rounded-card border border-border-subtle bg-surface p-4;
}

.cms-layout .cms-layout {
  @apply mt-0;
}

.cms-layout .cms-layout__cell {
  @apply bg-page;
}
</style>