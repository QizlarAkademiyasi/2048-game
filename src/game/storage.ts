import type { GameSnapshot } from './types'
import { restoreFromSnapshot } from './engine'

const STORAGE_KEY = 'qa-2048-classic'

export function saveGame(snapshot: GameSnapshot): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  } catch {
    // ignore quota / private mode
  }
}

export function loadGame(): GameSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as GameSnapshot
    if (!data || !Array.isArray(data.tiles)) return null
    restoreFromSnapshot(data)
    return data
  } catch {
    return null
  }
}

export function clearGame(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
