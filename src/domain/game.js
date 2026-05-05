import { createSudokuFromJSON } from './sudoku.js'

export function createGame({ sudoku }) {
  let current = sudoku

  let undoStack = []
  let redoStack = []

  function getSudoku() {
    return current
  }

  function guess(move) {
    // 存快照（关键！）
    undoStack.push(current.clone())
    redoStack = []

    current.guess(move)
  }

  function undo() {
    if (!canUndo()) return

    redoStack.push(current.clone())
    current = undoStack.pop()
  }

  function redo() {
    if (!canRedo()) return

    undoStack.push(current.clone())
    current = redoStack.pop()
  }

  function canUndo() {
    return undoStack.length > 0
  }

  function canRedo() {
    return redoStack.length > 0
  }

  function toJSON() {
    return {
      current: current.toJSON(),
      undoStack: undoStack.map(s => s.toJSON()),
      redoStack: redoStack.map(s => s.toJSON())
    }
  }

  return {
    getSudoku,
    guess,
    undo,
    redo,
    canUndo,
    canRedo,
    toJSON
  }
}

export function createGameFromJSON(json) {
  return createGame({
    sudoku: createSudokuFromJSON(json.current)
  })
}
