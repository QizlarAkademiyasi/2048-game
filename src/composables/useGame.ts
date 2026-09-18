import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  playLose,
  playMerge,
  playMove,
  playNewGame,
  playWin,
  unlock,
} from '../audio/soundEngine'
import { createNewGame, move } from '../game/engine'
import { loadGame, saveGame } from '../game/storage'
import type { Direction, GameSnapshot } from '../game/types'

const SWIPE_THRESHOLD = 40

export function useGame() {
  const state = ref<GameSnapshot>(createNewGame())

  const showWin = computed(
    () => state.value.won && !state.value.keepPlaying && !state.value.over,
  )
  const showLose = computed(() => state.value.over)

  function persist(): void {
    saveGame(state.value)
  }

  function newGame(): void {
    void unlock()
    state.value = createNewGame(state.value.best)
    persist()
    playNewGame()
  }

  function continuePlaying(): void {
    state.value = { ...state.value, keepPlaying: true }
    persist()
  }

  function tryMove(direction: Direction): void {
    void unlock()
    const prev = state.value
    const next = move(prev, direction)
    if (!next) return

    const scoreGain = next.score - prev.score
    if (scoreGain > 0) {
      playMerge(scoreGain)
    } else {
      playMove()
    }

    const becameWin = next.won && !prev.won
    const becameLose = next.over && !prev.over

    state.value = next
    persist()

    if (becameWin) playWin()
    if (becameLose) playLose()
  }

  function onKeydown(event: KeyboardEvent): void {
    const map: Record<string, Direction> = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
      w: 'up',
      W: 'up',
      s: 'down',
      S: 'down',
      a: 'left',
      A: 'left',
      d: 'right',
      D: 'right',
    }
    const direction = map[event.key]
    if (!direction) return
    event.preventDefault()
    tryMove(direction)
  }

  let touchStartX = 0
  let touchStartY = 0

  function onTouchStart(event: TouchEvent): void {
    if (event.touches.length !== 1) return
    touchStartX = event.touches[0].clientX
    touchStartY = event.touches[0].clientY
  }

  function onTouchEnd(event: TouchEvent): void {
    if (event.changedTouches.length !== 1) return
    const dx = event.changedTouches[0].clientX - touchStartX
    const dy = event.changedTouches[0].clientY - touchStartY
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD) return

    if (Math.abs(dx) > Math.abs(dy)) {
      tryMove(dx > 0 ? 'right' : 'left')
    } else {
      tryMove(dy > 0 ? 'down' : 'up')
    }
  }

  onMounted(() => {
    const saved = loadGame()
    if (saved) {
      state.value = saved
    }
    window.addEventListener('keydown', onKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', onKeydown)
  })

  watch(state, persist, { deep: true })

  return {
    state,
    showWin,
    showLose,
    newGame,
    continuePlaying,
    tryMove,
    onTouchStart,
    onTouchEnd,
  }
}
