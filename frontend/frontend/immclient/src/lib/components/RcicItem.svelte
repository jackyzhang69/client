<script>
	export let RCIC = {
		name: '',
		prportal: {
			account: '',
			password: ''
		},
		lmiaportal: {
			account: '',
			passwor: '',
			security_ansers: []
		}
	};
</script>

<div class="rcic-info">
	<p>Name: {RCIC.name}</p>
	<p>pr portal: {RCIC.prportal.account}</p>
	<p>lmia portal: {RCIC.lmiaportal.account}</p>
</div>

<style>
	.rcic-info {
		display: inline-grid;
		grid-template-columns: 1fr 2fr 2fr;
	}
</style>
