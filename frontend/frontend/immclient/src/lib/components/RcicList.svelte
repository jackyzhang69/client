<script>
	import RcicItem from './RcicItem.svelte';
	import RcicEdit from './RcicEdit.svelte';

	export let rcic_list = [];
	let editIndex = -1;

	function editItem(index) {
		editIndex = index;
	}

	function saveItem() {
		editIndex = -1;
		rcic_list = rcic_list;
	}

	function deleteItem(index) {
		rcic_list.splice(index, 1);
		rcic_list = rcic_list;
	}

	function addRCIC() {
		rcic_list.push({
			name: '',
			prportal: { account: '', password: '' },
			lmiaportal: { account: '', password: '', security_answers: [] }
		});
		rcic_list = rcic_list;
		editIndex = rcic_list.length - 1;
	}
</script>

{#each rcic_list as rcic, i}
	<div class="rcic-list-item">
		<RcicItem RCIC={rcic} />
		<button on:click={() => editItem(i)}>Edit</button>
		<button on:click={() => deleteItem(i)}>Delete</button>
		{#if i === editIndex}
			<RcicEdit RCIC={rcic} {saveItem} />
		{/if}
	</div>
{/each}
<button type="button" on:click={addRCIC}>Add</button>

<style>
	.rcic-list-item {
		display: grid;
		grid-template-columns: 1fr 60px 60px;
		margin: 0 5px;
	}
	button {
		border: 1px solid white;
		padding: 4px;
		margin: 4px;
	}
</style>
