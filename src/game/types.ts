export type Direction = 'up' | 'down' | 'left' | 'right'

export interface Tile {
  id: number
  value: number
  row: number
  col: number
  mergedFrom?: [number, number]
  isNew?: boolean
}

export interface GameSnapshot {
  tiles: Tile[]
  score: number
  best: number
  won: boolean
  over: boolean
  keepPlaying: boolean
  nextId: number
}

export const SIZE = 4
