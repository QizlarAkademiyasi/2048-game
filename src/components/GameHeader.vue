<script setup lang="ts">
defineProps<{
  score: number
  best: number
}>()

defineEmits<{
  newGame: []
}>()
</script>

<template>
  <header class="header">
    <div class="brand">
      <img class="logo" src="/logo.svg" alt="Qizlar Akademiyasi" width="180" height="48" />
    </div>

    <div class="scores">
      <div class="score-box">
        <span class="label">Score</span>
        <span class="value">{{ score }}</span>
      </div>
      <div class="score-box">
        <span class="label">Best</span>
        <span class="value">{{ best }}</span>
      </div>
    </div>

    <div class="title-row">
      <h1 class="title">2048</h1>
      <button type="button" class="new-game" @click="$emit('newGame')">New Game</button>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px 16px;
  align-items: center;
  width: 100%;
}

.brand {
  grid-column: 1;
}

.logo {
  display: block;
  height: 44px;
  width: auto;
  max-width: 100%;
}

.scores {
  grid-column: 2;
  display: flex;
  gap: 8px;
}

.score-box {
  min-width: 72px;
  padding: 8px 12px;
  border-radius: var(--radius);
  background: var(--brand-primary);
  text-align: center;
  color: var(--text-light);
}

.label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.9;
}

.value {
  display: block;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
}

.title-row {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.title {
  margin: 0;
  font-size: clamp(40px, 12vw, 56px);
  font-weight: 800;
  line-height: 1;
  color: var(--brand-ink);
  letter-spacing: -0.02em;
}

.new-game {
  padding: 12px 18px;
  border-radius: var(--radius);
  background: var(--brand-primary);
  color: var(--text-light);
  font-size: 15px;
  font-weight: 700;
  transition: background var(--transition);
}

.new-game:hover {
  background: var(--brand-primary-dark);
}

@media (max-width: 420px) {
  .logo {
    height: 38px;
  }

  .score-box {
    min-width: 64px;
    padding: 6px 10px;
  }

  .value {
    font-size: 18px;
  }
}
</style>
