import { Sudoku } from './Sudoku.js';
import { Game } from './Game.js';
import { generateSudoku } from './generator.js';
import { encodeSudoku, decodeSencode, validateSencode } from './sencode.js';

export function createSudoku(input){ return new Sudoku(input); }
export function createSudokuFromJSON(json){ return new Sudoku(json.grid,json.locked??null); }
export function createGame({ sudoku, hintsTotal=0 }){ return new Game(sudoku,[],[],{hintsTotal}); }
export function createGameFromJSON(json){ return Game.fromJSON(json); }

export { generateSudoku };
export { encodeSudoku, decodeSencode, validateSencode };
