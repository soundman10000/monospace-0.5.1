<script setup lang="ts">
import type { AuthWorkspace, WorkspaceCard } from '#shared/auth'

definePageMeta({
  workspace: false,
})

useHead({
  title: 'Select a client',
})

const auth = useAuth()
const route = useRoute()
const selectingId = ref<string | null>(null)
const selectError = ref('')

const { data: workspaces, pending, error } = await useAsyncData(
  'clients',
  () => apiFetch<WorkspaceCard[]>('/api/workspaces'),
)

const mediaSrc = '/api/media/client-selection'

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

const afterSelect = () => {
  const redirect = route.query.redirect
  if (typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')) {
    return redirect
  }
  return '/'
}

const choose = async (workspace: WorkspaceCard) => {
  if (selectingId.value) return
  selectError.value = ''
  selectingId.value = workspace.id
  try {
    const result = await apiFetch<{ workspace: AuthWorkspace }>('/api/workspaces/select', {
      method: 'POST',
      body: { id: workspace.id },
    })
    auth.value = {
      ...auth.value,
      workspace: result.workspace,
    }
    await navigateTo(afterSelect())
  } catch {
    selectError.value = 'Could not open that client'
  } finally {
    selectingId.value = null
  }
}
</script>

<template>
  <main class="client-select">
    <aside class="client-select__media">
      <img :src="mediaSrc" alt="">
      <h1 class="client-select__title">
        Client Selection
      </h1>
    </aside>

    <section class="client-select__panel">
      <p v-if="pending" class="copy-muted">
        Loading…
      </p>
      <p v-else-if="error" class="status-error">
        Could not load clients
      </p>
      <p v-else-if="!workspaces?.length" class="copy-muted">
        No clients are available for this account.
      </p>

      <ul v-else class="workspace-list">
        <li v-for="workspace in workspaces" :key="workspace.id">
          <button
            type="button"
            class="workspace-card"
            :style="{ '--workspace-accent': workspace.primaryColor }"
            :disabled="Boolean(selectingId)"
            @click="choose(workspace)"
          >
            <img
              v-if="workspace.logoUrl"
              :src="workspace.logoUrl"
              :alt="workspace.displayName"
              class="workspace-card__icon"
            >
            <span
              v-else
              class="workspace-card__icon workspace-card__icon--fallback"
            >
              {{ initials(workspace.displayName) }}
            </span>
            <span class="workspace-card__body">
              <span class="workspace-card__name">
                {{ workspace.displayName }}
              </span>
              <span
                v-if="workspace.description"
                class="workspace-card__description"
              >
                {{ workspace.description }}
              </span>
            </span>
          </button>
        </li>
      </ul>

      <p v-if="selectError" class="status-error">
        {{ selectError }}
      </p>
    </section>
  </main>
</template>

<style scoped>
@reference "../assets/css/main.css";

.client-select {
  @apply flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row;
}

.client-select__media {
  @apply relative h-[36vh] shrink-0 overflow-hidden bg-ink lg:h-auto lg:min-h-0 lg:w-1/3 lg:self-stretch;
}

.client-select__media img {
  @apply absolute inset-0 h-full w-full object-cover;
}

.client-select__title {
  @apply font-heading absolute inset-x-0 top-0 z-10 pt-10 pr-5 pb-8 pl-8 text-4xl font-extrabold leading-tight text-white;
  background: linear-gradient(to bottom, rgb(0 0 0 / 0.5), transparent);
}

.client-select__panel {
  @apply flex min-h-0 flex-1 flex-col justify-start overflow-y-auto px-6 py-6 sm:px-8 lg:px-10;
}

.client-select__panel .workspace-list {
  @apply mt-0 grid w-full list-none gap-4 p-0;
  grid-template-columns: repeat(auto-fill, minmax(26rem, 1fr));
}

.client-select__panel .workspace-card {
  @apply h-full min-h-28 items-center py-5;
}

.client-select__panel .workspace-card__description {
  @apply line-clamp-2;
}

.client-select__panel .status-error {
  @apply mt-4;
}
</style>
