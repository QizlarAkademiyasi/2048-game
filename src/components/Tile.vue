<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  value: number
  isNew?: boolean
  merged?: boolean
}>()

const className = computed(() => {
  const classes = [`tile`, `tile-${Math.min(props.value, 2048)}`]
  if (props.value > 2048) classes.push('tile-super')
  if (props.isNew) classes.push('tile-new')
  if (props.merged) classes.push('tile-merged')
  return classes.join(' ')
})
</script>

<template>
  <div :class="className">
    <span>{{ value }}</span>
  </div>
</template>

<style scoped>
.tile {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius);
  font-weight: 700;
  color: var(--text-dark);
  background: var(--tile-2);
  font-size: clamp(22px, 7vw, 36px);
  user-select: none;
}

.tile span {
  line-height: 1;
}

.tile-2 {
  background: var(--tile-2);
  color: var(--brand-ink);
}
.tile-4 {
  background: var(--tile-4);
  color: var(--brand-ink);
}
.tile-8 {
  background: var(--tile-8);
  color: var(--text-light);
}
.tile-16 {
  background: var(--tile-16);
  color: var(--text-light);
}
.tile-32 {
  background: var(--tile-32);
  color: var(--text-light);
}
.tile-64 {
  background: var(--tile-64);
  color: var(--text-light);
}
.tile-128 {
  background: var(--tile-128);
  color: var(--text-light);
  font-size: clamp(20px, 6vw, 32px);
  box-shadow: 0 0 0 1px rgb(255 255 255 / 15%) inset;
}
.tile-256 {
  background: var(--tile-256);
  color: var(--text-light);
  font-size: clamp(20px, 6vw, 32px);
}
.tile-512 {
  background: var(--tile-512);
  color: var(--text-light);
  font-size: clamp(20px, 6vw, 32px);
}
.tile-1024 {
  background: var(--tile-1024);
  color: var(--text-light);
  font-size: clamp(16px, 5vw, 26px);
}
.tile-2048 {
  background: var(--tile-2048);
  color: var(--text-light);
  font-size: clamp(16px, 5vw, 26px);
  box-shadow: 0 0 18px rgb(232 53 125 / 45%);
}
.tile-super {
  background: var(--tile-super);
  color: var(--text-light);
  font-size: clamp(14px, 4.5vw, 22px);
}

.tile-new {
  animation: appear 160ms ease-out;
}

.tile-merged {
  animation: pop 160ms ease-out;
}

@keyframes appear {
  from {
    transform: scale(0);
    opacity: 0.4;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes pop {
  0% {
    transform: scale(0.85);
  }
  50% {
    transform: scale(1.12);
  }
  100% {
    transform: scale(1);
  }
}
</style>
