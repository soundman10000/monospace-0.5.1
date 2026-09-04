<script setup lang="ts">
const {
  open,
  toggle,
  openDrawer,
  introVisible,
  introLeaving,
  offerIntro,
  dismissIntro,
} = useChat()
const idleIcon = '/api/media/ai-icon-white'
const activeIcon = '/api/media/ai-icon-active'

onMounted(() => {
  offerIntro()
})
</script>

<template>
  <div class="chat-launcher">
    <div
      v-if="introVisible && !open"
      class="chat-intro"
      :class="{ 'is-leaving': introLeaving }"
      role="status"
    >
      <button
        type="button"
        class="chat-intro__open"
        @click="openDrawer"
      >
        I can help you
      </button>
      <button
        type="button"
        class="chat-intro__dismiss"
        aria-label="Dismiss greeting"
        @click="dismissIntro"
      >
        <span class="material-icons" aria-hidden="true">close</span>
      </button>
    </div>

    <div class="chat-fab-wrap">
      <span
        v-if="!open"
        class="chat-fab__ring chat-fab__ring--slow"
        aria-hidden="true"
      />
      <span
        v-if="!open"
        class="chat-fab__ring chat-fab__ring--fast"
        aria-hidden="true"
      />
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
    </div>
  </div>
</template>

<style scoped>
@reference "../assets/css/main.css";

.chat-launcher {
  position: fixed;
  right: 2.25rem;
  bottom: 1.5rem;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.85rem;
}

.chat-intro {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.15rem;
  padding: 0.45rem 0.4rem 0.45rem 0.9rem;
  max-width: 16rem;
  @apply rounded-card border border-border-subtle bg-surface text-heading shadow-card-hover;
  animation: chat-intro-in 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.chat-intro.is-leaving {
  animation: chat-intro-out 0.45s ease forwards;
  pointer-events: none;
}

.chat-intro::after {
  content: '';
  position: absolute;
  right: 1.55rem;
  bottom: -5px;
  width: 10px;
  height: 10px;
  @apply border-r border-b border-border-subtle bg-surface;
  transform: rotate(45deg);
}

.chat-intro__open {
  @apply cursor-pointer border-0 bg-transparent p-0 text-left font-heading text-sm font-medium tracking-tight text-heading;
}

.chat-intro__dismiss {
  @apply inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-pill border-0 bg-transparent text-muted hover:bg-page hover:text-heading;
}

.chat-intro__dismiss .material-icons {
  font-size: 1rem;
}

.chat-fab-wrap {
  position: relative;
  width: 3.5rem;
  height: 3.5rem;
}

.chat-fab__ring {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  pointer-events: none;
  border: 2px solid var(--color-accent);
  opacity: 0;
}

.chat-fab__ring--slow {
  animation: chat-ring 2.6s ease-out infinite;
}

.chat-fab__ring--fast {
  animation: chat-ring 2.6s ease-out 0.9s infinite;
}

.chat-fab {
  position: relative;
  z-index: 1;
  @apply flex h-14 w-14 cursor-pointer items-center justify-center overflow-hidden rounded-full border-0 bg-accent p-3;
  box-shadow:
    0 8px 20px -10px color-mix(in oklch, var(--color-accent) 70%, transparent),
    0 2px 8px -4px rgb(15 23 42 / 0.35);
  transition:
    transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.3s ease;
}

.chat-fab:hover:not(.is-open) {
  transform: scale(1.1) translateY(-3px);
  box-shadow:
    0 16px 28px -10px color-mix(in oklch, var(--color-accent) 80%, transparent),
    0 6px 14px -6px rgb(15 23 42 / 0.4);
}

.chat-fab:hover:not(.is-open) .chat-fab__idle {
  animation: chat-spin 0.7s cubic-bezier(0.34, 1.4, 0.64, 1);
}

.chat-fab.is-open {
  @apply bg-transparent p-0;
  box-shadow: none;
  transform: none;
}

.chat-fab:focus-visible {
  @apply outline-2 outline-offset-2 outline-focus;
}

.chat-fab__idle {
  @apply h-full w-full object-contain;
  animation: chat-bob 3.2s ease-in-out infinite;
}

.chat-fab__active {
  @apply h-full w-full rounded-full object-cover;
  transform: scale(1.2);
}

@keyframes chat-intro-in {
  0% {
    opacity: 0;
    transform: translateY(12px) scale(0.82);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes chat-intro-out {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(8px) scale(0.96);
  }
}

@keyframes chat-ring {
  0% {
    transform: scale(1);
    opacity: 0.45;
  }
  100% {
    transform: scale(1.7);
    opacity: 0;
  }
}

@keyframes chat-bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}

@keyframes chat-spin {
  0% {
    transform: rotate(0deg) scale(1);
  }
  40% {
    transform: rotate(-18deg) scale(1.08);
  }
  70% {
    transform: rotate(12deg) scale(1.05);
  }
  100% {
    transform: rotate(0deg) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .chat-intro,
  .chat-intro.is-leaving,
  .chat-fab,
  .chat-fab__idle,
  .chat-fab__ring {
    animation: none;
    transition: none;
  }

  .chat-intro.is-leaving {
    opacity: 0;
  }

  .chat-fab:hover:not(.is-open) {
    transform: none;
  }
}
</style>
