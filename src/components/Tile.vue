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
  border-radius: var(--radius-sm);
  font-weight: 700;
  color: var(--text-dark);
  background: var(--tile-2);
  font-size: clamp(22px, 7vw, 36px);
  user-select: none;
  box-shadow:
    0 4px 12px rgb(26 22 37 / 10%),
    0 1px 0 rgb(255 255 255 / 55%) inset;
}

.tile span {
  line-height: 1;
}

.tile-2 {
  background: var(--tile-2);
  color: var(--brand-ink);
  box-shadow:
    0 4px 12px rgb(26 22 37 / 8%),
    0 0 0 1px rgb(232 53 125 / 10%) inset;
}
.tile-4 {
  background: linear-gradient(160deg, #f2f2f2, #eebacd);
  color: var(--brand-ink);
  box-shadow:
    0 4px 12px rgb(232 53 125 / 18%),
    0 1px 0 rgb(255 255 255 / 45%) inset;
}
.tile-8 {
  background: linear-gradient(160deg, #f8c4d8, var(--tile-8));
  color: var(--brand-ink);
}
.tile-16 {
  background: linear-gradient(160deg, var(--brand-primary-light), var(--tile-16));
  color: var(--text-light);
}
.tile-32 {
  background: linear-gradient(160deg, var(--brand-primary-light), var(--tile-32));
  color: var(--text-light);
}
.tile-64 {
  background: linear-gradient(160deg, #e04a88, var(--tile-64));
  color: var(--text-light);
}
.tile-128 {
  background: linear-gradient(160deg, #d03578, var(--tile-128));
  color: var(--text-light);
  font-size: clamp(20px, 6vw, 32px);
}
.tile-256 {
  background: linear-gradient(160deg, #b82862, var(--tile-256));
  color: var(--text-light);
  font-size: clamp(20px, 6vw, 32px);
}
.tile-512 {
  background: linear-gradient(160deg, #9e2254, var(--tile-512));
  color: var(--text-light);
  font-size: clamp(20px, 6vw, 32px);
}
.tile-1024 {
  background: linear-gradient(160deg, #861c48, var(--tile-1024));
  color: var(--text-light);
  font-size: clamp(16px, 5vw, 26px);
}
.tile-2048 {
  background: linear-gradient(145deg, var(--brand-primary-light), var(--tile-2048) 55%, var(--brand-primary-dark));
  color: var(--text-light);
  font-size: clamp(16px, 5vw, 26px);
  box-shadow:
    0 0 24px rgb(232 53 125 / 50%),
    0 1px 0 rgb(255 255 255 / 30%) inset;
}
.tile-super {
  background: linear-gradient(160deg, #2d2640, var(--tile-super));
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
