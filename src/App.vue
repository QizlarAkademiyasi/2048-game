<script setup lang="ts">
import Board from './components/Board.vue'
import GameHeader from './components/GameHeader.vue'
import Overlay from './components/Overlay.vue'
import { useAudio } from './composables/useAudio'
import { useGame } from './composables/useGame'

const { state, showWin, showLose, newGame, continuePlaying, onTouchStart, onTouchEnd } =
  useGame()
const { muted, toggleMute } = useAudio()
</script>

<template>
  <div class="app">
    <main class="shell">
      <GameHeader
        :score="state.score"
        :best="state.best"
        :muted="muted"
        @new-game="newGame"
        @toggle-mute="toggleMute"
      />

      <div
        class="board-wrap"
        @touchstart.passive="onTouchStart"
        @touchend.passive="onTouchEnd"
      >
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
  width: min(100%, 520px);
  margin: 0 auto;
  padding: 28px 16px 36px;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 22px;
}

.shell {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.board-wrap {
  position: relative;
  width: fit-content;
  margin: 0 auto;
}
</style>
