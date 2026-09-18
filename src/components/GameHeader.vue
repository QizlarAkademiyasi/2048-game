<script setup lang="ts">
defineProps<{
  score: number
  best: number
  muted: boolean
}>()

defineEmits<{
  newGame: []
  toggleMute: []
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
      <div class="actions">
        <button
          type="button"
          class="mute"
          :aria-label="muted ? 'Unmute sound' : 'Mute sound'"
          :title="muted ? 'Unmute' : 'Mute'"
          @click="$emit('toggleMute')"
        >
          <span aria-hidden="true">{{ muted ? '🔇' : '🔊' }}</span>
        </button>
        <button type="button" class="new-game" @click="$emit('newGame')">New Game</button>
      </div>
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
  min-width: 76px;
  padding: 10px 14px;
  border-radius: var(--radius);
  background: linear-gradient(145deg, var(--brand-primary-light), var(--brand-primary));
  text-align: center;
  color: var(--text-light);
  box-shadow:
    0 4px 14px var(--shadow-brand),
    0 1px 0 rgb(255 255 255 / 25%) inset;
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
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, var(--brand-ink) 30%, var(--brand-primary) 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mute {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--brand-primary);
  font-size: 20px;
  line-height: 1;
  box-shadow: 0 2px 8px var(--shadow);
  transition:
    background var(--transition),
    box-shadow var(--transition);
}

.mute:hover {
  background: var(--brand-accent-soft);
  box-shadow: 0 4px 12px var(--shadow-brand);
}

.new-game {
  padding: 12px 20px;
  border-radius: var(--radius);
  background: linear-gradient(145deg, var(--brand-primary-light), var(--brand-primary));
  color: var(--text-light);
  font-size: 15px;
  font-weight: 700;
  box-shadow: 0 4px 14px var(--shadow-brand);
  transition:
    box-shadow var(--transition),
    filter var(--transition);
}

.new-game:hover {
  filter: brightness(1.05);
  box-shadow: 0 6px 18px var(--shadow-brand);
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

  .mute {
    width: 40px;
    height: 40px;
  }
}
</style>
