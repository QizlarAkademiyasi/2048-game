<script setup lang="ts">
defineProps<{
  kind: 'win' | 'lose'
}>()

defineEmits<{
  continue: []
  newGame: []
}>()
</script>

<template>
  <div class="overlay" role="dialog" aria-modal="true">
    <div class="panel">
      <p class="message">{{ kind === 'win' ? 'You win!' : 'Game over!' }}</p>
      <div class="actions">
        <button
          v-if="kind === 'win'"
          type="button"
          class="btn primary"
          @click="$emit('continue')"
        >
          Keep going
        </button>
        <button type="button" class="btn" :class="kind === 'lose' ? 'primary' : 'ghost'" @click="$emit('newGame')">
          Try again
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  background: rgb(250 248 249 / 72%);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  animation: fade-in 180ms ease-out;
  z-index: 5;
}

.panel {
  text-align: center;
  padding: 28px 32px;
  border-radius: var(--radius-lg);
  background: var(--surface);
  box-shadow:
    0 24px 48px rgb(26 22 37 / 14%),
    0 0 0 1px rgb(232 53 125 / 12%);
}

.message {
  margin: 0 0 20px;
  font-size: clamp(28px, 8vw, 42px);
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--brand-ink), var(--brand-primary));
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.btn {
  padding: 12px 20px;
  border-radius: var(--radius);
  font-size: 15px;
  font-weight: 700;
  background: var(--brand-accent-muted);
  color: var(--brand-ink);
  transition:
    background var(--transition),
    box-shadow var(--transition);
}

.btn.primary {
  background: linear-gradient(145deg, var(--brand-primary-light), var(--brand-primary));
  color: var(--text-light);
  box-shadow: 0 4px 14px var(--shadow-brand);
}

.btn.primary:hover {
  filter: brightness(1.05);
  box-shadow: 0 6px 18px var(--shadow-brand);
}

.btn.ghost {
  background: transparent;
  border: 2px solid var(--brand-primary);
  color: var(--brand-primary);
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (hover: none) and (pointer: coarse) {
  .overlay {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background: rgb(250 248 249 / 88%);
  }
}
</style>
