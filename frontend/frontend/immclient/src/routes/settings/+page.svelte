<script>
	import { invoke } from '@tauri-apps/api/tauri';
	import { localDataDir } from '@tauri-apps/api/path';

	import { onMount } from 'svelte';

	import { imm_config } from '$lib/configuration.js';
	import { saveConfiguration } from '$lib/configuration.js';

	import RcicList from '$lib/components/RcicList.svelte';

	let rcic_accounts = [];
	onMount(() => {
		console.log('Settings page mounted');
		rcic_accounts = $imm_config['rcic_accounts'] ? $imm_config['rcic_accounts'] : [];
	});

	async function saveConfig() {
		console.log('Saving configuration...');
		$imm_config['rcic_accounts'] = rcic_accounts;
		saveConfiguration();
	}

	let result = '';

	async function install_chromium() {
		const appDataLocalPath = await localDataDir();
		result = await invoke('install_chromium', { targetPath: appDataLocalPath });
	}
</script>

<h2 class="p-5">Settings</h2>

<section class="space-y-4 p-5">
	<fieldset class="border border-solid border-gray-300 p-3 rounded-md">
		<legend class="text-sm">Server Information</legend>
		<div class="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
			<div class="grid-cols-1">
				<span>Server URL</span>
				<input bind:value={$imm_config['server_url']} type="text" class="input" />
			</div>
			<div class="grid-cols-2" />
			<div class="grid-cols-1">
				<span>User Name</span>
				<input bind:value={$imm_config['imm_account']} type="text" class="input" />
			</div>
			<div class="grid-cols-2">
				<span>Password</span>
				<input bind:value={$imm_config['imm_password']} type="password" class="input" />
			</div>
		</div>
	</fieldset>
	<!--  -->
	<fieldset class="border border-solid border-gray-300 p-3 rounded-md">
		<legend class="text-sm">RCIC Accounts</legend>
		<div class="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
			<div class="grid-cols-1">
				<span>RCIC name</span>
				<input bind:value={$imm_config['rcic_name']} type="text" class="input" />
			</div>
			<div class="grid-cols-2">
				<span>RCIC Company</span>
				<input bind:value={$imm_config['rcic_company']} type="text" class="input" />
			</div>
		</div>
		<div>
			<!-- <RcicList rcic_list={rcic_accounts} /> -->
			<RcicList bind:rcic_list={rcic_accounts} />
		</div>
	</fieldset>
	<!--  -->
	<fieldset class="border border-solid border-gray-300 p-3 rounded-md">
		<legend class="text-sm">Web filler configurations</legend>
		<div class="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
			<div class="grid-cols-1">
				<span>Slow motion</span>
				<input type="number" class="input" />
			</div>
			<div class="grid-cols-2">
				<span>Default timeout</span>
				<input type="number" class="input" />
			</div>
		</div>
	</fieldset>
	<button type="button" class="btn variant-filled w-40" on:click={saveConfig}>Save</button>
	<!--  -->
	<fieldset class="border border-solid border-gray-300 p-3 rounded-md">
		<legend class="text-sm">Optional: install chromium</legend>
		<div>
			<span>If you haven't installed node.js and playwright, press </span>
			<button type="button" class="btn variant-filled" on:click={install_chromium}>
				Install Chromium
			</button>
			<span>to install.</span>
			{#if result}
				<p class="">{result}</p>
			{/if}
		</div>
	</fieldset>
</section>
