import { onMounted, onUnmounted, ref } from 'vue'
import {
  playUiClick,
  setMuted as setEngineMuted,
  unlock,
} from '../audio/soundEngine'

const STORAGE_KEY = 'qa-2048-audio'

function loadMuted(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const data = JSON.parse(raw) as { muted?: boolean }
    return Boolean(data.muted)
  } catch {
    return false
  }
}

function saveMuted(muted: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ muted }))
  } catch {
    // ignore
  }
}

export function useAudio() {
  const muted = ref(loadMuted())

  setEngineMuted(muted.value)

  async function unlockOnGesture(): Promise<void> {
    await unlock()
  }

  function toggleMute(): void {
    if (!muted.value) {
      playUiClick()
      muted.value = true
      setEngineMuted(true)
    } else {
      muted.value = false
      setEngineMuted(false)
      void unlock().then(() => playUiClick())
    }
    saveMuted(muted.value)
  }

  function onFirstGesture(): void {
    void unlockOnGesture()
    window.removeEventListener('pointerdown', onFirstGesture)
    window.removeEventListener('keydown', onFirstGesture)
  }

  onMounted(() => {
    window.addEventListener('pointerdown', onFirstGesture, { once: true })
    window.addEventListener('keydown', onFirstGesture, { once: true })
  })

  onUnmounted(() => {
    window.removeEventListener('pointerdown', onFirstGesture)
    window.removeEventListener('keydown', onFirstGesture)
  })

  return {
    muted,
    toggleMute,
    unlockOnGesture,
  }
}
