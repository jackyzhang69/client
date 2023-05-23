<script>
	import { Command } from '@tauri-apps/api/shell';

	import { imm_config } from '$lib/configuration';

	import ProgramSelector from '$lib/components/ProgramSelector.svelte';

	let program;
	let filePath;
	let uploadFolderPath;
	let task;

	let output_area;

	function convertColorToStyle(data) {
		const regex = /\x1b\[(\d+)m/g;
		const matches = data.match(regex);
		if (matches) {
			const color = matches[0].replace(regex, '$1');
			return `<span style="color: ${color}">${data}</span>`;
		}
		return data;
	}

	function buildCommand() {
		let command = [];

		let lmia_account = '';
		let lmia_password = '';
		let lmia_qas = '';
		let pr_account = '';
		let pr_password = '';

		const rcic_name = $imm_config['rcic_name'];
		const rcic_accounts = $imm_config['rcic_accounts'];
		console.log(rcic_name);
		console.log(rcic_accounts);

		for (const account of rcic_accounts) {
			console.log(account['name']);
			if (account['name'] === rcic_name) {
				lmia_account = account['lmiaportal']['account'];
				lmia_password = account['lmiaportal']['password'];
				const qas = {};
				for (const qa of account['lmiaportal']['security_answers']) {
					qas[qa['q']] = qa['a'];
				}
				// console.log(JSON.stringify(qas));
				lmia_qas = JSON.stringify(qas).replace(/"/g, "'");
				// console.log(lmia_qas);
			}
		}

		console.log(lmia_account, lmia_password, lmia_qas);

		switch (program) {
			case 'bcpnp':
				command.push('bcpnp');
				command.push(task);
				if (uploadFolderPath) {
					command.push('-uf');
					command.push(uploadFolderPath);
				}
				break;
			case 'lmia':
				command.push('lmia');
				if (uploadFolderPath) {
					command.push('-uf');
					command.push(uploadFolderPath);
				}
				command.push('-ra');
				command.push(lmia_account);
				command.push('-rp');
				command.push(lmia_password);
				command.push('-rs');
				command.push(lmia_qas);
				break;
			case 'pr':
				command.push('pr');
				break;
			case 'pr_renew':
				command.push('pr_renew');
				break;
			default:
				console.log('No program selected');
				return;
		}
		command.push(filePath);
		return command;
	}

	async function fillForm() {
		let cmd = buildCommand();
		console.log(cmd);
		const command = Command.sidecar('external-bin/filler', cmd);
		command.on('close', (data) => {
			console.log(data);
		});
		command.stdout.on('data', (data) => {
			console.log(data);
			const child = document.createElement('p');
			// convert data console color codes to style
			// https://stackoverflow.com/questions/4842424/list-of-ansi-color-escape-sequences
			//child.innerHTML = data.replace(/\x1b\[(\d+)m/g, '<span style="color: $1">');

			child.textContent = data.replace(/\x1b\[(\d+)m/g, '');
			//child.innerHTML = convertColorToStyle(data);
			output_area.appendChild(child);
		});
		command.stderr.on('data', (data) => {
			console.log(data);
			//output = output + data;
		});
		const result = await command.execute();
		console.log(result);
	}
</script>

<div class="container mx-auto my-10 flex justify-center items-center w-4/5">
	<ProgramSelector bind:selected={program} bind:filePath bind:uploadFolderPath bind:task />
</div>
<div class="container flex w-full justify-center items-center">
	<button type="button" class="btn variant-filled w-40" on:click={fillForm}>Fill</button>
</div>
<div class="container p-5" bind:this={output_area} />
