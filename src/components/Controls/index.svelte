<script>
	import ActionBar from './ActionBar/index.svelte';
	import Keyboard from './Keyboard.svelte';

	export let isExploring = false;
	export let hintsRemaining = Infinity;
	export let onAction = () => {};
</script>

<div class="px-4 pb-5 flex justify-center">
	<div class="w-full max-w-xl">
		<ActionBar {hintsRemaining} {isExploring} {onAction} />

		<Keyboard {onAction} />
	</div>
</div>
