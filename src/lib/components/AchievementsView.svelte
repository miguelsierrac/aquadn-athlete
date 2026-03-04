<script>
	export let userLevel = null;
	export let allLevels = [];
	export let badges = [];
	export let totalBadgePoints = 0;
	export let onShareAchievements = () => {};
	export let onBadgeClick = () => {};

	// Calculate previous and next levels
	$: previousLevel = userLevel?.nivel_anterior 
		? allLevels.find(l => l.id === userLevel.nivel_anterior) 
		: null;
	
	$: nextLevel = userLevel?.nivel_siguiente 
		? allLevels.find(l => l.id === userLevel.nivel_siguiente) 
		: null;

	// Calculate achievements summary
	$: completedObjectives = badges.filter(b => b.progress !== null).length;
	$: totalObjectives = badges.length;

	// Calculate progress percentage
	$: progressPercentage = totalObjectives > 0 ? (completedObjectives / totalObjectives) * 100 : 0;
</script>

<div class="achievements-container">
	<!-- 1. Level Progression Timeline -->
	<div class="progression-timeline">
		<div class="timeline-nodes">
			<!-- Previous Level -->
			<div class="timeline-node">
				<div class="node-circle previous-node" class:completed={previousLevel} style="{previousLevel ? `border-color: ${previousLevel.color || '#4285f4'};` : ''}">
					{#if previousLevel}
						<span class="node-emoji">{previousLevel.icono}</span>
						<span class="check-mark" style="background: {previousLevel.color || '#4285f4'}; box-shadow: 0 2px 6px {previousLevel.color ? previousLevel.color + '66' : 'rgba(66, 133, 244, 0.4)'};">✓</span>
					{:else}
						<span class="node-emoji">🌟</span>
					{/if}
				</div>
				<span class="node-label">{previousLevel ? (previousLevel.titulo || previousLevel.nombre) : 'Inicio'}</span>
			</div>

			<!-- Progress Line (Completed) -->
			<div class="progress-line-container">
				<div class="progress-line-bg"></div>
				<div class="progress-line-fill" style="width: 100%; background: {previousLevel?.color || '#4285f4'};"></div>
			</div>

			<!-- Current Level -->
			<div class="timeline-node current">
				<div class="node-circle current-node" style="border-color: {userLevel?.color || '#fbbf24'}; box-shadow: 0 4px 16px {userLevel?.color ? userLevel.color + '40' : 'rgba(251, 191, 36, 0.3)'};">
					<span class="node-emoji">{userLevel?.icono || '🔱'}</span>
				</div>
				<span class="node-label current-label">{userLevel?.titulo || userLevel?.nombre || 'Actual'}</span>
			</div>

			<!-- Progress Line (In Progress) -->
			<div class="progress-line-container">
				<div class="progress-line-bg"></div>
				<div class="progress-line-fill" style="width: {progressPercentage}%; background: {userLevel?.color || '#4285f4'};"></div>
			</div>

			<!-- Next Level -->
			<div class="timeline-node">
				<div class="node-circle next-node">
					{#if nextLevel}
						<span class="node-emoji locked">{nextLevel.icono}</span>
					{:else}
						<span class="node-emoji">🏆</span>
					{/if}
				</div>
				<span class="node-label">{nextLevel ? (nextLevel.titulo || nextLevel.nombre) : 'Maestría'}</span>
			</div>
		</div>

		<!-- Progress Summary -->
		<div class="progress-summary">
			<span class="progress-text">
				<strong style="color: {userLevel?.color || '#4285f4'};">{completedObjectives}/{totalObjectives}</strong> Objetivos
			</span>
			{#if userLevel?.descripcion}
				<span class="level-desc">{userLevel.descripcion}</span>
			{/if}
		</div>
	</div>

	<!-- 2. Badges Section -->
	<div class="badges-section">
		<div class="section-header">
			<div class="section-header-left">
				<h3 class="section-title">Mis Insignias</h3>
				{#if totalBadgePoints > 0}
					<span class="points-total">{totalBadgePoints} pts</span>
				{/if}
			</div>
			<button class="share-btn" on:click={onShareAchievements}>
				<span>📤</span>
			</button>
		</div>

		<div class="badge-grid">
			{#each badges as badge (badge.id)}
				<div
					class="badge-item"
					class:badge-unlocked={badge.progress}
					class:badge-locked={!badge.progress}
					on:click={(e) => onBadgeClick(e, badge)}
					on:keydown={(e) => e.key === 'Enter' && onBadgeClick(e, badge)}
					role="button"
					tabindex="0"
				>
					{#if !badge.progress}
						<div class="mystery-overlay">
							<span class="lock-icon">🔒</span>
						</div>
					{/if}
					<div class="badge-icon">{badge.icono || '🏆'}</div>
					<div class="badge-name">{badge.objetivo || badge.nombre || 'Objetivo'}</div>
					{#if badge.progress}
						<div class="badge-tier tier-{badge.progress}">
							{#if badge.progress === 'bronce'}
								🥉
							{:else if badge.progress === 'plata'}
								🥈
							{:else if badge.progress === 'oro'}
								🥇
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.achievements-container {
		padding: 12px 8px 16px 8px;
		max-width: 900px;
		margin: 0 auto;
		overflow-x: hidden;
		box-sizing: border-box;
	}

	/* 1. Level Progression Timeline */
	.progression-timeline {
		background: white;
		border-radius: 16px;
		padding: 16px 4px 12px 4px;
		margin-bottom: 16px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		border: 2px solid #e0e7ff;
		overflow-x: auto;
	}

	.timeline-nodes {
		display: flex;
		align-items: center;
		justify-content: space-between;
		position: relative;
		margin-bottom: 10px;
		min-width: min-content;
	}

	.timeline-node {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		flex-shrink: 0;
		z-index: 2;
	}

	.node-circle {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		background: white;
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
		transition: transform 0.2s ease;
	}

	.timeline-node.current .node-circle {
		width: 52px;
		height: 52px;
	}

	.previous-node {
		border: 3px solid #95a5a6;
		background: #ecf0f1;
	}

	.previous-node.completed {
		background: #e0e7ff;
	}

	.current-node {
		background: linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%);
	}

	.next-node {
		border: 3px solid #d1d5db;
		background: #f3f4f6;
	}

	.node-emoji {
		font-size: 20px;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
	}

	.timeline-node.current .node-emoji {
		font-size: 26px;
	}

	.node-emoji.locked {
		filter: grayscale(80%) brightness(0.9) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
		opacity: 0.6;
	}

	.check-mark {
		position: absolute;
		bottom: -3px;
		right: -3px;
		color: white;
		font-size: 10px;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 900;
	}

	.node-label {
		font-size: 9px;
		font-weight: 600;
		color: #7f8c8d;
		text-align: center;
		line-height: 1.2;
		max-width: 50px;
		word-wrap: break-word;
	}

	.current-label {
		font-size: 10px;
		font-weight: 700;
		color: #2c3e50;
		max-width: 60px;
		word-wrap: break-word;
	}

	.progress-line-container {
		flex: 1;
		position: relative;
		height: 6px;
		margin: 0 -4px;
		z-index: 1;
		min-width: 30px;
	}

	.progress-line-bg {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 6px;
		background: #e5e7eb;
		border-radius: 3px;
	}

	.progress-line-fill {
		position: absolute;
		top: 0;
		left: 0;
		height: 6px;
		border-radius: 3px;
		transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.progress-summary {
		text-align: center;
		padding-top: 8px;
		border-top: 1px solid #f3f4f6;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.progress-text {
		font-size: 12px;
		color: #2c3e50;
		margin: 0;
	}

	.progress-text strong {
		font-weight: 700;
	}

	.level-desc {
		font-size: 11px;
		color: #7f8c8d;
		line-height: 1.3;
	}

	/* 2. Badges Section */
	.badges-section {
		margin-bottom: 16px;
		width: 100%;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}

	.section-header-left {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.section-title {
		font-size: 15px;
		font-weight: 700;
		color: #2c3e50;
		margin: 0;
	}

	.points-total {
		font-size: 11px;
		color: #4285f4;
		background: #e0e7ff;
		padding: 3px 8px;
		border-radius: 10px;
		font-weight: 700;
	}

	.badge-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 5px;
		width: 100%;
	}

	.badge-item {
		background: white;
		border-radius: 14px;
		padding: 6px 3px;
		text-align: center;
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
		position: relative;
		border: 1.5px solid transparent;
		transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
		cursor: pointer;
		aspect-ratio: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		box-sizing: border-box;
		width: 100%;
	}

	.badge-item:hover {
		transform: translateY(-2px);
	}

	.badge-unlocked {
		border-color: #fbbf24;
		box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
	}

	.badge-unlocked:hover {
		box-shadow: 0 5px 14px rgba(251, 191, 36, 0.3);
	}

	.badge-locked {
		border-color: #e5e7eb;
		opacity: 0.7;
	}

	.mystery-overlay {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.7);
		border-radius: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2;
	}

	.lock-icon {
		font-size: 24px;
		filter: drop-shadow(0 2px 6px rgba(255, 255, 255, 0.3));
	}

	.badge-icon {
		font-size: 24px;
		margin-bottom: 4px;
		display: inline-block;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
	}

	.badge-name {
		font-size: 9px;
		font-weight: 600;
		color: #2c3e50;
		line-height: 1.2;
		max-height: 24px;
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.badge-tier {
		font-size: 12px;
		margin-top: 2px;
	}

	/* 3. Share Button */
	.share-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		padding: 0;
		background: #f8f9fa;
		color: #6c757d;
		border: 1px solid #dee2e6;
		border-radius: 50%;
		font-size: 16px;
		cursor: pointer;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.share-btn:hover {
		background: #e9ecef;
		color: #495057;
		border-color: #adb5bd;
		transform: scale(1.05);
	}

	.share-btn:active {
		transform: scale(0.95);
	}

	/* Responsive */
	@media (max-width: 640px) {
		.node-circle {
			width: 44px;
			height: 44px;
		}

		.timeline-node.current .node-circle {
			width: 54px;
			height: 54px;
		}

		.node-emoji {
			font-size: 22px;
		}

		.timeline-node.current .node-emoji {
			font-size: 28px;
		}

		.node-label {
			font-size: 9px;
			max-width: 55px;
		}

		.current-label {
			font-size: 10px;
			max-width: 65px;
		}

		.badge-grid {
			gap: 6px;
		}

		.badge-icon {
			font-size: 24px;
		}

		.badge-name {
			font-size: 9px;
		}
	}

	@media (min-width: 641px) {
		.badge-grid {
			grid-template-columns: repeat(4, 1fr);
			gap: 12px;
		}
	}
</style>
