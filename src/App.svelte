<script>
	import { onMount } from 'svelte';
	import { createGameStore } from './domain/gameStore.js';
	import { setGameContext } from './domain/context.js';
	import { modal } from './domain/stores/modal.js';
	import { cursor } from './domain/stores/cursor.js';
	import { validateSencode } from './domain/index.js';

	import Board from './components/Board/index.svelte';
	import Controls from './components/Controls/index.svelte';
	import Header from './components/Header/index.svelte';
	import Modal from './components/Modal/index.svelte';

	// ── 初始化空白盘面 ───────────────────────────
	const emptyGrid = Array(9).fill(null).map(() => Array(9).fill(0));
	const gameStore = createGameStore(emptyGrid);

	// 将 gameStore 放入 context
	setGameContext(gameStore);

	// ── 响应式绑定 ──────────────────────────────
	$: gs = $gameStore;
	$: displayGrid  = gs?.grid ?? emptyGrid;
	$: locked       = gs?.given ?? [];
	$: conflicts    = gs?.conflicts ?? [];
	$: solved       = gs?.solved ?? false;
	$: canUndo      = gs?.canUndo ?? false;
	$: canRedo      = gs?.canRedo ?? false;
	$: isExploring  = gs?.isExploring ?? false;
	$: isPaused     = gs?.isPaused ?? false;
	$: hintsRemaining = gs?.hintsRemaining ?? Infinity;

	// ── Victory 检测 ─────────────────────────────
	let hasShownVictory = false;
	$: if (!solved) hasShownVictory = false;
	$: if (solved && !hasShownVictory) {
		hasShownVictory = true;
		modal.show('gameover');
	}

	// ── 用户操作统一入口 ─────────────────────────
	function handleUserAction(actionType, payload) {
		switch (actionType) {
			case 'guess':
				gameStore.guess(payload.row, payload.col, payload.value);
				break;
			case 'undo':
				gameStore.undo();
				break;
			case 'redo':
				gameStore.redo();
				break;
			case 'select':
				cursor.set(payload.x, payload.y);
				break;
			case 'exploreStart':
				gameStore.exploreStart();
				break;
			case 'exploreCommit':
				gameStore.exploreCommit();
				break;
			case 'exploreRollback':
				gameStore.exploreRollback();
				break;
		}
	}

	onMount(() => {
		let hash = location.hash.slice(1);
		const sencode = validateSencode(hash) ? hash : null;
		modal.show('welcome', { onHide: () => {}, sencode });
	});
</script>

<header>
	<Header {isExploring} onAction={handleUserAction} />
</header>

<section>
	<Board
		grid={displayGrid}
		{locked}
		{conflicts}
		{isPaused}
		{isExploring}
		{gameStore}
		onAction={handleUserAction}
	/>
</section>

<footer>
	<Controls
		{isExploring}
		{hintsRemaining}
		onAction={handleUserAction}
	/>
</footer>

<Modal />

<style global>
	@import "./styles/global.css";
</style>
