<script setup lang="ts">
const auth = useAuth()
const { open, closeDrawer } = useChat()
const root = ref<HTMLElement | null>(null)

const onPointerDown = (event: PointerEvent) => {
  if (!open.value || !auth.value.loggedIn) return
  const target = event.target
  if (!(target instanceof Node)) return
  if (root.value?.contains(target)) return
  closeDrawer()
}

onMounted(() => {
  document.addEventListener('pointerdown', onPointerDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown)
})
</script>

<template>
  <div v-if="auth.loggedIn" ref="root">
    <ChatFab />
    <ChatDrawer />
  </div>
</template>
