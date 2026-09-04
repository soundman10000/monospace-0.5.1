<script setup lang="ts">
const INSIGHT_LOGO = '/lumina.png'
const INSIGHT_NAME = 'Lumina Insights'

const auth = useAuth()
const { logout, pending } = useLogout()
const { dark, toggleTheme } = useThemeToggle()
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

const menuOpen = ref(false)
let closeTimer: ReturnType<typeof setTimeout> | null = null

const openMenu = () => {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
  menuOpen.value = true
}

const scheduleCloseMenu = () => {
  if (closeTimer) clearTimeout(closeTimer)
  closeTimer = setTimeout(() => {
    menuOpen.value = false
    closeTimer = null
  }, 500)
}

const onFocusOut = (event: FocusEvent) => {
  const next = event.relatedTarget
  if (next instanceof Node && (event.currentTarget as Node).contains(next)) return
  scheduleCloseMenu()
}

onBeforeUnmount(() => {
  if (closeTimer) clearTimeout(closeTimer)
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

    <div
      class="app-header__user"
      :class="{ 'is-open': menuOpen }"
      @mouseenter="openMenu"
      @mouseleave="scheduleCloseMenu"
      @focusin="openMenu"
      @focusout="onFocusOut"
    >
      <button
        type="button"
        class="app-header__account"
        aria-haspopup="menu"
        :aria-expanded="menuOpen"
        aria-label="Account menu"
        @click="openMenu"
      >
        <span class="app-header__user-name">
          {{ displayName }}
        </span>
        <span class="app-header__avatar">
          <img
            v-if="user?.avatarUrl"
            :src="user.avatarUrl"
            alt=""
            class="app-header__avatar-image"
          >
          <span v-else class="app-header__avatar-fallback">
            {{ initials }}
          </span>
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
            type="button"
            class="app-header__menu-item app-header__theme"
            role="menuitemcheckbox"
            :aria-checked="dark"
            @click="toggleTheme"
          >
            <span>Dark theme</span>
            <span class="theme-switch" aria-hidden="true" />
          </button>
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
  @apply relative z-30 flex shrink-0 items-center justify-between gap-6 border-b border-border-subtle bg-surface px-6 py-4 sm:px-8;
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

.app-header__user.is-open::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  width: 14rem;
  height: calc(100% + 0.75rem);
}

.app-header__account {
  @apply relative z-10 flex cursor-pointer items-center gap-2.5 bg-transparent p-0;
}

.app-header__user-name {
  @apply font-heading max-w-44 truncate text-sm font-medium tracking-tight text-heading;
}

.app-header__avatar {
  @apply flex h-10 w-10 items-center justify-center overflow-hidden rounded-pill border border-border-subtle bg-page;
}

.app-header__avatar-image {
  @apply h-full w-full object-cover;
}

.app-header__avatar-fallback {
  @apply font-heading text-xs font-semibold text-heading;
}

.app-header__menu {
  @apply invisible pointer-events-none absolute top-full right-0 z-20 min-w-56 pt-3 opacity-0;
  transform: translateY(0.35rem);
  transition:
    opacity 0.28s ease,
    transform 0.28s ease,
    visibility 0s linear 0.28s;
}

.app-header__user.is-open .app-header__menu {
  @apply visible pointer-events-auto opacity-100;
  transform: translateY(0);
  transition-delay: 0s;
}

@media (prefers-reduced-motion: reduce) {
  .app-header__menu {
    transform: none;
    transition: opacity 0.2s ease, visibility 0s linear 0.2s;
  }

  .app-header__user.is-open .app-header__menu {
    transform: none;
  }
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

.app-header__theme {
  @apply items-center justify-between gap-3;
}

.theme-switch {
  @apply relative h-5 w-9 shrink-0 rounded-pill bg-border-subtle;
}

.theme-switch::after {
  content: '';
  @apply absolute top-0.5 left-0.5 h-4 w-4 rounded-pill;
  background: white;
  transition: transform 0.2s ease;
}

.app-header__theme[aria-checked='true'] .theme-switch {
  @apply bg-accent;
}

.app-header__theme[aria-checked='true'] .theme-switch::after {
  transform: translateX(1rem);
}

@media (prefers-reduced-motion: reduce) {
  .theme-switch::after {
    transition: none;
  }
}
</style>
