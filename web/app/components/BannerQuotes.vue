<script setup lang="ts">
import type { Quote } from '#shared/quotes'

const HOLD_MS = 30_000
const FADE_MS = 900

type Align = 'left' | 'right'
type Region = 'upper' | 'lower'

type Slot = {
  region: Region
  quote: Quote
  align: Align
  visible: boolean
}

const store = useQuoteStore()
const slots = ref<Slot[]>([])
const timers = new Set<number>()
let running = false

const prefersReducedMotion = () =>
  import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const fadeMs = () => (prefersReducedMotion() ? 0 : FADE_MS)

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    const id = window.setTimeout(() => {
      timers.delete(id)
      resolve()
    }, ms)
    timers.add(id)
  })

const oppositeAlign = (align: Align): Align => (align === 'left' ? 'right' : 'left')
const oppositeRegion = (region: Region): Region => (region === 'upper' ? 'lower' : 'upper')

const cycle = async () => {
  await wait(HOLD_MS)
  while (running) {
    const slot = slots.value[0]
    if (!slot) return
    slot.visible = false
    await wait(fadeMs())
    if (!running) return
    slot.quote = store.draw([slot.quote.id])
    slot.align = oppositeAlign(slot.align)
    slot.region = oppositeRegion(slot.region)
    slot.visible = true
    await wait(HOLD_MS)
  }
}

onMounted(() => {
  running = true
  slots.value = [
    { region: 'upper', quote: store.draw(), align: 'left', visible: true },
  ]
  void cycle()
})

onBeforeUnmount(() => {
  running = false
  for (const id of timers) window.clearTimeout(id)
  timers.clear()
})
</script>

<template>
  <div class="banner-quotes" aria-hidden="true">
    <figure
      v-for="slot in slots"
      :key="slot.region"
      class="banner-quote"
      :class="[
        `banner-quote--${slot.region}`,
        `is-${slot.align}`,
        { 'is-in': slot.visible },
      ]"
    >
      <blockquote class="banner-quote__text">
        “{{ slot.quote.text }}”
      </blockquote>
      <figcaption
        v-if="slot.quote.attribution"
        class="banner-quote__by"
      >
        — {{ slot.quote.attribution }}
      </figcaption>
    </figure>
  </div>
</template>

<style scoped>
@reference "../assets/css/main.css";

.banner-quotes {
  @apply pointer-events-none absolute inset-0 z-10;
}

.banner-quote {
  @apply font-heading absolute z-10 max-w-[86%] px-10 py-9 text-white;
  opacity: 0;
  transition: opacity 0.9s ease;
}

.banner-quote::before {
  content: '';
  @apply absolute inset-0 -z-10;
  background: rgb(0 0 0 / 0.32);
  mask-image:
    linear-gradient(to right, transparent, #000 18%, #000 82%, transparent),
    linear-gradient(to bottom, transparent, #000 20%, #000 80%, transparent);
  mask-composite: intersect;
  -webkit-mask-image:
    linear-gradient(to right, transparent, #000 18%, #000 82%, transparent),
    linear-gradient(to bottom, transparent, #000 20%, #000 80%, transparent);
  -webkit-mask-composite: source-in;
}

.banner-quote.is-in {
  opacity: 1;
}

.banner-quote--upper {
  top: 8%;
}

.banner-quote--lower {
  bottom: 8%;
}

.banner-quote.is-left {
  left: 2%;
  right: auto;
}

.banner-quote.is-right {
  right: 2%;
  left: auto;
}

.banner-quote__text {
  @apply m-0 text-2xl font-light leading-snug tracking-tight italic;
  text-shadow:
    0 1px 2px rgb(0 0 0 / 0.55),
    0 8px 18px rgb(0 0 0 / 0.45);
}

.banner-quote__by {
  @apply mt-3 text-sm font-normal not-italic tracking-wide text-white/85;
  text-shadow: 0 1px 2px rgb(0 0 0 / 0.55);
}

@media (prefers-reduced-motion: reduce) {
  .banner-quote {
    transition: none;
  }
}
</style>
