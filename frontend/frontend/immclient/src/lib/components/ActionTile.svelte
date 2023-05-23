<script>
    export let action_name = "";
    export let fa_icon = "";
</script>
<div class="tile-card bg-primary-50 text-surface-500">
    <div class="tile-content">
        <i class="fa-solid {fa_icon} text-5xl" />
    </div>
    <p class="tile-footer">{action_name}</p>
</div>

<style>
    .tile-card {
        display: flex;
        flex-direction: column;
        border-radius: 0.5rem;
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        width: 120px;
        height: 120px;
        grid-column-start: var(--start-position);
    }
    .tile-content {
        flex-grow: 5;
        padding-top: 20px;
        text-align: center;
    }
    .tile-footer {
        flex-grow: 1;
        text-align: center;
    }
</style>