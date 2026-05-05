<script>
	import { game } from '../../App.svelte'
	import { selected } from '../../stores/selected.js'

	function handleKeyButton(num) {
		if ($selected.row === null) return

		game.guess({
			row: $selected.row,
			col: $selected.col,
			value: num === 0 ? 0 : num
		})
	}

	function handleKey(e) {
		if (e.key >= '1' && e.key <= '9') {
			handleKeyButton(Number(e.key))
		}

		if (e.key === 'Backspace' || e.key === 'Delete') {
			handleKeyButton(0)
		}
	}
</script>

<svelte:window on:keydown={handleKey} />

<div class="keyboard-grid">
	{#each Array(10) as _, keyNum}
		{#if keyNum === 9}
			<button class="btn btn-key" on:click={() => handleKeyButton(0)}>
				Clear
			</button>
		{:else}
			<button class="btn btn-key" on:click={() => handleKeyButton(keyNum + 1)}>
				{keyNum + 1}
			</button>
		{/if}
	{/each}
</div>

<style>
	.keyboard-grid {
		@apply grid grid-rows-2 grid-cols-5 gap-3;
	}
	.btn-key {
		@apply py-4 px-0;
	}
</style>
