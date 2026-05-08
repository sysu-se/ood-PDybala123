<script>
	import Timer from './Timer.svelte';
	import Actions from './Actions.svelte';

	export let onAction = () => {};
	export let hintsRemaining = Infinity;
	export let isExploring = false;
</script>

<div class="action-bar space-y-3 xs:space-y-0">
	<Timer />

	<Actions {onAction} {hintsRemaining} {isExploring} />
</div>

<style>
	.action-bar {
		@apply flex flex-col flex-wrap justify-between pb-5;
	}

	@screen xs {
		.action-bar {
			@apply flex-row;
		}
	}
</style>
