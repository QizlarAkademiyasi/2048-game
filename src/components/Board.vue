<script setup lang="ts">
import { computed } from 'vue'
import type { Tile as TileModel } from '../game/types'
import { SIZE } from '../game/types'
import Tile from './Tile.vue'

const props = defineProps<{
  tiles: TileModel[]
}>()

const cells = computed(() => Array.from({ length: SIZE * SIZE }, (_, i) => i))

const positioned = computed(() =>
  props.tiles.map((tile) => ({
    ...tile,
    style: {
      '--r': String(tile.row),
      '--c': String(tile.col),
    } as Record<string, string>,
  })),
)
</script>

<template>
  <div class="board" role="grid" aria-label="2048 board">
    <div class="grid-bg">
      <div v-for="cell in cells" :key="cell" class="cell" />
    </div>
    <div class="tiles">
      <div
        v-for="tile in positioned"
        :key="tile.id"
        class="tile-slot"
        :style="tile.style"
      >
        <Tile
          :value="tile.value"
          :is-new="tile.isNew"
          :merged="Boolean(tile.mergedFrom)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.board {
  --cell-size: calc((100% - (var(--gap) * 3)) / 4);
  position: relative;
  width: var(--board-size);
  aspect-ratio: 1;
  padding: var(--gap);
  border-radius: 10px;
  background: var(--board);
  box-shadow: 0 10px 30px var(--shadow);
  touch-action: none;
}

.grid-bg {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: var(--gap);
  width: 100%;
  height: 100%;
}

.tiles {
  position: absolute;
  inset: var(--gap);
}

.cell {
  border-radius: var(--radius);
  background: var(--cell);
}

.tile-slot {
  position: absolute;
  width: var(--cell-size);
  height: var(--cell-size);
  left: calc(var(--c) * (var(--cell-size) + var(--gap)));
  top: calc(var(--r) * (var(--cell-size) + var(--gap)));
  transition:
    left 100ms ease-in-out,
    top 100ms ease-in-out;
}
</style>
