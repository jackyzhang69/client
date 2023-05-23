<script lang="ts">
	// The ordering of these imports is critical to your app working properly
	import '@skeletonlabs/skeleton/themes/theme-skeleton.css';
	// If you have source.organizeImports set to true in VSCode, then it will auto change this ordering
	import '@skeletonlabs/skeleton/styles/all.css';
	// Most of your app wide CSS should be put in this file
	import '../app.postcss';

	import { AppShell } from '@skeletonlabs/skeleton';

	import { onMount } from 'svelte';
	import { loadConfiguration } from '$lib/configuration';

	onMount(() => {
		loadConfiguration();
	});
</script>

<AppShell slotSidebarLeft="bg-surface-500/5 w-56 p-4">
	<svelte:fragment slot="sidebarLeft">
		<nav class="list-nav">
			<ul>
				<li><a href="/cases">Cases</a></li>
				<li><a href="/filler">Form Filler</a></li>
				<li><a href="/settings">Settings</a></li>
			</ul>
		</nav>
	</svelte:fragment>
	<slot />
</AppShell>
