<script>
	import { AppBar } from '@skeletonlabs/skeleton';
</script>

<AppBar>
	<svelte:fragment slot="lead"><i class="fa-solid fa-house text-2xl" /></svelte:fragment>
	(title)
	<svelte:fragment slot="trail">(actions)</svelte:fragment>
</AppBar>

<slot />
