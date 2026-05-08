<script>
	import { onMount } from 'svelte';
	import { createGameStore } from './domain/gameStore.js';
	import { setGameContext } from './domain/context.js';
	import { modal } from './domain/stores/modal.js';
	import { cursor } from './domain/stores/cursor.js';
	import { validateSencode, decodeSencode } from './domain/index.js';

	import Board from './components/Board/index.svelte';
	import Controls from './components/Controls/index.svelte';
	import Header from './components/Header/index.svelte';
	import Modal from './components/Modal/index.svelte';

	// ── 初始化空白盘面 ────────────────────────────────────────────
	const emptyGrid = Array(9).fill(null).map(() => Array(9).fill(0));
	const gameStore = createGameStore(emptyGrid);

	// 将 gameStore 设置到 context，供子组件访问
	setGameContext(gameStore);

	// ── 从 gameState 获取响应式状态 ─────────────────────────────────────
	$: gs = $gameStore;

	$: displayGrid = gs?.grid ?? emptyGrid;
	$: locked      = gs?.locked ?? [];
	$: conflicts   = gs?.conflicts ?? [];
	$: solved      = gs?.solved ?? false;
	$: canUndo     = gs?.canUndo ?? false;
	$: canRedo     = gs?.canRedo ?? false;
	$: isExploring = gs?.isExploring ?? false;
	$: isPaused    = gs?.isPaused ?? false;
	$: hintsRemaining = gs?.hintsRemaining ?? Infinity;

	// ── Victory 检测 ──────────────────────────────────────────────
	let hasShownVictory = false;

	// 当 solved 变为 false 时重置标记（新游戏开始）
	$: if (solved === false) {
		hasShownVictory = false;
	}

	// 当 solved 变为 true 时显示胜利弹窗
	$: if (solved && !hasShownVictory) {
		hasShownVictory = true;
		modal.show('gameover');
	}

	// ── 统一动作入口 ──────────────────────────────────────────────
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
		let hash = location.hash;
		if (hash.startsWith('#')) hash = hash.slice(1);
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
