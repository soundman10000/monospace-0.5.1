<script setup lang="ts">
import type { CmsLayoutBlock } from '#shared/plan'

const props = defineProps<{
  block: CmsLayoutBlock
  nested?: boolean
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
    :class="{ 'cms-layout--nested': nested }"
    :style="{ '--layout-cols': String(columns) }"
  >
    <template v-for="child in block.blocks" :key="child.id">
      <CmsLayoutGrid
        v-if="child.collection === 'layout_grid_container'"
        :block="child"
        nested
      />
      <div v-else class="cms-layout__cell">
        <CmsBlockTitle
          v-if="child.collection === 'block_title'"
          :block="child"
        />
        <CmsBlockMarkdown
          v-else-if="child.collection === 'block_markdown'"
          :block="child"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
@reference "../../assets/css/main.css";

.cms-layout {
  @apply grid gap-4;
  grid-template-columns: 1fr;
}

.cms-layout--nested {
  @apply min-h-0 min-w-0 self-stretch;
}

@media (min-width: 640px) {
  .cms-layout {
    grid-template-columns: repeat(var(--layout-cols, 1), minmax(0, 1fr));
  }
}

.cms-layout__cell {
  @apply min-w-0 rounded-card border border-border-subtle bg-surface p-4;
}

.cms-layout--nested > .cms-layout__cell {
  @apply h-full;
}
</style>