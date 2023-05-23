<!-- Paperwork Selector -->
<script>
	import { open } from '@tauri-apps/api/dialog';
	let programs = ['bcpnp', 'lmia', 'pr', 'pr_renew'];
	export let task;
	export let selected;
	export let filePath = '';
	export let uploadFolderPath = '';

	async function selectFile(dir = false) {
		let path = await open({ directory: dir });
		if (dir) {
			uploadFolderPath = path;
		} else {
			filePath = path;
		}
		console.log(filePath);
	}
</script>

<div class="container my-10">
	<label class="label">
		<span>Application Program</span>
		<select class="select" bind:value={selected}>
			{#each programs as program}
				<option value={program}>
					{program}
				</option>
			{/each}
		</select>
		{#if selected === 'bcpnp'}
			<span>Task</span>
			<select class="select" bind:value={task}>
				<option value="pro">Profile</option>
				<option value="reg">Registration</option>
				<option value="app">Application</option>
				<option value="rep">Representative</option>
			</select>
		{/if}
	</label>
	<input
		type="text"
		placeholder="Application File"
		class="input w-4/5 my-5"
		bind:value={filePath}
	/>
	<button type="button" class="btn variant-filled mx-5" on:click={() => selectFile(false)}
		>Select...</button
	>
	<input
		type="text"
		placeholder="Upload Folder"
		class="input w-4/5"
		bind:value={uploadFolderPath}
	/>
	<button type="button" class="btn variant-filled mx-5" on:click={() => selectFile(true)}
		>Select...</button
	>
</div>
