<script>
	import Buttons from './Buttons.svelte';
	import Dropdown from './Dropdown.svelte';
	import { getGameContext } from '../../domain/context.js';

	export let isExploring = false;
	export let onAction = () => {};

	const gameStore = getGameContext();

	// 从 gameState 获取状态
	$: gs = $gameStore;
	$: lastCommitResult = gs?.lastCommitResult ?? null;

	// 监听提交结果并显示反馈
	$: if (lastCommitResult !== null) {
		if (lastCommitResult.success) {
			// 提交成功
		} else if (lastCommitResult.hasConflicts) {
			alert('提交失败：盘面存在冲突，请先解决冲突或取消探索');
		} else {
			alert('提交失败');
		}
	}

	function toggleExplore() {
		if (isExploring) {
			onAction('exploreCommit');
		} else {
			onAction('exploreStart');
		}
	}

	function cancelExplore() {
		if (isExploring) {
			onAction('exploreRollback');
		}
	}
</script>

<div class="px-4 py-4 flex justify-center text-white">
	<div class="w-full max-w-xl">

		<nav class="flex flex-wrap items-center justify-between">
			<Dropdown />

			<div class="flex items-center space-x-2">
				{#if isExploring}
					<button class="btn btn-header text-green-400" on:click={toggleExplore} title="提交探索结果">
						✓ 提交
					</button>
					<button class="btn btn-header text-red-400" on:click={cancelExplore} title="取消探索">
						✕ 取消
					</button>
				{:else}
					<Buttons />
				{/if}
			</div>
		</nav>

		{#if isExploring}
			<div class="mt-2 text-sm text-yellow-300 text-center">
				探索模式 - 选择候选值尝试，完成后点击"提交"或"取消"
			</div>
		{/if}

	</div>
</div>
