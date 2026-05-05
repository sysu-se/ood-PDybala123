import { writable } from 'svelte/store'
import { createGame } from '../domain/game.js'
import { createSudoku } from '../domain/sudoku.js'

export function createGameStore(initialGrid) {
  const sudoku = createSudoku(initialGrid)
  let game = createGame({ sudoku })

  const { subscribe, set } = writable(getSnapshot())

  function getSnapshot() {
    const s = game.getSudoku()

    return {
      grid: s.getGrid(),
      canUndo: game.canUndo(),
      canRedo: game.canRedo(),
      exploring: state.exploring
    }
  }

  function update() {
    set(getSnapshot())
  }

  // 🔥 Explore 状态（在 store 层管理更简单）
  const state = {
    exploring: false,
    exploreBase: null
  }

  return {
    subscribe,

    guess(move) {
      game.guess(move)
      update()
    },

    undo() {
      game.undo()
      update()
    },

    redo() {
      game.redo()
      update()
    },

    // ✅ Hint
    getCandidates(row, col) {
      return game.getSudoku().getCandidates(row, col)
    },

    // 🚀 Explore
    startExplore() {
      state.exploring = true
      state.exploreBase = game.getSudoku().clone()
      update()
    },

    commitExplore() {
      state.exploring = false
      state.exploreBase = null
      update()
    },

    rollbackExplore() {
      if (state.exploreBase) {
        game = createGame({ sudoku: state.exploreBase.clone() })
      }
      state.exploring = false
      state.exploreBase = null
      update()
    }
  }
}
