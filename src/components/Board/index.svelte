<script>
    import { BOX_SIZE, SUDOKU_SIZE } from '../../domain/constants.js';
    import { settings } from '../../domain/stores/settings.js';
    import { cursor } from '../../domain/stores/cursor.js';
    import { getGameContext } from '../../domain/context.js';
    import Cell from './Cell.svelte';

    export let grid = [];
    export let locked = [];
    export let conflicts = [];
    export let isPaused = false;
    export let candidates = {};
    export let onAction = () => {};
    export let isExploring = false;
    export let gameStore = null;

    // 从 gameState 获取只读状态
    $: gs = gameStore ? $gameStore : null;

    // 动态计算当前格子的候选数（通过 gameStore）
    $: currentCandidates = (() => {
        if (!isExploring || !gs) return {};
        const result = {};
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const val = grid[r]?.[c];
                if (val === 0 || val === null) {
                    const cands = gameStore.getCandidates(r, c);
                    if (cands && cands.length > 0) {
                        result[`${c},${r}`] = cands;
                    }
                }
            }
        }
        return result;
    })();

    // 响应式冲突集合
    $: conflictSet = conflicts ? new Set(conflicts.map(c => `${c.row},${c.col}`)) : new Set();

    function isSelected(cursorStore, x, y) {
        return cursorStore.x === x && cursorStore.y === y;
    }

    function isSameArea(cursorStore, x, y) {
        if (cursorStore.x === null && cursorStore.y === null) return false;
        if (cursorStore.x === x || cursorStore.y === y) return true;

        const cursorBoxX = Math.floor(cursorStore.x / BOX_SIZE);
        const cursorBoxY = Math.floor(cursorStore.y / BOX_SIZE);
        const cellBoxX = Math.floor(x / BOX_SIZE);
        const cellBoxY = Math.floor(y / BOX_SIZE);
        return (cursorBoxX === cellBoxX && cursorBoxY === cellBoxY);
    }

    function getValueAtCursor(gridData, cursorStore) {
        if (cursorStore.x === null && cursorStore.y === null) return null;
        if (!gridData || !gridData[cursorStore.y]) return null;
        return gridData[cursorStore.y][cursorStore.x];
    }

    function isLocked(x, y) {
        return locked?.[y]?.[x] ?? false;
    }

    function isUserFilled(x, y, value) {
        return !isLocked(x, y) && value !== 0 && value !== null;
    }
    
    // 只有用户填入的且有冲突的数字才标红
    function shouldRedText(x, y, value) {
        return isUserFilled(x, y, value) && conflictSet.has(`${y},${x}`);
    }
</script>

<div class="board-padding relative z-10">
    <div class="max-w-xl relative">
        <div class="w-full" style="padding-top: 100%"></div>
    </div>
    <div class="board-padding absolute inset-0 flex justify-center">

        <div class="bg-white shadow-2xl rounded-xl overflow-hidden w-full h-full max-w-xl grid grid-cols-9 grid-rows-9" class:bg-gray-200={isPaused}>

            {#if grid && grid.length > 0}
                {#each grid as row, y}
                    {#each row as value, x}
                        <Cell {value}
                              cellY={y + 1}
                              cellX={x + 1}
                              candidates={isExploring ? (currentCandidates[x + ',' + y] || []) : candidates[x + ',' + y]}
                              disabled={false}
                              selected={isSelected($cursor, x, y)}

                              userNumber={isUserFilled(x, y, value)}
                              conflictingNumber={shouldRedText(x, y, value)}

                              sameArea={$settings.highlightCells && !isSelected($cursor, x, y) && isSameArea($cursor, x, y)}
                              sameNumber={$settings.highlightSame && value && !isSelected($cursor, x, y) && getValueAtCursor(grid, $cursor) === value} />
                    {/each}
                {/each}
            {/if}

        </div>

    </div>
</div>

<style>
    .board-padding {
        @apply px-4 pb-4;
    }
</style>
