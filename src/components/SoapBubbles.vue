<script setup lang="ts">
type Bubble = {
  id: number
  x: number
  size: number
  delay: number
  duration: number
  sway: number
  opacity: number
  wobble: number
  restY: number
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildBubbles(count: number): Bubble[] {
  const rand = mulberry32(4096)
  return Array.from({ length: count }, (_, id) => ({
    id,
    x: rand() * 94 + 3,
    size: rand() * 72 + 26,
    delay: rand() * 22,
    duration: rand() * 16 + 18,
    sway: rand() * 64 - 32,
    opacity: rand() * 0.22 + 0.18,
    wobble: rand() * 3 + 3.5,
    restY: rand() * 82 + 6,
  }))
}

const isCompact = typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches
const bubbles = buildBubbles(isCompact ? 14 : 22)
</script>

<template>
  <div class="soap-bubbles" aria-hidden="true">
    <div class="soap-bubbles__ambient" />
    <div
      v-for="b in bubbles"
      :key="b.id"
      class="soap-bubbles__item"
      :style="{
        left: `${b.x}%`,
        '--size': `${b.size}px`,
        '--delay': `${b.delay}s`,
        '--duration': `${b.duration}s`,
        '--sway': `${b.sway}px`,
        '--opacity': b.opacity,
        '--wobble': `${b.wobble}s`,
        '--rest-y': `${b.restY}%`,
      }"
    >
      <span class="soap-bubbles__shell" />
    </div>
  </div>
</template>

<style scoped>
.soap-bubbles {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.soap-bubbles__ambient {
  position: absolute;
  inset: -10%;
  background:
    radial-gradient(ellipse 80% 50% at 50% 100%, rgb(255 255 255 / 18%), transparent 55%),
    radial-gradient(ellipse 60% 40% at 20% 30%, rgb(232 53 125 / 6%), transparent 50%);
}

.soap-bubbles__item {
  position: absolute;
  top: 100%;
  width: var(--size);
  height: var(--size);
  margin-left: calc(var(--size) * -0.5);
  animation: bubble-rise var(--duration) linear var(--delay) infinite;
  will-change: transform, opacity;
}

.soap-bubbles__shell {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  background: radial-gradient(
    circle at 32% 28%,
    rgb(255 255 255 / 58%) 0%,
    rgb(255 255 255 / 14%) 38%,
    rgb(240 106 158 / 8%) 58%,
    rgb(255 255 255 / 5%) 100%
  );
  border: 1px solid rgb(255 255 255 / 52%);
  box-shadow:
    inset 0 0 calc(var(--size) * 0.12) rgb(255 255 255 / 45%),
    inset calc(var(--size) * -0.06) calc(var(--size) * -0.1) calc(var(--size) * 0.22)
      rgb(232 53 125 / 12%),
    0 6px 28px rgb(232 53 125 / 10%);
  animation: bubble-wobble var(--wobble) ease-in-out infinite alternate;
}

.soap-bubbles__shell::before {
  content: '';
  position: absolute;
  width: 30%;
  height: 19%;
  top: 17%;
  left: 20%;
  border-radius: 50%;
  background: rgb(255 255 255 / 82%);
  transform: rotate(-32deg);
  filter: blur(0.4px);
}

.soap-bubbles__shell::after {
  content: '';
  position: absolute;
  width: 11%;
  height: 8%;
  bottom: 26%;
  right: 24%;
  border-radius: 50%;
  background: rgb(255 255 255 / 55%);
  box-shadow: 0 0 6px rgb(255 255 255 / 35%);
}

@keyframes bubble-rise {
  0% {
    transform: translate3d(0, 0, 0) scale(0.7);
    opacity: 0;
  }

  6% {
    opacity: var(--opacity);
  }

  88% {
    opacity: calc(var(--opacity) * 0.9);
  }

  100% {
    transform: translate3d(var(--sway), calc(-100vh - var(--size)), 0) scale(1.02);
    opacity: 0;
  }
}

@keyframes bubble-wobble {
  0% {
    border-radius: 48% 52% 51% 49% / 52% 48% 52% 48%;
    transform: rotate(-2deg) scale(1);
  }

  100% {
    border-radius: 52% 48% 49% 51% / 48% 52% 48% 52%;
    transform: rotate(2deg) scale(1.03);
  }
}

@media (prefers-reduced-motion: reduce) {
  .soap-bubbles__item {
    animation: none;
    top: var(--rest-y);
    opacity: var(--opacity);
  }

  .soap-bubbles__shell {
    animation: none;
  }
}
</style>
