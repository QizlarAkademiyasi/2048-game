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
  border-radius: 10px;
  background: color-mix(in srgb, var(--bg) 78%, transparent);
  backdrop-filter: blur(2px);
  animation: fade-in 180ms ease-out;
  z-index: 5;
}

.panel {
  text-align: center;
  padding: 8px;
}

.message {
  margin: 0 0 16px;
  font-size: clamp(28px, 8vw, 42px);
  font-weight: 800;
  color: var(--brand-ink);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.btn {
  padding: 12px 18px;
  border-radius: var(--radius);
  font-size: 15px;
  font-weight: 700;
  background: var(--surface);
  color: var(--brand-ink);
}

.btn.primary {
  background: var(--brand-primary);
  color: var(--text-light);
}

.btn.primary:hover {
  background: var(--brand-primary-dark);
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
</style>
