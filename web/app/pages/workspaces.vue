<script setup lang="ts">
import type { AuthWorkspace, WorkspaceCard } from '#shared/auth'

definePageMeta({
  workspace: false,
})

useHead({
  title: 'Workspaces',
})

const auth = useAuth()
const route = useRoute()
const selectingId = ref<string | null>(null)
const selectError = ref('')

const { data: workspaces, pending, error } = await useAsyncData(
  'workspaces',
  () => apiFetch<WorkspaceCard[]>('/api/workspaces'),
)

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
    selectError.value = 'Could not open that workspace'
  } finally {
    selectingId.value = null
  }
}
</script>

<template>
  <main class="page-narrow">
    <p class="eyebrow">
      Workspaces
    </p>
    <h1 class="title title-page">
      Choose a workspace
    </h1>

    <p v-if="pending" class="workspace-status copy-muted">
      Loading workspaces…
    </p>
    <p v-else-if="error" class="workspace-status status-error">
      Could not load workspaces
    </p>
    <p v-else-if="!workspaces?.length" class="workspace-status copy-muted">
      No workspaces are available for this account.
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

    <p v-if="selectError" class="workspace-status--error status-error">
      {{ selectError }}
    </p>
  </main>
</template>
