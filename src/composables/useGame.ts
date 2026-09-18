import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  ensureAudioReady,
  playLose,
  playMerge,
  playMove,
  playNewGame,
  playWin,
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

  async function newGame(): Promise<void> {
    await ensureAudioReady()
    state.value = createNewGame(state.value.best)
    persist()
    playNewGame()
  }

  function continuePlaying(): void {
    state.value = { ...state.value, keepPlaying: true }
    persist()
  }

  async function tryMove(direction: Direction): Promise<void> {
    const prev = state.value
    const next = move(prev, direction)
    if (!next) return

    await ensureAudioReady()

    const scoreGain = next.score - prev.score
    if (scoreGain > 0) {
      playMerge(scoreGain)
    } else {
      playMove()
    }

    state.value = next
    persist()

    if (next.won && !prev.won) playWin()
    if (next.over && !prev.over) playLose()
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
    void tryMove(direction)
  }

  let touchStartX = 0
  let touchStartY = 0
  let touchTracking = false

  function onTouchStart(event: TouchEvent): void {
    if (event.touches.length !== 1) {
      touchTracking = false
      return
    }
    touchTracking = true
    touchStartX = event.touches[0].clientX
    touchStartY = event.touches[0].clientY
    void ensureAudioReady()
  }

  function onTouchMove(event: TouchEvent): void {
    if (!touchTracking || event.touches.length !== 1) return
    event.preventDefault()
  }

  async function onTouchEnd(event: TouchEvent): Promise<void> {
    if (!touchTracking) return
    touchTracking = false
    if (event.changedTouches.length !== 1) return
    const dx = event.changedTouches[0].clientX - touchStartX
    const dy = event.changedTouches[0].clientY - touchStartY
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD) return

    if (Math.abs(dx) > Math.abs(dy)) {
      await tryMove(dx > 0 ? 'right' : 'left')
    } else {
      await tryMove(dy > 0 ? 'down' : 'up')
    }
  }

  let touchRoot: HTMLElement | null = null

  onMounted(() => {
    const saved = loadGame()
    if (saved) {
      state.value = saved
    }
    window.addEventListener('keydown', onKeydown)

    touchRoot = document.getElementById('app')
    if (touchRoot) {
      touchRoot.addEventListener('touchstart', onTouchStart, { passive: true })
      touchRoot.addEventListener('touchmove', onTouchMove, { passive: false })
      touchRoot.addEventListener('touchend', onTouchEnd, { passive: true })
    }
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', onKeydown)
    if (touchRoot) {
      touchRoot.removeEventListener('touchstart', onTouchStart)
      touchRoot.removeEventListener('touchmove', onTouchMove)
      touchRoot.removeEventListener('touchend', onTouchEnd)
    }
  })

  return {
    state,
    showWin,
    showLose,
    newGame,
    continuePlaying,
    tryMove,
  }
}
