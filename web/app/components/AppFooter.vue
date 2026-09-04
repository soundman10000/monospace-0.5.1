<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer">
    <p>
      © {{ year }}
      <a
        href="https://goempyrean.com/"
        target="_blank"
        rel="noreferrer"
      >Empyrean Benefit Solutions, Inc.</a>
      All rights reserved.
    </p>
  </footer>
</template>

<style scoped>
@reference "../assets/css/main.css";

.app-footer {
  @apply shrink-0 border-t border-border-hover bg-surface px-6 py-3 sm:px-8;
}

.app-footer p {
  @apply text-xs leading-relaxed text-body;
}

.app-footer a {
  @apply text-heading underline decoration-1 underline-offset-2;
}
</style>
