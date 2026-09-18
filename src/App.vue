<script setup lang="ts">
import BackgroundShapes from './components/BackgroundShapes.vue'
import Board from './components/Board.vue'
import GameHeader from './components/GameHeader.vue'
import Overlay from './components/Overlay.vue'
import { useAudio } from './composables/useAudio'
import { useGame } from './composables/useGame'

const { state, showWin, showLose, newGame, continuePlaying } = useGame()
const { muted, toggleMute, showSoundHint } = useAudio()
</script>

<template>
  <BackgroundShapes />
  <div class="app">
    <main class="shell">
      <GameHeader
        :score="state.score"
        :best="state.best"
        :muted="muted"
        :show-sound-hint="showSoundHint"
        @new-game="newGame"
        @toggle-mute="toggleMute"
      />

      <div class="board-wrap">
        <Board :tiles="state.tiles" />
        <Overlay
          v-if="showWin"
          kind="win"
          @continue="continuePlaying"
          @new-game="newGame"
        />
        <Overlay v-else-if="showLose" kind="lose" @new-game="newGame" />
      </div>
    </main>
  </div>
</template>

<style scoped>
.app {
  position: relative;
  z-index: 1;
  width: min(100%, 520px);
  margin: 0 auto;
  padding: 28px 16px 36px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 22px;
}

.shell {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: 0;
  width: 100%;
}

.board-wrap {
  position: relative;
  width: fit-content;
  margin: 0 auto;
  touch-action: none;
}

@media (max-height: 700px) {
  .app {
    padding: 16px 12px 20px;
    gap: 12px;
  }

  .shell {
    gap: 12px;
  }
}
</style>
