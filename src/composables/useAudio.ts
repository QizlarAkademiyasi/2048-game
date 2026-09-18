import { onMounted, ref } from 'vue'
import {
  isUnlocked,
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
  const showSoundHint = ref(!muted.value && !isUnlocked())

  setEngineMuted(muted.value)

  async function unlockOnGesture(): Promise<void> {
    await unlock()
    if (isUnlocked()) {
      showSoundHint.value = false
    }
  }

  function toggleMute(): void {
    if (!muted.value) {
      playUiClick()
      muted.value = true
      setEngineMuted(true)
      showSoundHint.value = false
    } else {
      muted.value = false
      setEngineMuted(false)
      void unlock().then(() => {
        playUiClick()
        showSoundHint.value = false
      })
    }
    saveMuted(muted.value)
  }

  function onFirstGesture(): void {
    void unlockOnGesture()
  }

  onMounted(() => {
    window.addEventListener('pointerdown', onFirstGesture, { once: true, capture: true })
    window.addEventListener('touchstart', onFirstGesture, { once: true, capture: true, passive: true })
    window.addEventListener('keydown', onFirstGesture, { once: true })
  })

  return {
    muted,
    toggleMute,
    showSoundHint,
  }
}
