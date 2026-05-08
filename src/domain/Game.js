import { Sudoku } from './Sudoku.js';

/**
 * Game 核心对象
 * 管理一局游戏的状态、历史记录、Hint、Explore、序列化
 */
export class Game {
    /**
     * @param {Sudoku} sudoku
     * @param {Object} options
     * @param {number} [options.hintsTotal=0] 总提示次数（0表示无限）
     */
    constructor(sudoku, options = {}) {
        this._sudoku = sudoku;
        this._history = [];      // Undo 栈
        this._redoStack = [];    // Redo 栈

        this._hintsUsed = 0;
        this._hintsTotal = options.hintsTotal ?? 0;

        this._isPaused = false;

        // Explore 模式状态
        this._exploring = false;
        this._exploreSnapshot = null;
        this._exploreHistory = [];
    }

    /* ─── 公共属性 ─── */

    get isPaused() { return this._isPaused; }
    get isExploring() { return this._exploring; }
    get hintsUsed() { return this._hintsUsed; }
    get hintsTotal() { return this._hintsTotal; }

    /* ─── 暂停 / 恢复 ─── */

    pause() { this._isPaused = true; }
    resume() { this._isPaused = false; }

    /* ─── Hint 功能 ─── */

    getHintsRemaining() {
        return this._hintsTotal === 0 ? Infinity : Math.max(0, this._hintsTotal - this._hintsUsed);
    }

    useHint() {
        if (this._hintsTotal === 0 || this._hintsUsed < this._hintsTotal) {
            this._hintsUsed++;
            return true;
        }
        return false;
    }

    getCandidates(row, col) { return this._sudoku.getCandidates(row, col); }
    getNextMove() { return this._sudoku.getNextMove(); }

    getHint(type, row, col) {
        return this._sudoku.getHint(type, row, col);
    }

    /* ─── 游戏操作 ─── */

    /**
     * 填入 / 清除格子
     * @param {{row:number, col:number, value:number|null}} move
     * @returns {boolean} 是否成功
     */
    guess(move) {
        if (this._isPaused) return false;

        const { row, col, value } = move;
        const before = this._sudoku.getCell(row, col);
        const success = this._sudoku.guess(move);
        if (!success) return false;

        if (this._exploring) {
            this._exploreHistory.push({ row, col, before, after: value });
        } else {
            this._history.push({ row, col, before, after: value });
            this._redoStack = [];
        }

        return true;
    }

    /* ─── Undo / Redo ─── */

    canUndo() { return this._exploring ? this._exploreHistory.length > 0 : this._history.length > 0; }
    canRedo() { return !this._exploring && this._redoStack.length > 0; }

    undo() {
        if (this._isPaused) return;
        if (this._exploring) {
            if (!this.canUndo()) return;
            const rec = this._exploreHistory.pop();
            this._sudoku.guess({ row: rec.row, col: rec.col, value: rec.before });
        } else {
            if (!this.canUndo()) return;
            const rec = this._history.pop();
            this._sudoku.guess({ row: rec.row, col: rec.col, value: rec.before });
            this._redoStack.push(rec);
        }
    }

    redo() {
        if (this._isPaused || this._exploring) return;
        if (!this.canRedo()) return;
        const rec = this._redoStack.pop();
        this._sudoku.guess({ row: rec.row, col: rec.col, value: rec.after });
        this._history.push(rec);
    }

    /* ─── Explore 模式 ─── */

    exploreStart() {
        if (this._exploring) return false;
        this._exploreSnapshot = {
            grid: this._sudoku.getGrid(),
            given: this._sudoku.getGiven(),
            historyLength: this._history.length
        };
        this._exploreHistory = [];
        this._exploring = true;
        return true;
    }

    exploreCommit() {
        if (!this._exploring) return { success: false };
        const conflicts = this._sudoku.getConflicts();
        if (conflicts.length > 0) return { success: false, hasConflicts: true };

        for (const rec of this._exploreHistory) {
            this._history.push(rec);
        }
        this._redoStack = [];
        this._exploring = false;
        this._exploreSnapshot = null;
        this._exploreHistory = [];

        return { success: true };
    }

    exploreRollback() {
        if (!this._exploring || !this._exploreSnapshot) return;
        this._sudoku.setGrid(this._exploreSnapshot.grid);
        this._exploring = false;
        this._exploreSnapshot = null;
        this._exploreHistory = [];
        this._history.length = this._exploreSnapshot.historyLength;
    }

    /* ─── 读取 Sudoku 状态 ─── */

    getGrid() { return this._sudoku.getGrid(); }
    getGiven() { return this._sudoku.getGiven(); }
    getConflicts() { return this._sudoku.getConflicts(); }
    isSolved() { return this._sudoku.isSolved(); }

    /* ─── 序列化 / 反序列化 ─── */

    toJSON() {
        return {
            sudoku: this._sudoku.toJSON(),
            history: [...this._history],
            redoStack: [...this._redoStack],
            hintsUsed: this._hintsUsed,
            hintsTotal: this._hintsTotal,
            isPaused: this._isPaused,
            exploring: this._exploring,
            exploreSnapshot: this._exploreSnapshot,
            exploreHistory: [...this._exploreHistory]
        };
    }

    static fromJSON(json) {
        const sudoku = new Sudoku(json.sudoku.grid, json.sudoku.given);
        const game = new Game(sudoku, { hintsTotal: json.hintsTotal ?? 0 });
        game._history = json.history ?? [];
        game._redoStack = json.redoStack ?? [];
        game._hintsUsed = json.hintsUsed ?? 0;
        game._isPaused = json.isPaused ?? false;
        game._exploring = json.exploring ?? false;
        game._exploreSnapshot = json.exploreSnapshot ?? null;
        game._exploreHistory = json.exploreHistory ?? [];
        return game;
    }
}
