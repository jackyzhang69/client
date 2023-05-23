import { writable, get } from 'svelte/store';
import { appConfigDir } from '@tauri-apps/api/path';
import { exists, readTextFile, writeFile, createDir, BaseDirectory } from '@tauri-apps/api/fs';

export const imm_config = writable({});

export async function loadConfiguration() {
	const configExists = await exists('config.json', { dir: BaseDirectory.AppConfig });
	if (configExists) {
		console.log('Load from config.json');
		const configContent = await readTextFile('config.json', { dir: BaseDirectory.AppConfig });
		// console.log(configContent);
		const jsonConfig = await JSON.parse(configContent);
		imm_config.set(jsonConfig);
	}
}

export async function saveConfiguration() {
	const configExists = await exists('config.json', { dir: BaseDirectory.AppConfig });
	if (!configExists) {
		await createDir(await appConfigDir(), { recursive: true });
	}
	const jsonData = get(imm_config);
	await writeFile('config.json', JSON.stringify(jsonData, null, 2), {
		dir: BaseDirectory.AppConfig
	});
	console.log(jsonData);
}
