<script setup lang="ts">
const { open, messages, draft, streaming, error, closeDrawer, newChat, send } = useChat()

const scroller = ref<HTMLElement | null>(null)
const input = ref<HTMLTextAreaElement | null>(null)

const canSend = computed(() => !streaming.value && draft.value.trim().length > 0)

const canStartNewChat = computed(() =>
  messages.value.length > 0
  || draft.value.length > 0
  || Boolean(error.value)
  || streaming.value,
)

const startNewChat = async () => {
  if (!canStartNewChat.value) return
  newChat()
  await nextTick()
  input.value?.focus()
}

const thinking = computed(() => {
  if (!streaming.value) return false
  const last = messages.value[messages.value.length - 1]
  return last?.role === 'assistant' && last.content === ''
})

const scrollToBottom = async () => {
  await nextTick()
  const el = scroller.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

watch(
  [open, messages, streaming],
  () => {
    if (open.value) scrollToBottom()
  },
  { deep: true },
)

watch(open, async (isOpen) => {
  if (!isOpen) return
  await nextTick()
  input.value?.focus()
})

const onWindowKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && open.value) closeDrawer()
}

onMounted(() => window.addEventListener('keydown', onWindowKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onWindowKeydown))
</script>

<template>
  <aside
    id="chat-drawer"
    class="chat-drawer"
    :class="{ 'is-open': open }"
    :aria-hidden="!open"
    :inert="!open"
    aria-label="Assistant"
  >
    <div class="chat-drawer__panel">
      <header class="chat-drawer__header">
        <h2 class="chat-drawer__title">
          Assistant
        </h2>
        <div class="chat-drawer__actions">
          <button
            type="button"
            class="chat-drawer__new"
            :disabled="!canStartNewChat"
            @click="startNewChat"
          >
            New chat
          </button>
          <button
            type="button"
            class="chat-drawer__close"
            aria-label="Close assistant"
            @click="closeDrawer"
          >
            <span class="material-icons" aria-hidden="true">close</span>
          </button>
        </div>
      </header>

      <div ref="scroller" class="chat-drawer__body">
        <p v-if="!messages.length" class="chat-drawer__empty">
          Ask a question about your benefits.
        </p>
        <ul v-else class="chat-drawer__messages" aria-live="polite">
          <li
            v-for="(message, index) in messages"
            :key="index"
            class="chat-drawer__message"
            :class="`is-${message.role}`"
          >
            <div class="chat-drawer__bubble">
              <p
                v-if="message.content"
                class="chat-drawer__text"
              >{{ message.content }}</p>
              <p
                v-else-if="thinking && index === messages.length - 1"
                class="chat-drawer__thinking"
              >
                Thinking…
              </p>
            </div>
          </li>
        </ul>
        <p v-if="error" class="chat-drawer__error">
          {{ error }}
        </p>
      </div>

      <form class="chat-drawer__footer" @submit.prevent="send">
        <textarea
          ref="input"
          v-model="draft"
          class="chat-drawer__input"
          rows="2"
          placeholder="Message"
          aria-label="Message"
          autocomplete="off"
          @keydown.enter.exact.prevent="send"
        />
        <button
          type="submit"
          class="chat-drawer__send"
          :disabled="!canSend"
        >
          Send
        </button>
      </form>
    </div>
  </aside>
</template>

<style scoped>
@reference "../assets/css/main.css";

.chat-drawer {
  position: fixed;
  top: var(--app-header-height);
  right: 0;
  bottom: 0;
  z-index: 40;
  width: 23rem;
  max-width: 100vw;
  pointer-events: none;
  transform: translateX(100%);
  transition: transform 0.25s ease;
}

.chat-drawer.is-open {
  pointer-events: auto;
  transform: translateX(0);
}

@media (prefers-reduced-motion: reduce) {
  .chat-drawer {
    transition: none;
  }
}

.chat-drawer__panel {
  @apply flex h-full min-h-0 flex-col border-l border-border-subtle bg-surface shadow-card-hover;
}

.chat-drawer__header {
  @apply flex shrink-0 items-center justify-between gap-3 border-b border-border-subtle px-4 py-3;
}

.chat-drawer__title {
  @apply font-heading m-0 text-base font-semibold tracking-tight text-heading;
}

.chat-drawer__actions {
  @apply flex shrink-0 items-center gap-1;
}

.chat-drawer__new {
  @apply cursor-pointer rounded-control border-0 bg-transparent px-2.5 py-1.5 text-sm font-medium text-heading hover:bg-page disabled:cursor-not-allowed disabled:opacity-40;
}

.chat-drawer__close {
  @apply inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-control border-0 bg-transparent text-heading hover:bg-page;
}

.chat-drawer__close .material-icons {
  font-size: 1.25rem;
}

.chat-drawer__body {
  @apply min-h-0 flex-1 overflow-y-auto px-4 py-3;
}

.chat-drawer__empty {
  @apply m-0 text-sm text-muted;
}

.chat-drawer__messages {
  @apply m-0 flex list-none flex-col gap-3 p-0;
}

.chat-drawer__message {
  @apply flex;
}

.chat-drawer__message.is-user {
  @apply justify-end;
}

.chat-drawer__message.is-assistant {
  @apply justify-start;
}

.chat-drawer__bubble {
  @apply max-w-[85%] rounded-card px-3 py-2 text-sm;
}

.chat-drawer__message.is-user .chat-drawer__bubble {
  @apply bg-button text-on-button;
}

.chat-drawer__message.is-assistant .chat-drawer__bubble {
  @apply bg-page text-body;
}

.chat-drawer__text {
  @apply m-0 whitespace-pre-wrap break-words;
}

.chat-drawer__thinking {
  @apply m-0 text-sm text-muted;
}

.chat-drawer__error {
  @apply mt-3 text-sm font-medium text-danger;
}

.chat-drawer__footer {
  @apply flex shrink-0 items-end gap-2 border-t border-border-subtle p-3 pb-24;
}

.chat-drawer__input {
  @apply block min-h-11 w-full resize-none rounded-control border border-border bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-focus;
}

.chat-drawer__send {
  @apply inline-flex shrink-0 cursor-pointer items-center justify-center rounded-control bg-button px-4 py-2.5 text-sm font-semibold text-on-button hover:bg-button-hover disabled:cursor-not-allowed disabled:opacity-60;
}
</style>
