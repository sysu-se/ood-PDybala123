import { Sudoku } from './Sudoku.js';
import { Game } from './Game.js';
import { generateSudoku } from './generator.js';
import { encodeSudoku, decodeSencode, validateSencode } from './sencode.js';

// ─── Sudoku 工厂 ──────────────────────────────────────────────

export function createSudoku(input) {
    return new Sudoku(input);
}

export function createSudokuFromJSON(json) {
    // 兼容新旧格式（旧格式没有 locked 字段）
    return new Sudoku(json.grid, json.locked ?? null);
}

// ─── Game 工厂 ────────────────────────────────────────────────

export function createGame({ sudoku, hintsTotal = 0 }) {
    return new Game(sudoku, [], [], { hintsTotal });
}

export function createGameFromJSON(json) {
    // 使用 Game.fromJSON 进行受控的反序列化
    return Game.fromJSON(json);
}

// ─── 生成器 ───────────────────────────────────────────────────

export { generateSudoku };

// ─── 编码解码 ─────────────────────────────────────────────────

export { encodeSudoku, decodeSencode, validateSencode };
