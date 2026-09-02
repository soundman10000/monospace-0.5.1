<script setup lang="ts">
const INSIGHT_LOGO = '/lumina.png'
const INSIGHT_NAME = 'Lumina Insights'

const auth = useAuth()
const { logout, pending } = useLogout()
const changingClient = ref(false)

const workspace = computed(() => auth.value.workspace)
const user = computed(() => auth.value.user)

const brandName = computed(() => workspace.value?.displayName ?? INSIGHT_NAME)
const brandLogo = computed(() =>
  workspace.value ? workspace.value.logoUrl : INSIGHT_LOGO,
)
const brandAccent = computed(() => workspace.value?.primaryColor ?? 'transparent')
const brandInitials = computed(() =>
  brandName.value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join(''),
)

const displayName = computed(
  () => user.value?.fullName || user.value?.email || 'Account',
)

const initials = computed(() => {
  const source = user.value?.fullName || user.value?.email || ''
  return source
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
})

const changeClient = async () => {
  if (changingClient.value || !workspace.value) return
  changingClient.value = true
  try {
    await apiFetch('/api/workspaces/clear', { method: 'POST' })
    auth.value = {
      ...auth.value,
      workspace: null,
    }
    await navigateTo('/clients')
  } finally {
    changingClient.value = false
  }
}
</script>

<template>
  <header class="app-header">
    <NuxtLink
      :to="workspace ? '/' : '/clients'"
      class="app-header__brand"
    >
      <img
        v-if="brandLogo"
        :src="brandLogo"
        :alt="brandName"
        class="app-header__brand-logo"
      >
      <span
        v-else
        class="app-header__brand-logo app-header__brand-logo--fallback"
        :style="{ background: brandAccent }"
      >
        {{ brandInitials }}
      </span>
      <span class="app-header__brand-name">
        {{ brandName }}
      </span>
      <span
        v-if="workspace"
        class="app-header__brand-swatch"
        :style="{ background: brandAccent }"
      />
    </NuxtLink>

    <div class="app-header__user">
      <button
        type="button"
        class="app-header__avatar"
        aria-haspopup="menu"
        aria-label="Account menu"
      >
        <img
          v-if="user?.avatarUrl"
          :src="user.avatarUrl"
          :alt="displayName"
          class="app-header__avatar-image"
        >
        <span v-else class="app-header__avatar-fallback">
          {{ initials }}
        </span>
      </button>

      <div class="app-header__menu" role="menu">
        <div class="app-header__menu-panel">
          <div class="app-header__menu-meta">
            <p class="app-header__menu-name">
              {{ displayName }}
            </p>
            <p v-if="user?.email" class="app-header__menu-email">
              {{ user.email }}
            </p>
          </div>
          <button
            v-if="workspace"
            type="button"
            class="app-header__menu-item"
            role="menuitem"
            :disabled="changingClient"
            @click="changeClient"
          >
            {{ changingClient ? 'Changing…' : 'Change client' }}
          </button>
          <button
            type="button"
            class="app-header__menu-item"
            role="menuitem"
            :disabled="pending"
            @click="logout"
          >
            {{ pending ? 'Signing out…' : 'Sign out' }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
@reference "../assets/css/main.css";

.app-header {
  @apply flex shrink-0 items-center justify-between gap-6 border-b border-border-subtle bg-surface px-6 py-4 sm:px-8;
}

.app-header__brand {
  @apply inline-flex min-w-0 max-w-64 cursor-pointer items-center gap-2 no-underline;
}

.app-header__brand-logo {
  @apply h-8 w-8 shrink-0 rounded-md object-cover;
}

.app-header__brand-logo--fallback {
  @apply font-heading flex items-center justify-center text-[0.65rem] font-semibold text-white;
}

.app-header__brand-name {
  @apply font-heading truncate text-sm font-medium tracking-tight text-heading;
}

.app-header__brand-swatch {
  @apply h-1.5 w-1.5 shrink-0 rounded-full;
}

.app-header__user {
  @apply relative shrink-0;
}

.app-header__avatar {
  @apply flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-pill border border-border-subtle bg-page;
}

.app-header__avatar-image {
  @apply h-full w-full object-cover;
}

.app-header__avatar-fallback {
  @apply font-heading text-xs font-semibold text-heading;
}

.app-header__menu {
  @apply invisible absolute top-full right-0 z-30 min-w-52 pt-2 opacity-0 motion-safe:transition-opacity motion-safe:duration-200;
}

.app-header__user:hover .app-header__menu,
.app-header__user:focus-within .app-header__menu {
  @apply visible opacity-100;
}

.app-header__menu-panel {
  @apply rounded-card border border-border-subtle bg-surface p-1.5 shadow-card-hover;
}

.app-header__menu-meta {
  @apply px-3 py-2;
}

.app-header__menu-name {
  @apply font-heading truncate text-sm font-semibold text-heading;
}

.app-header__menu-email {
  @apply mt-0.5 truncate text-xs text-muted;
}

.app-header__menu-item {
  @apply flex w-full cursor-pointer rounded-control px-3 py-2 text-left text-sm text-heading no-underline hover:bg-page disabled:cursor-not-allowed disabled:opacity-60;
}
</style>
