<script>
	import { onMount } from 'svelte';
	import { validateSencode } from '@sudoku/sencode';
	import { modal } from '@sudoku/stores/modal';

	import Board from './components/Board/index.svelte';
	import Controls from './components/Controls/index.svelte';
	import Header from './components/Header/index.svelte';
	import Modal from './components/Modal/index.svelte';

	// ✅ 用你自己的 store（核心！！）
	import { createGameStore } from './stores/gameStore.js';

	// ✅ 初始化一个空盘面（你也可以换成题目）
	function createEmptyGrid() {
		return Array(9)
			.fill(0)
			.map(() => Array(9).fill(0));
	}

	// ✅ 全局 game（供子组件使用）
	export const game = createGameStore(createEmptyGrid());

	// ❌ 删除旧的 gameWon / game.pause / game.resume

	onMount(() => {
		let hash = location.hash;

		if (hash.startsWith('#')) {
			hash = hash.slice(1);
		}

		let sencode;
		if (validateSencode(hash)) {
			sencode = hash;
		}

		// ✅ 不再依赖旧 game.resume
		modal.show('welcome', { onHide: () => {}, sencode });
	});
</script>

<!-- Header -->
<header>
	<Header />
</header>

<!-- Sudoku Board -->
<section>
	<!-- ✅ Board 会从 App 导入 game -->
	<Board />
</section>

<!-- Controls -->
<footer>
	<!-- ✅ Controls 也会用你的 game -->
	<Controls />
</footer>

<Modal />

<style global>
	@import "./styles/global.css";
</style>
