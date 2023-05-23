<script>
	import ActionTile from '$lib/components/ActionTile.svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		console.log('Cases page mounted');
	});
</script>

<div class="tiles_container">
	{#each Array(5) as _, i}
		<ActionTile fa_icon="fa-plus"/>
	{/each}
	{#each Array(5) as _, i}
		{#if i == 0}
			<ActionTile --start-position=1/>
		{:else}
			<ActionTile action_name="bookmark" fa_icon="fa-folder"/>
		{/if}
	{/each}

</div>

<style>
	.tiles_container {
		display: grid;
		grid-template-columns: repeat(auto-fill, 120px);
		grid-column-gap: 1em;
		grid-row-gap: 3em;
		margin: 1em;
		padding: 1em;
	}
</style>