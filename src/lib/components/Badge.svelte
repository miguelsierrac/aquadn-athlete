<script>
	export let badge;
	export let progress = null; // 'bronce', 'plata', 'oro'

	const gradeStyles = {
		bronce: 'badge-bronze',
		plata: 'badge-plata',
		oro: 'badge-oro'
	};

	$: gradeClass = progress ? gradeStyles[progress] : 'badge-locked';
</script>

<div class="badge {gradeClass}">
	<div class="badge-icon">{badge.icono}</div>
	<div class="badge-info">
		<div class="badge-name">{badge.nombre}</div>
		<div class="badge-description">{badge.descripcion}</div>
	</div>
	{#if progress}
		<div class="badge-grade">{progress}</div>
	{/if}
</div>

<style>
	.badge {
		display: flex;
		align-items: center;
		padding: 10px;
		border-radius: 12px;
		margin-bottom: 8px;
		background-color: #f9f9f9;
		border: 1px solid #eee;
		transition: all 0.3s ease;
	}
	.badge-icon {
		font-size: 24px;
		margin-right: 12px;
	}
	.badge-info {
		flex-grow: 1;
	}
	.badge-name {
		font-weight: 600;
		font-size: 13px;
		color: #333;
	}
	.badge-description {
		font-size: 11px;
		color: #777;
	}
	.badge-grade {
		font-size: 10px;
		font-weight: 700;
		padding: 3px 8px;
		border-radius: 8px;
		text-transform: uppercase;
	}

	/* Grade-specific styles */
	.badge-locked {
		opacity: 0.6;
		background-color: #f5f5f5;
	}
	.badge-bronze {
		border-left: 5px solid #cd7f32;
		background-image: linear-gradient(to right, #f9f2eb, #f9f9f9);
	}
	.badge-bronze .badge-grade {
		background-color: #cd7f32;
		color: white;
	}
	.badge-plata {
		border-left: 5px solid #c0c0c0;
		background-image: linear-gradient(to right, #f7f7f7, #fcfcfc);
	}
	.badge-plata .badge-grade {
		background-color: #c0c0c0;
		color: white;
	}
	.badge-oro {
		border-left: 5px solid #ffd700;
		background-image: linear-gradient(to right, #fff8e1, #ffffff);
		box-shadow: 0 2px 10px rgba(255, 215, 0, 0.3);
	}
	.badge-oro .badge-grade {
		background-color: #ffd700;
		color: #333;
	}
</style>
