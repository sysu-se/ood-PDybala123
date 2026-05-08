<script>
	import { getGameContext } from '../../../domain/context.js';
	import { cursor } from '../../../domain/stores/cursor.js';
	import { notes } from '../../../domain/stores/notes.js';

	export let onAction = () => {};
	export let hintsRemaining = Infinity;
	export let isExploring = false;

	const gameStore = getGameContext();

	// 从 gameState 获取状态
	$: gs = $gameStore;
	$: canUndo = gs?.canUndo ?? false;
	$: canRedo = gs?.canRedo ?? false;
	$: isSolved = gs?.solved ?? false;
	$: grid = gs?.grid ?? [];

	$: currentCell = grid[$cursor.y]?.[$cursor.x] ?? 0;

	// 获取当前格子的候选数
	function getCellCandidates() {
		if (currentCell !== 0 && currentCell !== null) return [];
		return gameStore.getCandidates($cursor.y, $cursor.x);
	}

	function handleHint() {
		if (isSolved || isExploring) return;

		const move = gameStore.getNextMove();

		if (move) {
			const row = move.row + 1;
			const col = move.col + 1;
			const value = move.value;

			if (hintsRemaining > 0 || hintsRemaining === Infinity) {
				if (confirm(`建议在第 ${row} 行，第 ${col} 列填入 ${value}。是否应用此提示？`)) {
					gameStore.guess(move.row, move.col, move.value);
					gameStore.useHint();
				}
			} else {
				alert(`建议在第 ${row} 行，第 ${col} 列填入 ${value}`);
			}
		} else {
			const candidates = getCellCandidates();
			if (candidates.length > 0) {
				alert(`格子 (${$cursor.y + 1}, ${$cursor.x + 1}) 的候选数: ${candidates.join(', ')}`);
			} else if (currentCell !== 0 && currentCell !== null) {
				alert('该格子已有数字，无法显示候选数');
			} else {
				let minCandidates = null;
				let minCell = null;
				for (let r = 0; r < 9; r++) {
					for (let c = 0; c < 9; c++) {
						if (grid[r][c] !== 0 && grid[r][c] !== null) continue;
						const cands = gameStore.getCandidates(r, c);
						if (cands.length > 0 && (!minCandidates || cands.length < minCandidates)) {
							minCandidates = cands.length;
							minCell = { row: r, col: c, candidates: cands };
						}
					}
				}
				if (minCell) {
					alert(`建议在第 ${minCell.row + 1} 行，第 ${minCell.col + 1} 列尝试: ${minCell.candidates.join(', ')}`);
				} else {
					alert('当前无法推断下一步，请尝试探索模式');
				}
			}
		}
	}

	function handleCandidates() {
		if (isSolved) return;

		const candidates = getCellCandidates();
		if (candidates.length > 0) {
			alert(`格子 (${$cursor.y + 1}, ${$cursor.x + 1}) 的候选数: ${candidates.join(', ')}`);
		} else if (currentCell !== 0 && currentCell !== null) {
			alert('该格子已有数字，无法显示候选数');
		} else {
			alert('该格子无候选数');
		}
	}
</script>

<div class="action-buttons space-x-3">

	<button class="btn btn-round" disabled={!canUndo || isExploring} title="Undo" on:click={() => onAction('undo')}>
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
		</svg>
	</button>

	<button class="btn btn-round" disabled={!canRedo || isExploring} title="Redo" on:click={() => onAction('redo')}>
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
		</svg>
	</button>

	{#if !isExploring}
		<button class="btn btn-round btn-badge" disabled={hintsRemaining <= 0} on:click={handleHint} title="Hint">
			<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
			</svg>
			{#if hintsRemaining !== Infinity}
				<span class="badge">{hintsRemaining}</span>
			{/if}
		</button>

		<button class="btn btn-round" on:click={handleCandidates} title="Show candidates">
			<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
		</button>

		<button class="btn btn-round btn-explore" disabled={isSolved} on:click={() => onAction('exploreStart')} title="探索模式">
			<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
		</button>
	{/if}

	<button class="btn btn-round btn-badge" on:click={() => notes.toggle()} title="Notes ({$notes ? 'ON' : 'OFF'})">
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
		</svg>

		<span class="badge tracking-tighter" class:badge-primary={$notes}>{$notes ? 'ON' : 'OFF'}</span>
	</button>

</div>


<style>
	.action-buttons {
		@apply flex flex-wrap justify-evenly self-end;
	}

	.btn-badge {
		@apply relative;
	}

	.badge {
		min-height: 20px;
		min-width:  20px;
		@apply p-1 rounded-full leading-none text-center text-xs text-white bg-gray-600 inline-block absolute top-0 left-0;
	}

	.badge-primary {
		@apply bg-primary;
	}

	.btn-explore {
		@apply text-blue-500;
	}

	.btn-explore:hover:not(:disabled) {
		@apply bg-blue-100;
	}

	.btn-explore:disabled {
		@apply opacity-50 cursor-not-allowed;
	}
</style>
