import { Sudoku } from './Sudoku.js';

export class Game {
    constructor(sudoku, undoStack = [], redoStack = [], options = {}) {
        this._sudoku = sudoku;
        this._undoStack = [...undoStack];
        this._redoStack = [...redoStack];

        this._isPaused = false;
        this._hintsUsed = 0;
        this._hintsTotal = options.hintsTotal ?? 0;

        this._isExploring = false;
        this._exploreSnapshot = null;
        this._exploreUndoStack = [];
    }

    get isPaused() { return this._isPaused; }
    get isExploring() { return this._isExploring; }
    get hintsUsed() { return this._hintsUsed; }
    get hintsTotal() { return this._hintsTotal; }

    pause() { this._isPaused = true; }
    resume() { this._isPaused = false; }

    getHintsRemaining() {
        if (this._hintsTotal === 0) return Infinity;
        return Math.max(0, this._hintsTotal - this._hintsUsed);
    }

    useHint() {
        if (this._hintsTotal === 0 || this._hintsUsed < this._hintsTotal) {
            this._hintsUsed++;
            return true;
        }
        return false;
    }

    getSudoku() {
        return {
            getGrid: () => this._sudoku.getGrid(),
            getLocked: () => this._sudoku.getLocked(),
            getCandidates: (r,c) => this._sudoku.getCandidates(r,c),
            getNextMove: () => this._sudoku.getNextMove(),
            isSolved: () => this._sudoku.isSolved(),
            getConflicts: () => this._sudoku.getConflicts()
        };
    }

    getGrid() { return this._sudoku.getGrid(); }
    getLocked() { return this._sudoku.getLocked(); }
    getConflicts() { return this._sudoku.getConflicts(); }
    isSolved() { return this._sudoku.isSolved(); }
    canUndo() { return this._isExploring ? this._exploreUndoStack.length > 0 : this._undoStack.length > 0; }
    canRedo() { return !this._isExploring && this._redoStack.length > 0; }

    guess(move) {
        if (this._isPaused) return false;
        const { row, col, value } = move;
        const before = this._sudoku.getCell(row, col);

        if (this._isExploring) {
            const success = this._sudoku.guess(move);
            if (success) this._exploreUndoStack.push({ row, col, before, after: value ?? 0 });
            return success;
        }

        const success = this._sudoku.guess(move);
        if (!success) return false;
        this._undoStack.push({ row, col, before, after: value ?? 0 });
        this._redoStack = [];
        return true;
    }

    undo() {
        if (this._isPaused) return;
        if (this._isExploring) {
            if (!this._exploreUndoStack.length) return;
            const r = this._exploreUndoStack.pop();
            this._sudoku.guess({ row: r.row, col: r.col, value: r.before });
            return;
        }

        if (!this.canUndo()) return;
        const record = this._undoStack.pop();
        this._sudoku.guess({ row: record.row, col: record.col, value: record.before });
        this._redoStack.push(record);
    }

    redo() {
        if (this._isPaused || this._isExploring) return;
        if (!this.canRedo()) return;
        const record = this._redoStack.pop();
        this._sudoku.guess({ row: record.row, col: record.col, value: record.after });
        this._undoStack.push(record);
    }

    getCandidates(row, col) { return this._sudoku.getCandidates(row, col); }
    getNextMove() { return this._sudoku.getNextMove(); }

    hint(type, row, col) {
        if (this._isPaused) return null;
        if (type === 'candidates') {
            return { type:'candidates', data:{ row, col, candidates:this.getCandidates(row, col) } };
        }
        if (type === 'next') {
            const move = this.getNextMove();
            return move ? { type:'next', data: move } : { type:'none', data:null };
        }
        return null;
    }

    exploreStart() {
        if (this._isExploring) return false;
        this._exploreSnapshot = {
            grid: this._sudoku.getGrid(),
            locked: this._sudoku.getLocked(),
            undoStackLength: this._undoStack.length
        };
        this._exploreUndoStack = [];
        this._isExploring = true;
        return true;
    }

    exploreCommit() {
        if (!this._isExploring) return { success:false };
        if (this._sudoku.getConflicts().length > 0) return { success:false, hasConflicts:true };
        for (const r of this._exploreUndoStack) this._undoStack.push(r);
        this._isExploring = false;
        this._exploreSnapshot = null;
        this._exploreUndoStack = [];
        this._redoStack = [];
        return { success:true };
    }

    exploreRollback() {
        if (!this._isExploring || !this._exploreSnapshot) return;
        this._sudoku.setGrid(this._exploreSnapshot.grid);
        this._undoStack.length = this._exploreSnapshot.undoStackLength;
        this._isExploring = false;
        this._exploreSnapshot = null;
        this._exploreUndoStack = [];
    }

    toJSON() {
        return {
            current: this._sudoku.toJSON(),
            undoStack: [...this._undoStack],
            redoStack: [...this._redoStack],
            isPaused: this._isPaused,
            hintsUsed: this._hintsUsed,
            hintsTotal: this._hintsTotal,
            isExploring: this._isExploring,
            exploreSnapshot: this._exploreSnapshot,
            exploreUndoStack: [...this._exploreUndoStack]
        };
    }

    static fromJSON(json) {
        const sudoku = new Sudoku(json.current.grid, json.current.locked);
        const game = new Game(sudoku, json.undoStack ?? [], json.redoStack ?? [], {
            hintsTotal: json.hintsTotal ?? 0
        });
        game._restoreState({
            isPaused: json.isPaused,
            hintsUsed: json.hintsUsed,
            isExploring: json.isExploring,
            exploreSnapshot: json.exploreSnapshot,
            exploreUndoStack: json.exploreUndoStack ?? []
        });
        return game;
    }

    _restoreState(state) {
        this._isPaused = !!state.isPaused;
        if (state.hintsUsed !== undefined) this._hintsUsed = state.hintsUsed;
        if (state.isExploring) {
            this._isExploring = true;
            this._exploreSnapshot = state.exploreSnapshot;
            this._exploreUndoStack = state.exploreUndoStack ?? [];
        }
    }
}
