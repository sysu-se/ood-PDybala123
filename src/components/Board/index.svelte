<script>
	import Cell from './Cell.svelte'
	import { game } from '../../../App.svelte'
	import { selected } from '../../stores/selected.js'

	function handleClick(x, y) {
		selected.set(y, x) // 注意 row=y, col=x
	}
</script>

<div class="board-padding relative z-10">
	<div class="max-w-xl relative">
		<div class="w-full" style="padding-top: 100%"></div>
	</div>

	<div class="board-padding absolute inset-0 flex justify-center">
		<div class="bg-white shadow-2xl rounded-xl overflow-hidden w-full h-full max-w-xl grid">

			{#each $game.grid as row, y}
				{#each row as value, x}
					<div on:click={() => handleClick(x, y)}>
						<Cell
							value={value}
							cellY={y + 1}
							cellX={x + 1}
							selected={$selected.row === y && $selected.col === x}
							userNumber={true}
						/>
					</div>
				{/each}
			{/each}

		</div>
	</div>
</div>

<style>
	.board-padding {
		@apply px-4 pb-4;
	}
</style>
