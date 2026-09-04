<script setup lang="ts">
const auth = useAuth()
</script>

<template>
  <template v-if="auth.loggedIn">
    <ChatFab />
    <ChatDrawer />
  </template>
</template>
