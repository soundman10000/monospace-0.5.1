<script setup lang="ts">
const theme = useTheme()

useHead(() => ({
  htmlAttrs: {
    class: theme.value === 'dark' ? 'dark' : '',
  },
}))
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ChatWidget />
  </div>
</template>
