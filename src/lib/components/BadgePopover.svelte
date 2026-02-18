<script>
	export let badge;
	export let progress = null; // 'bronce', 'plata', 'oro', null

	let nextGrade = null;
	let nextCriterion = '';

	$: {
		if (progress === null) {
			nextGrade = 'bronce';
			nextCriterion = badge.grados.bronce.criterio;
		} else if (progress === 'bronce') {
			nextGrade = 'plata';
			nextCriterion = badge.grados.plata.criterio;
		} else if (progress === 'plata') {
			nextGrade = 'oro';
			nextCriterion = badge.grados.oro.criterio;
		} else {
			nextGrade = null;
			nextCriterion = '¡Has alcanzado el máximo nivel!';
		}
	}
</script>

<div class="popover-content">
	<div class="badge-header">
		<div class="badge-title">
			<span class="badge-icon-large">{badge.icono}</span>
			<div class="badge-info">
				<h3>{badge.nombre}</h3>
				{#if badge.descripcion}
					<p class="badge-description">{badge.descripcion}</p>
				{/if}
			</div>
		</div>
	</div>

	{#if nextGrade}
		<div class="next-grade-title">
			Próximo Nivel: <span class="grade-label grade-{nextGrade}">{nextGrade}</span>
		</div>
		<p class="next-grade-criterion">
			<strong>Para lograrlo:</strong>
			{nextCriterion}
		</p>
	{:else}
		<div class="max-level-title">¡Felicidades!</div>
		<p class="max-level-criterion">{nextCriterion}</p>
	{/if}

	<div class="current-grades">
		<div
			class="grade-status"
			class:achieved={progress === 'bronce' || progress === 'plata' || progress === 'oro'}
		>
			🥉 Bronce: {badge.grados.bronce.criterio}
		</div>
		<div class="grade-status" class:achieved={progress === 'plata' || progress === 'oro'}>
			🥈 Plata: {badge.grados.plata.criterio}
		</div>
		<div class="grade-status" class:achieved={progress === 'oro'}>
			🥇 Oro: {badge.grados.oro.criterio}
		</div>
	</div>
</div>

<style>
	.popover-content {
		padding: 16px;
		background: white;
		border-radius: 12px;
		box-shadow: 0 5px 25px rgba(0, 0, 0, 0.15);
		font-size: 14px;
		color: #333;
		max-width: 300px;
		text-align: left;
	}

	.badge-header {
		border-bottom: 2px solid #f0f0f0;
		padding-bottom: 12px;
		margin-bottom: 12px;
	}

	.badge-title {
		display: flex;
		align-items: flex-start;
		gap: 12px;
	}

	.badge-icon-large {
		font-size: 32px;
		line-height: 1;
		flex-shrink: 0;
	}

	.badge-info {
		flex: 1;
	}

	.badge-title h3 {
		margin: 0 0 4px 0;
		font-size: 16px;
		font-weight: 800;
		color: #2c3e50;
		line-height: 1.3;
	}

	.badge-description {
		margin: 0;
		font-size: 12px;
		color: #7f8c8d;
		line-height: 1.4;
	}

	.next-grade-title {
		font-weight: 700;
		margin-bottom: 8px;
		font-size: 15px;
	}
	.grade-label {
		text-transform: uppercase;
		padding: 2px 6px;
		border-radius: 6px;
		font-size: 12px;
		color: white;
	}
	.grade-bronce {
		background-color: #cd7f32;
	}
	.grade-plata {
		background-color: #c0c0c0;
	}
	.grade-oro {
		background-color: #ffd700;
		color: #333;
	}

	.next-grade-criterion {
		font-size: 13px;
		margin-bottom: 16px;
		color: #555;
	}
	.max-level-title {
		font-weight: 700;
		font-size: 16px;
		color: #34a853;
		text-align: center;
	}
	.max-level-criterion {
		font-size: 13px;
		text-align: center;
		color: #555;
		margin-bottom: 16px;
	}
	.current-grades {
		border-top: 1px solid #eee;
		padding-top: 12px;
	}
	.grade-status {
		font-size: 12px;
		color: #888;
		margin-bottom: 6px;
		transition: all 0.3s ease;
		opacity: 0.5;
	}
	.grade-status.achieved {
		color: #333;
		font-weight: 500;
		opacity: 1;
	}
</style>
