<script>
	import { game } from '../../../App.svelte'
	import { selected } from '../../../stores/selected.js'

	function handleHint() {
		if ($selected.row === null) return

		const c = game.getCandidates($selected.row, $selected.col)
		alert('Candidates: ' + c.join(', '))
	}
</script>

<div class="action-buttons space-x-3">

	<button class="btn btn-round" on:click={() => game.undo()}>
		Undo
	</button>

	<button class="btn btn-round" on:click={() => game.redo()}>
		Redo
	</button>

	<button class="btn btn-round" on:click={handleHint}>
		Hint
	</button>

	<button class="btn btn-round" on:click={() => game.startExplore()}>
		Explore
	</button>

	<button class="btn btn-round" on:click={() => game.commitExplore()}>
		Commit
	</button>

	<button class="btn btn-round" on:click={() => game.rollbackExplore()}>
		Rollback
	</button>

</div>

<style>
	.action-buttons {
		@apply flex flex-wrap justify-evenly self-end;
	}
</style>
