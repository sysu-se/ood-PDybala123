<script>
	import { getGameContext } from '../../../domain/context.js';
	import { settings } from '../../../domain/stores/settings.js';

	const gameStore = getGameContext();

	$: gs = $gameStore;
	$: isPaused = gs?.isPaused ?? false;
	$: elapsed = gs?.elapsed ?? 0;

	function togglePause() {
		if (isPaused) {
			gameStore.resume();
		} else {
			gameStore.pause();
		}
	}

	// 格式化时间
	$: formattedTime = (() => {
		const mins = Math.floor(elapsed / 60);
		const secs = elapsed % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	})();
</script>

<div class="timer-container">
	<button class="btn btn-round" on:click={togglePause} title="{isPaused ? 'Resume Game' : 'Pause Game'}">
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			{#if isPaused}
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.19 9.61L9.01 3.48A2.87 2.87 0 004.54 5.88v12.25a2.87 2.87 0 004.47 2.39l9.18-6.12a2.87 2.87 0 000-4.78v0z" />
			{:else}
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 3v18M18 3v18" />
			{/if}
		</svg>
	</button>

	{#if $settings.displayTimer}
		<span class="timer-text" title="Time">{formattedTime}</span>
	{/if}
</div>

<style>
	.timer-container {
		@apply flex items-center bg-gray-300 rounded-full self-start;
	}

	.timer-text {
		@apply px-4 text-2xl;
	}
</style>
