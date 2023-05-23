<script>
	export let RCIC = {
		name: '',
		prportal: {
			account: '',
			password: ''
		},
		lmiaportal: {
			account: '',
			password: '',
			security_answers: []
		}
	};

	export let saveItem;

	function addQA() {
		RCIC.lmiaportal.security_answers.push({ q: '', a: '' });
		RCIC.lmiaportal.security_answers = RCIC.lmiaportal.security_answers;
	}

	function deleteQA(index) {
		RCIC.lmiaportal.security_answers.splice(index, 1);
		RCIC.lmiaportal.security_answers = RCIC.lmiaportal.security_answers;
	}
</script>

<div class="rcic-edit">
	<span>Name:</span>
	<input bind:value={RCIC.name} />
	<p>PR portal:</p>
	<span>Account: </span>
	<input bind:value={RCIC.prportal.account} />
	<span>Password: </span>
	<input type="password" bind:value={RCIC.prportal.password} />
	<p>LMIA portal:</p>
	<span>Account: </span>
	<input bind:value={RCIC.lmiaportal.account} />
	<span>Password: </span>
	<input type="password" bind:value={RCIC.lmiaportal.password} />
	<p>Security answers:</p>

	{#each RCIC.lmiaportal.security_answers as qa, i}
		<p>
			<sapan>Question:</sapan><input bind:value={qa['q']} />
			<span>Answer:</span><input bind:value={qa['a']} />
			<button on:click={() => deleteQA(i)}>Delete</button>
		</p>
	{/each}
	<button on:click={addQA}>Add Security Answer</button>
	<p>
		<button on:click={saveItem}>Save</button>
	</p>
</div>

<style>
	.rcic-edit {
		border: 1px solid white;
		border-radius: 10px;
		padding: 10px;
	}
	input {
		margin: 8px;
		padding: 0 8px;
		color: darkblue;
	}
	button {
		border: 1px solid white;
		border-radius: 5px;
		padding: 4px;
		margin: 4px;
	}
</style>
