// src/domain/index.js
import { createSudoku as _createSudoku, createSudokuFromJSON as _createSudokuFromJSON } from './Sudoku';
import { createGame as _createGame, createGameFromJSON as _createGameFromJSON } from './Game';

export function createSudoku(input) {
  return _createSudoku(input);
}

export function createSudokuFromJSON(json) {
  return _createSudokuFromJSON(json);
}

export function createGame({ sudoku }) {
  return _createGame({ sudoku });
}

export function createGameFromJSON(json) {
  return _createGameFromJSON(json);
}
