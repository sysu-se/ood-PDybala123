import { Sudoku } from './Sudoku.js';

export class Game {
    constructor(sudoku, undoStack=[], redoStack=[], options={}) {
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

    getSudoku() {
        // ─── 最小修改 ─── 返回 Sudoku 实例
        return this._sudoku;
    }

    getGrid() { return this._sudoku.getGrid(); }
    getLocked() { return this._sudoku.getLocked(); }
    getConflicts() { return this._sudoku.getConflicts(); }
    isSolved() { return this._sudoku.isSolved(); }

    canUndo() { return this._isExploring ? this._exploreUndoStack.length>0 : this._undoStack.length>0; }
    canRedo() { return this._isExploring ? false : this._redoStack.length>0; }

    guess(move) {
        if(this._isPaused) return false;
        const { row, col, value } = move;
        const before = this._sudoku.getCell(row,col);

        if(this._isExploring){
            const success = this._sudoku.guess(move);
            if(success) this._exploreUndoStack.push({ row, col, before, after: value });
            return success;
        }

        const success = this._sudoku.guess(move);
        if(!success) return false;
        this._undoStack.push({ row, col, before, after: value });
        this._redoStack=[];
        return true;
    }

    undo() {
        if(this._isPaused) return;
        if(this._isExploring){
            if(!this._exploreUndoStack.length) return;
            const r=this._exploreUndoStack.pop();
            this._sudoku.guess({ row:r.row, col:r.col, value:r.before });
            return;
        }
        if(!this.canUndo()) return;
        const r=this._undoStack.pop();
        this._sudoku.guess({ row:r.row, col:r.col, value:r.before });
        this._redoStack.push(r);
    }

    redo() {
        if(this._isPaused || this._isExploring) return;
        if(!this.canRedo()) return;
        const r=this._redoStack.pop();
        this._sudoku.guess({ row:r.row, col:r.col, value:r.after });
        this._undoStack.push(r);
    }

    toJSON(){
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

    static fromJSON(json){
        const sudoku=new Sudoku(json.current.grid,json.current.locked);
        const game=new Game(sudoku,json.undoStack??[],json.redoStack??[],{hintsTotal:json.hintsTotal??0});
        if(json.isPaused) game._isPaused=true;
        game._hintsUsed=json.hintsUsed??0;
        if(json.isExploring){
            game._isExploring=true;
            game._exploreSnapshot=json.exploreSnapshot;
            game._exploreUndoStack=json.exploreUndoStack??[];
        }
        return game;
    }
}
