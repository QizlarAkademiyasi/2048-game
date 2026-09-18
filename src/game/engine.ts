import { SIZE, type Direction, type GameSnapshot, type Tile } from './types'

let idCounter = 1

export function resetIdCounter(next = 1): void {
  idCounter = next
}

function nextId(): number {
  return idCounter++
}

export function createEmptyGrid(): (Tile | null)[][] {
  return Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => null))
}

export function tilesToGrid(tiles: Tile[]): (Tile | null)[][] {
  const grid = createEmptyGrid()
  for (const tile of tiles) {
    grid[tile.row][tile.col] = tile
  }
  return grid
}

export function gridToTiles(grid: (Tile | null)[][]): Tile[] {
  const tiles: Tile[] = []
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const tile = grid[r][c]
      if (tile) tiles.push(tile)
    }
  }
  return tiles
}

function emptyCells(grid: (Tile | null)[][]): { row: number; col: number }[] {
  const cells: { row: number; col: number }[] = []
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!grid[r][c]) cells.push({ row: r, col: c })
    }
  }
  return cells
}

export function spawnTile(grid: (Tile | null)[][]): Tile | null {
  const cells = emptyCells(grid)
  if (cells.length === 0) return null
  const { row, col } = cells[Math.floor(Math.random() * cells.length)]
  const value = Math.random() < 0.9 ? 2 : 4
  const tile: Tile = { id: nextId(), value, row, col, isNew: true }
  grid[row][col] = tile
  return tile
}

export function createNewGame(best = 0): GameSnapshot {
  resetIdCounter(1)
  const grid = createEmptyGrid()
  spawnTile(grid)
  spawnTile(grid)
  return {
    tiles: gridToTiles(grid),
    score: 0,
    best,
    won: false,
    over: false,
    keepPlaying: false,
    nextId: idCounter,
  }
}

function vectors(direction: Direction): { row: number; col: number } {
  switch (direction) {
    case 'up':
      return { row: -1, col: 0 }
    case 'down':
      return { row: 1, col: 0 }
    case 'left':
      return { row: 0, col: -1 }
    case 'right':
      return { row: 0, col: 1 }
  }
}

function buildTraversals(direction: Direction): { rows: number[]; cols: number[] } {
  const rows = Array.from({ length: SIZE }, (_, i) => i)
  const cols = Array.from({ length: SIZE }, (_, i) => i)
  if (direction === 'right') cols.reverse()
  if (direction === 'down') rows.reverse()
  return { rows, cols }
}

function withinBounds(row: number, col: number): boolean {
  return row >= 0 && row < SIZE && col >= 0 && col < SIZE
}

function findFarthest(
  grid: (Tile | null)[][],
  row: number,
  col: number,
  vector: { row: number; col: number },
): { farthest: { row: number; col: number }; next: { row: number; col: number } | null } {
  let previous = { row, col }
  let next = { row: row + vector.row, col: col + vector.col }

  while (withinBounds(next.row, next.col) && !grid[next.row][next.col]) {
    previous = next
    next = { row: next.row + vector.row, col: next.col + vector.col }
  }

  return {
    farthest: previous,
    next: withinBounds(next.row, next.col) ? next : null,
  }
}

function positionsEqual(a: { row: number; col: number }, b: { row: number; col: number }): boolean {
  return a.row === b.row && a.col === b.col
}

export function move(snapshot: GameSnapshot, direction: Direction): GameSnapshot | null {
  if (snapshot.over) return null
  if (snapshot.won && !snapshot.keepPlaying) return null

  const grid = tilesToGrid(
    snapshot.tiles.map((t) => ({
      ...t,
      isNew: false,
      mergedFrom: undefined,
    })),
  )

  const vector = vectors(direction)
  const { rows, cols } = buildTraversals(direction)
  const mergedIds = new Set<number>()
  let moved = false
  let scoreGain = 0
  let won = snapshot.won

  for (const row of rows) {
    for (const col of cols) {
      const tile = grid[row][col]
      if (!tile) continue

      const { farthest, next } = findFarthest(grid, row, col, vector)

      if (next) {
        const other = grid[next.row][next.col]
        if (other && other.value === tile.value && !mergedIds.has(other.id)) {
          const merged: Tile = {
            id: nextId(),
            value: tile.value * 2,
            row: next.row,
            col: next.col,
            mergedFrom: [tile.id, other.id],
          }
          grid[row][col] = null
          grid[next.row][next.col] = merged
          mergedIds.add(merged.id)
          scoreGain += merged.value
          if (merged.value === 2048) won = true
          moved = true
          continue
        }
      }

      if (!positionsEqual(farthest, { row, col })) {
        grid[row][col] = null
        tile.row = farthest.row
        tile.col = farthest.col
        grid[farthest.row][farthest.col] = tile
        moved = true
      }
    }
  }

  if (!moved) return null

  spawnTile(grid)

  const tiles = gridToTiles(grid)
  const score = snapshot.score + scoreGain
  const best = Math.max(snapshot.best, score)
  const over = !canMove(grid)

  return {
    tiles,
    score,
    best,
    won: won || snapshot.won,
    over,
    keepPlaying: snapshot.keepPlaying,
    nextId: idCounter,
  }
}

export function canMove(grid: (Tile | null)[][]): boolean {
  if (emptyCells(grid).length > 0) return true

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const tile = grid[r][c]
      if (!tile) continue
      const right = c + 1 < SIZE ? grid[r][c + 1] : null
      const down = r + 1 < SIZE ? grid[r + 1][c] : null
      if (right && right.value === tile.value) return true
      if (down && down.value === tile.value) return true
    }
  }
  return false
}

export function restoreFromSnapshot(snapshot: GameSnapshot): void {
  resetIdCounter(snapshot.nextId)
}
