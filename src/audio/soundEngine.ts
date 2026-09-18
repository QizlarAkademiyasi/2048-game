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

function ensureContext(): AudioContext {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 1
    master.connect(ctx.destination)

    sfxBus = ctx.createGain()
    sfxBus.gain.value = 0.55
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

function playTone({
  freq,
  type = 'sine',
  duration = 0.12,
  attack = 0.005,
  decay = 0.1,
  gain = 0.2,
  delay = 0,
}: Tone): void {
  if (muted || !unlocked) return
  const audio = ensureContext()
  if (!sfxBus) return

  const t0 = now() + delay
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
  osc.stop(t0 + duration)
}

export function isMuted(): boolean {
  return muted
}

export function isUnlocked(): boolean {
  return unlocked
}

export function setMuted(value: boolean): void {
  muted = value
  if (!master) return
  const t = now()
  master.gain.cancelScheduledValues(t)
  master.gain.setTargetAtTime(value ? 0 : 1, t, 0.03)
  if (value) {
    stopBgm()
  } else if (unlocked) {
    startBgm()
  }
}

export async function unlock(): Promise<void> {
  const audio = ensureContext()
  if (audio.state === 'suspended') {
    await audio.resume()
  }
  unlocked = true
  if (!muted) {
    startBgm()
  }
}

export function playMove(): void {
  playTone({ freq: 320, type: 'triangle', duration: 0.08, decay: 0.06, gain: 0.08 })
  playTone({ freq: 180, type: 'sine', duration: 0.1, decay: 0.08, gain: 0.05, delay: 0.01 })
}

export function playMerge(scoreGain: number): void {
  const tier = Math.min(8, Math.max(1, Math.log2(Math.max(scoreGain, 2))))
  const base = 420 + tier * 55
  playTone({ freq: base, type: 'sine', duration: 0.14, decay: 0.12, gain: 0.18 })
  playTone({ freq: base * 1.5, type: 'triangle', duration: 0.12, decay: 0.1, gain: 0.1, delay: 0.02 })
  playSpawn()
}

export function playSpawn(): void {
  playTone({ freq: 660, type: 'sine', duration: 0.07, decay: 0.05, gain: 0.06 })
}

export function playWin(): void {
  const notes = [523.25, 659.25, 783.99, 1046.5]
  notes.forEach((freq, i) => {
    playTone({
      freq,
      type: 'sine',
      duration: 0.28,
      attack: 0.01,
      decay: 0.22,
      gain: 0.16,
      delay: i * 0.1,
    })
  })
}

export function playLose(): void {
  ;[280, 220, 160].forEach((freq, i) => {
    playTone({
      freq,
      type: 'sawtooth',
      duration: 0.35,
      attack: 0.02,
      decay: 0.28,
      gain: 0.1,
      delay: i * 0.12,
    })
  })
}

export function playNewGame(): void {
  playTone({ freq: 480, type: 'sine', duration: 0.1, decay: 0.08, gain: 0.12 })
  playTone({ freq: 640, type: 'triangle', duration: 0.12, decay: 0.1, gain: 0.1, delay: 0.06 })
}

export function playUiClick(): void {
  playTone({ freq: 700, type: 'square', duration: 0.05, decay: 0.04, gain: 0.04 })
}

let bgmTimer: number | null = null
let bgmStep = 0

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
  if (!bgmRunning || !bgmBus || !ctx) return
  const t = now()
  bgmBus.gain.cancelScheduledValues(t)
  bgmBus.gain.setTargetAtTime(0.0001, t, 0.08)
  window.setTimeout(() => clearBgmGraph(), 250)
}

function playBgmNote(
  freq: number,
  duration: number,
  gain: number,
  type: OscillatorType = 'triangle',
): void {
  if (!ctx || !bgmBus || muted) return
  const t0 = now()
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(Math.max(gain, 0.001), t0 + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(g)
  g.connect(bgmBus)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

export function startBgm(): void {
  if (muted || !unlocked || bgmRunning) return
  ensureContext()
  if (!bgmBus) return

  clearBgmGraph()
  bgmRunning = true
  bgmBus.gain.cancelScheduledValues(now())
  bgmBus.gain.setValueAtTime(0.0001, now())
  bgmBus.gain.exponentialRampToValueAtTime(0.14, now() + 0.4)

  // Cheerful C-major arpeggio only (no continuous pad drone)
  // C5 D5 E5 G5 A5 G5 E5 D5 | E5 G5 A5 C6 A5 G5 E5 C5
  const melody = [
    523.25, 587.33, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33, 659.25, 783.99, 880.0,
    1046.5, 880.0, 783.99, 659.25, 523.25,
  ]
  const bass = [
    130.81, 0, 0, 0, 196.0, 0, 0, 0, 146.83, 0, 0, 0, 196.0, 0, 130.81, 0,
  ]

  const stepMs = 220
  bgmTimer = window.setInterval(() => {
    if (muted || !unlocked || !bgmRunning) return
    const i = bgmStep % melody.length
    playBgmNote(melody[i], 0.18, 0.11, 'triangle')
    if (bass[i] > 0) {
      playBgmNote(bass[i], 0.22, 0.05, 'sine')
    }
    bgmStep += 1
  }, stepMs)
}
