import { Sudoku } from './Sudoku.js';
import { Game } from './Game.js';
import { generateSudoku, generateCustomSudoku } from './generator.js';
import { encodeSudoku, decodeSencode, validateSencode } from './sencode.js';

// ─── Sudoku 工厂 ─────────────────────────
export function createSudoku(input) {
    return new Sudoku(input);
}

export function createSudokuFromJSON(json) {
    return new Sudoku(json.grid, json.given ?? null);
}

// ─── Game 工厂 ───────────────────────────
export function createGame({ sudoku, hintsTotal = 0 }) {
    return new Game(sudoku, { hintsTotal });
}

export function createGameFromJSON(json) {
    return Game.fromJSON(json);
}

// ─── 生成器 ───────────────────────────────
export { generateSudoku, generateCustomSudoku };

// ─── 编码/解码 ───────────────────────────
export { encodeSudoku, decodeSencode, validateSencode };
