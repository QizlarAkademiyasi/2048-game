<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

type DriftShape = {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  w: number
  h: number
  color: string
  borderRadius: string
  el: HTMLDivElement | null
}

const shapes = ref<DriftShape[]>([])

let raf = 0

const reducedMotion = ref(
  typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
)

function initShapes(viewW: number, viewH: number): DriftShape[] {
  const specs = [
    {
      w: Math.min(480, viewW * 0.62),
      h: Math.min(420, viewH * 0.48),
      color: 'rgb(232 53 125 / 52%)',
      borderRadius: '58% 42% 48% 52% / 46% 54% 44% 56%',
      vx: 0.55,
      vy: 0.38,
    },
    {
      w: Math.min(420, viewW * 0.55),
      h: Math.min(380, viewH * 0.44),
      color: 'rgb(238 186 205 / 72%)',
      borderRadius: '44% 56% 52% 48% / 55% 45% 58% 42%',
      vx: -0.48,
      vy: 0.52,
    },
    {
      w: Math.min(460, viewW * 0.58),
      h: Math.min(360, viewH * 0.42),
      color: 'rgb(240 106 158 / 48%)',
      borderRadius: '50% 50% 42% 58% / 48% 52% 50% 50%',
      vx: 0.4,
      vy: -0.45,
    },
  ]

  const pad = 8
  return specs.map((spec, id) => ({
    id,
    w: spec.w,
    h: spec.h,
    color: spec.color,
    borderRadius: spec.borderRadius,
    vx: spec.vx,
    vy: spec.vy,
    el: null,
    x: pad + Math.random() * Math.max(0, viewW - spec.w - pad * 2),
    y: pad + Math.random() * Math.max(0, viewH - spec.h - pad * 2),
  }))
}

function applyTransform(s: DriftShape) {
  if (s.el) {
    s.el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`
  }
}

function tick() {
  const viewW = window.innerWidth
  const viewH = window.innerHeight

  for (const s of shapes.value) {
    s.x += s.vx
    s.y += s.vy

    if (s.x <= 0) {
      s.x = 0
      s.vx = Math.abs(s.vx)
    } else if (s.x + s.w >= viewW) {
      s.x = viewW - s.w
      s.vx = -Math.abs(s.vx)
    }

    if (s.y <= 0) {
      s.y = 0
      s.vy = Math.abs(s.vy)
    } else if (s.y + s.h >= viewH) {
      s.y = viewH - s.h
      s.vy = -Math.abs(s.vy)
    }

    applyTransform(s)
  }

  raf = requestAnimationFrame(tick)
}

function onResize() {
  cancelAnimationFrame(raf)
  shapes.value = initShapes(window.innerWidth, window.innerHeight)
  for (const s of shapes.value) {
    applyTransform(s)
  }
  if (!reducedMotion.value) {
    raf = requestAnimationFrame(tick)
  }
}

function setBlobRef(id: number, el: HTMLDivElement | null) {
  const s = shapes.value[id]
  if (!s) return
  s.el = el
  if (el) {
    applyTransform(s)
  }
}

function shellStyle(s: DriftShape) {
  return {
    width: `${s.w}px`,
    height: `${s.h}px`,
  }
}

function fillStyle(s: DriftShape) {
  return {
    borderRadius: s.borderRadius,
    background: s.color,
  }
}

onMounted(() => {
  shapes.value = initShapes(window.innerWidth, window.innerHeight)

  if (!reducedMotion.value) {
    raf = requestAnimationFrame(tick)
  }

  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', onResize)
})
</script>

<template>
  <Teleport to="body">
    <div class="bg-shapes" aria-hidden="true">
      <div
        v-for="s in shapes"
        :key="s.id"
        :ref="(el) => setBlobRef(s.id, el as HTMLDivElement | null)"
        class="bg-shapes__shell"
        :style="shellStyle(s)"
      >
        <div class="bg-shapes__fill" :style="fillStyle(s)" />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.bg-shapes {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: visible;
  pointer-events: none;
}

.bg-shapes__shell {
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform;
  transform: translate3d(0, 0, 0);
}

.bg-shapes__fill {
  width: 100%;
  height: 100%;
  filter: blur(48px);
  transform: scale(1.08);
  transform-origin: center;
}

@media (prefers-reduced-motion: reduce) {
  .bg-shapes__fill {
    filter: blur(40px);
  }
}
</style>
