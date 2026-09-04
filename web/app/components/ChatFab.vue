<script setup lang="ts">
const { open, toggle } = useChat()
const idleIcon = '/api/media/ai-icon-white'
const activeIcon = '/api/media/ai-icon-active'
</script>

<template>
  <button
    type="button"
    class="chat-fab"
    :class="{ 'is-open': open }"
    :aria-label="open ? 'Close assistant' : 'Open assistant'"
    :aria-expanded="open"
    aria-controls="chat-drawer"
    @click="toggle"
  >
    <img
      v-if="open"
      :src="activeIcon"
      alt=""
      class="chat-fab__active"
    >
    <img
      v-else
      :src="idleIcon"
      alt=""
      class="chat-fab__idle"
    >
  </button>
</template>

<style scoped>
@reference "../assets/css/main.css";

.chat-fab {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 50;
  @apply flex h-14 w-14 cursor-pointer items-center justify-center overflow-hidden rounded-full border-0 bg-accent p-3;
}

.chat-fab.is-open {
  @apply bg-transparent p-0;
}

.chat-fab:focus-visible {
  @apply outline-2 outline-offset-2 outline-focus;
}

.chat-fab__idle {
  @apply h-full w-full object-contain;
}

.chat-fab__active {
  @apply h-full w-full rounded-full object-cover;
  transform: scale(1.2);
}
</style>
