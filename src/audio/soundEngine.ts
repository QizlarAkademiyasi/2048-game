type Tone = {
  freq: number
  type?: OscillatorType
  duration?: number
  attack?: number
  decay?: number
  gain?: number
  delay?: number
}

let ctx: AudioContext | null = null
let master: GainNode | null = null
let sfxBus: GainNode | null = null
let bgmBus: GainNode | null = null
let muted = false
let unlocked = false
let bgmRunning = false
const bgmNodes: AudioNode[] = []
let bgmOscillators: OscillatorNode[] = []
let bgmTimer: number | null = null
let bgmStep = 0

function ensureContext(): AudioContext {
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = muted ? 0 : 1
    master.connect(ctx.destination)

    sfxBus = ctx.createGain()
    sfxBus.gain.value = 0.85
    sfxBus.connect(master)

    bgmBus = ctx.createGain()
    bgmBus.gain.value = 0.08
    bgmBus.connect(master)
  }
  return ctx
}

function now(): number {
  return ensureContext().currentTime
}

/** Resume AudioContext; returns true when context is running. */
export async function ensureAudioReady(): Promise<boolean> {
  const audio = ensureContext()
  unlocked = true
  if (audio.state === 'suspended') {
    try {
      await audio.resume()
    } catch {
      return false
    }
  }
  if (audio.state === 'running' && !muted && !bgmRunning) {
    startBgm()
  }
  return audio.state === 'running'
}

/** Resume AudioContext; safe to call from any user gesture. */
export async function unlock(): Promise<void> {
  await ensureAudioReady()
}

function playTone({
  freq,
  type = 'sine',
  duration = 0.12,
  attack = 0.005,
  decay = 0.1,
  gain = 0.2,
  delay = 0,
}: Tone): void {
  if (muted) return

  const audio = ensureContext()
  if (!sfxBus || !master) return
  if (audio.state !== 'running') return

  const t0 = audio.currentTime + delay
  const osc = audio.createOscillator()
  const g = audio.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(Math.max(gain, 0.001), t0 + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + decay)
  osc.connect(g)
  g.connect(sfxBus)
  osc.start(t0)
  osc.stop(t0 + Math.max(duration, attack + decay) + 0.02)
}

export function isMuted(): boolean {
  return muted
}

export function isUnlocked(): boolean {
  return unlocked
}

export function setMuted(value: boolean): void {
  muted = value
  const audio = ensureContext()
  if (!master) return
  const t = audio.currentTime
  master.gain.cancelScheduledValues(t)
  master.gain.setTargetAtTime(value ? 0 : 1, t, 0.03)
  if (value) {
    stopBgm()
  } else if (unlocked) {
    startBgm()
  }
}

export function playMove(): void {
  playTone({ freq: 380, type: 'triangle', duration: 0.1, decay: 0.08, gain: 0.22 })
  playTone({ freq: 220, type: 'sine', duration: 0.12, decay: 0.1, gain: 0.12, delay: 0.015 })
}

export function playMerge(scoreGain: number): void {
  const tier = Math.min(8, Math.max(1, Math.log2(Math.max(scoreGain, 2))))
  const base = 440 + tier * 60
  playTone({ freq: base, type: 'sine', duration: 0.16, decay: 0.14, gain: 0.32 })
  playTone({ freq: base * 1.5, type: 'triangle', duration: 0.14, decay: 0.12, gain: 0.18, delay: 0.025 })
  playSpawn()
}

export function playSpawn(): void {
  playTone({ freq: 720, type: 'sine', duration: 0.08, decay: 0.06, gain: 0.14 })
}

export function playWin(): void {
  const notes = [523.25, 659.25, 783.99, 1046.5]
  notes.forEach((freq, i) => {
    playTone({
      freq,
      type: 'sine',
      duration: 0.3,
      attack: 0.01,
      decay: 0.24,
      gain: 0.28,
      delay: i * 0.1,
    })
  })
}

export function playLose(): void {
  ;[280, 220, 160].forEach((freq, i) => {
    playTone({
      freq,
      type: 'triangle',
      duration: 0.35,
      attack: 0.02,
      decay: 0.28,
      gain: 0.2,
      delay: i * 0.12,
    })
  })
}

export function playNewGame(): void {
  playTone({ freq: 480, type: 'sine', duration: 0.12, decay: 0.1, gain: 0.22 })
  playTone({ freq: 640, type: 'triangle', duration: 0.14, decay: 0.12, gain: 0.16, delay: 0.06 })
}

export function playUiClick(): void {
  playTone({ freq: 700, type: 'square', duration: 0.06, decay: 0.05, gain: 0.1 })
}

function clearBgmGraph(): void {
  if (bgmTimer !== null) {
    window.clearInterval(bgmTimer)
    bgmTimer = null
  }
  bgmStep = 0
  for (const osc of bgmOscillators) {
    try {
      osc.stop()
    } catch {
      // already stopped
    }
    try {
      osc.disconnect()
    } catch {
      // ignore
    }
  }
  for (const node of bgmNodes) {
    try {
      node.disconnect()
    } catch {
      // ignore
    }
  }
  bgmOscillators = []
  bgmNodes.length = 0
  bgmRunning = false
}

export function stopBgm(): void {
  if (!bgmRunning || !bgmBus || !ctx) {
    clearBgmGraph()
    return
  }
  const t = now()
  bgmBus.gain.cancelScheduledValues(t)
  bgmBus.gain.setTargetAtTime(0.0001, t, 0.08)
  window.setTimeout(() => clearBgmGraph(), 250)
}

function playBgmNote(
  freq: number,
  duration: number,
  gain: number,
  type: OscillatorType = 'sine',
): void {
  if (!ctx || !bgmBus || muted || freq <= 0) return
  if (ctx.state !== 'running') return
  const t0 = now()
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(Math.max(gain, 0.001), t0 + 0.04)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(g)
  g.connect(bgmBus)
  osc.start(t0)
  osc.stop(t0 + duration + 0.05)
}

export function startBgm(): void {
  if (muted || !unlocked || bgmRunning) return
  const audio = ensureContext()
  if (!bgmBus) return
  if (audio.state !== 'running') return

  clearBgmGraph()
  bgmRunning = true
  bgmBus.gain.cancelScheduledValues(now())
  bgmBus.gain.setValueAtTime(0.0001, now())
  bgmBus.gain.exponentialRampToValueAtTime(0.07, now() + 0.8)

  const melody = [
    392.0, 440.0, 493.88, 587.33, 659.25, 587.33, 493.88, 440.0, 392.0, 493.88, 440.0,
    587.33, 0, 0, 659.25, 587.33, 523.25, 493.88, 440.0, 392.0, 349.23, 392.0, 440.0, 493.88,
    0, 440.0, 392.0, 349.23, 392.0, 0, 0, 0,
  ]

  const stepMs = 480
  bgmTimer = window.setInterval(() => {
    if (muted || !unlocked || !bgmRunning) return
    const freq = melody[bgmStep % melody.length]
    if (freq > 0) {
      playBgmNote(freq, 0.42, 0.055, 'sine')
    }
    bgmStep += 1
  }, stepMs)
}
