<script>
	import { onMount, getContext } from 'svelte';
	import BadgePopover from '$lib/components/BadgePopover.svelte';
	import {
		shareAchievement,
		generateAchievementText,
		generateAchievementImage
	} from '$lib/infrastructure/SocialShare';
	import { trackViewAchievements } from '$lib/infrastructure/AnalyticsService.js';

	export let allLevels = [];
	export let currentUserID;
	export let currentUserLevelId;
	export let badges = []; // User's badges/objectives
	export let userLevel = null; // Current level object
	export let specialty = null; // Optional specialty info
	export let totalDistance = null; // Total distance swam

	const provider = getContext('provider');
	let rankedUsers = [];
	let selectedLevelId = null;
	let activeTab = 'ranking'; // 'ranking' or 'badges'
	let selectedBadge = null;
	let popoverPosition = { top: 0, left: 0 };
	let leaderboardData = [];
	let isLoadingLeaderboard = false;

	onMount(() => {
		selectedLevelId = currentUserLevelId;
	});

	$: {
		if (selectedLevelId && provider) {
			isLoadingLeaderboard = true;
			provider.getGamificationData
				.getLeaderboardData(selectedLevelId)
				.then((newUsers) => {
					leaderboardData = newUsers;
				})
				.catch((err) => {
					console.error('Failed to load leaderboard for level ' + selectedLevelId, err);
					leaderboardData = []; // Clear data on error
				})
				.finally(() => {
					isLoadingLeaderboard = false;
				});
		}
	}

	$: {
		if (leaderboardData) {
			rankedUsers = leaderboardData.map((user, index) => ({
				...user,
				rank: index + 1
			}));
		} else {
			rankedUsers = [];
		}
	}

	$: currentLevel = allLevels.find((l) => l.id === selectedLevelId);

	$: totalBadgePoints = badges.reduce((sum, badge) => {
		if (!badge.progress) return sum;
		const grade = userLevel?.objetivos?.find((obj) => obj.id === badge.id)?.grados[badge.progress];
		return sum + (grade?.puntos || 0);
	}, 0);

	const medalIcons = ['🥇', '🥈', '🥉'];

	function getAvatarUrl(user) {
		if (user.foto_deportista) {
			return user.foto_deportista;
		}
		// Generate a consistent, gender-neutral avatar using the user's name as a seed
		const seed = encodeURIComponent(
			(user.nombre_deportista || '') + (user.apellido_deportista || 'default')
		);
		return `https://api.dicebear.com/7.x/thumbs/svg?seed=${seed}`;
	}

	function switchTab(tab) {
		if (tab === 'badges') {
			trackViewAchievements();
		}
		activeTab = tab;
		closePopover(); // Close any open badge popover when switching tabs
	}

	function handleBadgeClick(event, badge) {
		if (selectedBadge && selectedBadge.id === badge.id) {
			closePopover();
			return;
		}
		const rect = event.currentTarget.getBoundingClientRect();
		popoverPosition = {
			top: rect.top + rect.height / 2,
			left: rect.left + rect.width / 2
		};
		selectedBadge = badge;
	}

	function closePopover() {
		selectedBadge = null;
	}

	async function handleShareRanking() {
		const currentUser = rankedUsers.find((u) => u.id_deportista == currentUserID);
		const rank = currentUser?.rank || 0;
		const points = currentUser?.puntaje_total || 0;

		const shareText = generateAchievementText({
			levelName: currentLevel?.nombre,
			levelIcon: currentLevel?.icono,
			totalPoints: points,
			rank: rank
		});

		// Generate image with ranking
		const imageBlob = await generateAchievementImage({
			levelName: currentLevel?.nombre,
			levelIcon: currentLevel?.icono,
			levelColor: currentLevel?.color,
			totalPoints: points,
			rank: rank,
			totalDistance: totalDistance
		});

		await shareAchievement({
			title: '🏆 Mi Posición en el Ranking',
			text: shareText,
			image: imageBlob,
			source: 'Leaderboard'
		});
	}

	async function handleShareAchievements() {
		const completedBadges = badges
			.filter((b) => b.progress)
			.map((b) => ({ icon: b.icono, name: b.nombre, grade: b.progress }));

		const shareText = generateAchievementText({
			levelName: userLevel?.nombre,
			levelIcon: userLevel?.icono,
			badges: completedBadges.length > 0 ? completedBadges : null,
			totalPoints: totalBadgePoints
		});

		// Generate image with achievements
		const imageBlob = await generateAchievementImage({
			levelName: userLevel?.nombre,
			levelIcon: userLevel?.icono,
			levelColor: userLevel?.color,
			badges: completedBadges.length > 0 ? completedBadges : null,
			totalPoints: totalBadgePoints,
			totalDistance: totalDistance
		});

		await shareAchievement({
			title: '🎯 Mis Logros en AQUADN',
			text: shareText,
			image: imageBlob,
			source: 'Achievements'
		});
	}
</script>

<div class="leaderboard-container">
	<div class="modal-header">
		<h2>Tu Progreso</h2>
	</div>

	<div class="tabs-nav">
		<button
			class="tab-btn"
			class:active={activeTab === 'ranking'}
			on:click={() => switchTab('ranking')}
		>
			🏆 Ranking
		</button>
		<button
			class="tab-btn"
			class:active={activeTab === 'badges'}
			on:click={() => switchTab('badges')}
		>
			🎯 Mis Logros
		</button>
	</div>

	<div class="tab-content">
		{#if activeTab === 'ranking'}
			<div class="ranking-header">
				<h3>
					Ranking Nivel
					<span class="level-tag" style="background: {currentLevel?.color || '#4285F4'};"
						>{rankedUsers[0]?.icono_nivel || currentLevel?.icono || ''}
						{rankedUsers[0]?.nombre_nivel || currentLevel?.nombre || ''}</span
					>
					{#if userLevel && userLevel.id !== selectedLevelId}
						<span class="user-level-chip" style="background: {userLevel.color};"
							>{userLevel.icono} Tu nivel</span
						>
					{/if}
				</h3>
				<span class="total-players">{rankedUsers.length} Atletas compitiendo</span>
				
				<button
					on:click={handleShareRanking}
					class="share-btn mt-2"
					title="Compartir mi posición"
				>
					<span>📤</span>
					<span>Compartir Posición</span>
				</button>
			</div>

			<div class="level-filter">
				{#each allLevels as level (level.id)}
					<button
						class="level-tab"
						class:active={selectedLevelId === level.id}
						on:click={() => (selectedLevelId = level.id)}
						disabled={isLoadingLeaderboard}
					>
						{level.icono}
						{level.nombre}
					</button>
				{/each}
			</div>

			{#if isLoadingLeaderboard}
				<div class="loader-container">
					<div class="loader"></div>
					<p>Cargando ranking...</p>
				</div>
			{:else}
				<ul class="leaderboard-list">
					{#each rankedUsers as user, i (user.id_deportista || i)}
						<li class="rank-item" class:current-user={user.id_deportista == currentUserID}>
							<span class="rank-pos" class:top-3={user.rank <= 3}>
								{#if user.rank <= 3}
									{medalIcons[user.rank - 1]}
								{:else}
									{user.rank}
								{/if}
							</span>

							<img src={getAvatarUrl(user)} alt="Avatar" class="rank-avatar" />

							<div class="rank-info">
								<span class="rank-name">
									{user.nombre_deportista}
									{user.apellido_deportista}
									<small class="rank-level-icon">{user.icono_nivel}</small>
								</span>
							</div>

							<span class="rank-score">
								{new Intl.NumberFormat('es-ES').format(user.puntaje_total)}
							</span>
						</li>
					{/each}
				</ul>
			{/if}
		{:else}
			<!-- Tab de Mis Logros -->
			<div class="level-hero" style="--lvl-color: {userLevel?.color || '#4285F4'};">
				<div class="level-icon-large">
					<span>{userLevel?.icono || '🎯'}</span>
				</div>
				<h3 class="level-title" style="color: {userLevel?.color || '#4285F4'};">
					Nivel {userLevel?.nombre || 'Desconocido'}
				</h3>
				<p class="level-desc">{userLevel?.descripcion || ''}</p>

				{#if specialty}
					<div class="specialty-chips-hero">
						<div class="specialty-chip-hero tool-chip">
							{specialty.tool === 'Monoaleta' ? '🦶' : '🏊'}
							{specialty.tool}
						</div>
						<div class="specialty-chip-hero mode-chip">
							{specialty.mode === 'Velocidad' ? '⚡' : '🌊'}
							{specialty.mode}
						</div>
					</div>
				{/if}
			</div>

			<div class="badges-section">
				<h4>Mis Insignias <span class="points-total">{totalBadgePoints} Pts en Logros</span></h4>

				<button
					on:click={handleShareAchievements}
					class="share-btn mb-4"
					title="Compartir mis logros"
				>
					<span>📤</span>
					<span>Compartir Logros</span>
				</button>

				<div class="badge-grid-compact">
					{#if badges && badges.length > 0}
						{#each badges as badge (badge.id)}
							{@const gradeClass = badge.progress
								? `badge-item-${badge.progress}`
								: 'badge-item-locked'}
							<div
								class="badge-item-compact {gradeClass}"
								role="button"
								tabindex="0"
								on:click={(e) => handleBadgeClick(e, badge)}
								on:keydown={(e) => {
									if (e.key === 'Enter') handleBadgeClick(e, badge);
								}}
							>
								{#if badge.progress}
									<span class="badge-tier-label-compact">{badge.progress}</span>
								{/if}
								<span class="badge-icon-compact">{badge.icono}</span>
								<span class="badge-name-compact">{badge.nombre}</span>
							</div>
						{/each}
					{:else}
						<p class="no-badges">No hay insignias disponibles.</p>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>

{#if selectedBadge}
	<div
		class="popover-backdrop"
		on:click={closePopover}
		on:keydown={(e) => {
			if (e.key === 'Enter') closePopover();
		}}
		role="button"
		tabindex="0"
	></div>
	<div
		class="popover-container"
		style="top: {popoverPosition.top}px; left: {popoverPosition.left}px;"
	>
		<BadgePopover badge={selectedBadge} progress={selectedBadge.progress} />
	</div>
{/if}

<style>
	.loader-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 40px 20px;
		color: #7f8c8d;
	}
	.loader {
		border: 4px solid #f3f3f3;
		border-top: 4px solid #4285f4;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		animation: spin 1s linear infinite;
		margin-bottom: 15px;
	}
	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.leaderboard-container {
		background: white;
		border-radius: 0;
		width: 100%;
		height: 100%;
		margin: 0;
		overflow: hidden;
		box-shadow: none;
	}

	.modal-header {
		padding: 20px 20px 0;
		background: #fff;
		position: relative;
		z-index: 260;
	}

	.modal-header h2 {
		margin: 0;
		font-size: 20px;
		color: #2c3e50;
	}

	.tabs-nav {
		display: flex;
		padding: 15px 20px 0;
		background: #fff;
		border-bottom: 1px solid #eee;
		position: relative;
		z-index: 260;
	}

	.tab-btn {
		flex: 1;
		padding: 12px;
		border: none;
		background: none;
		font-weight: 600;
		color: #7f8c8d;
		border-bottom: 3px solid transparent;
		cursor: pointer;
		transition: 0.3s;
		font-size: 14px;
	}

	.tab-btn.active {
		color: #4285f4;
		border-bottom-color: #4285f4;
	}

	.tab-content {
		padding: 20px;
		background: #f8faff;
		height: calc(100vh - 160px);
		overflow-y: auto;
	}

	.ranking-header {
		text-align: center;
		margin-bottom: 20px;
	}

	.ranking-header h3 {
		margin: 5px 0;
		color: #2c3e50;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		gap: 8px;
		font-size: 18px;
	}

	.level-tag {
		background: #4285f4;
		color: white;
		padding: 4px 12px;
		border-radius: 20px;
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		font-weight: 600;
	}

	.user-level-chip {
		background: #e91e63;
		color: white;
		padding: 4px 12px;
		border-radius: 20px;
		font-size: 11px;
		font-weight: 600;
		white-space: nowrap;
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}

	.total-players {
		font-size: 12px;
		color: #7f8c8d;
		font-weight: 600;
		display: block;
		margin-top: 5px;
	}

	.level-filter {
		display: flex;
		justify-content: center;
		margin-bottom: 20px;
		flex-wrap: wrap;
		gap: 8px;
	}

	.level-tab {
		background: #e8e2dc;
		border: none;
		padding: 6px 12px;
		border-radius: 8px;
		cursor: pointer;
		font-size: 11px;
		font-weight: 600;
		color: #555;
		transition: all 0.2s ease;
	}

	.level-tab:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.level-tab.active {
		background: var(--primary-blue, #4285f4);
		color: white;
		box-shadow: 0 2px 8px rgba(66, 133, 244, 0.4);
	}

	.leaderboard-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.rank-item {
		display: flex;
		align-items: center;
		background: white;
		padding: 12px 15px;
		border-radius: 16px;
		margin-bottom: 10px;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
		border: 1px solid transparent;
		transition: all 0.2s ease;
	}

	.rank-item:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
	}

	.rank-item.current-user {
		border-color: #4285f4;
		background: #f0f7ff;
	}

	.rank-pos {
		font-size: 16px;
		font-weight: 800;
		color: #7f8c8d;
		width: 30px;
		text-align: center;
		margin-right: 10px;
	}

	.rank-pos.top-3 {
		font-size: 22px;
	}

	.rank-avatar {
		width: 44px;
		height: 44px;
		border-radius: 50%;
		margin-right: 15px;
		border: 2px solid #fff;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
		object-fit: cover;
	}

	.rank-info {
		flex: 1;
		text-align: left;
	}

	.rank-name {
		display: block;
		font-weight: 700;
		color: #2c3e50;
		font-size: 14px;
	}

	.rank-level-icon {
		font-size: 12px;
		margin-left: 4px;
	}

	.rank-score {
		font-size: 16px;
		font-weight: 900;
		color: #4285f4;
	}

	/* Estilos de la pestaña de logros */
	.level-hero {
		background: white;
		border-radius: 20px;
		padding: 20px 16px;
		text-align: center;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
		margin-bottom: 20px;
		position: relative;
		overflow: hidden;
	}

	.level-hero::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 8px;
		background: var(--lvl-color, #4285f4);
	}

	.level-icon-large {
		font-size: 44px;
		background: #f8faff;
		width: 75px;
		height: 75px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		margin: 0 auto 12px;
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
		border: 3px solid white;
	}

	.level-title {
		font-size: 20px;
		font-weight: 900;
		margin: 0;
		color: #2c3e50;
	}

	.level-desc {
		color: #7f8c8d;
		font-size: 14px;
		margin: 10px 0 20px;
	}

	.specialty-chips-hero {
		display: flex;
		gap: 8px;
		justify-content: center;
		margin-top: 12px;
	}

	.specialty-chip-hero {
		padding: 6px 14px;
		border-radius: 16px;
		font-size: 11px;
		font-weight: 700;
		display: inline-flex;
		align-items: center;
		gap: 5px;
		color: white;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.specialty-chip-hero.tool-chip {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}

	.specialty-chip-hero.mode-chip {
		background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
	}

	.badges-section h4 {
		font-size: 16px;
		color: #2c3e50;
		margin: 0 0 15px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.points-total {
		font-size: 12px;
		color: #4285f4;
		background: #e0e7ff;
		padding: 4px 10px;
		border-radius: 12px;
	}

	.badge-grid-compact {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
		width: 100%;
	}

	.badge-item-compact {
		background: white;
		border-radius: 18px;
		padding: 8px 6px;
		text-align: center;
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
		position: relative;
		border: 2px solid transparent;
		transition: transform 0.2s;
		cursor: pointer;
		aspect-ratio: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		overflow: visible;
		box-sizing: border-box;
	}

	.badge-item-compact:hover {
		transform: translateY(-3px);
	}

	.badge-icon-compact {
		font-size: 26px;
		margin-bottom: 6px;
		display: inline-block;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
	}

	.badge-name-compact {
		display: block;
		font-size: 9px;
		font-weight: 700;
		color: #2c3e50;
		line-height: 1.2;
	}

	.badge-tier-label-compact {
		position: absolute;
		top: -6px;
		right: -6px;
		font-size: 8px;
		font-weight: 800;
		text-transform: uppercase;
		padding: 2px 6px;
		border-radius: 8px;
		color: white;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
	}

	/* Estilos metálicos */
	.badge-item-bronce {
		border-color: #cd7f32;
		background: linear-gradient(to bottom right, #fff, #fffaf5);
	}

	.badge-item-bronce .badge-tier-label-compact {
		background: linear-gradient(135deg, #e7cbae, #cd7f32);
	}

	.badge-item-plata {
		border-color: #c0c0c0;
		background: linear-gradient(to bottom right, #fff, #f8f9fa);
	}

	.badge-item-plata .badge-tier-label-compact {
		background: linear-gradient(135deg, #f0f0f0, #c0c0c0);
		color: #555;
	}

	.badge-item-oro {
		border-color: #ffd700;
		background: linear-gradient(to bottom right, #fff, #fffdf0);
		box-shadow: 0 8px 20px rgba(255, 215, 0, 0.15);
	}

	.badge-item-oro .badge-tier-label-compact {
		background: linear-gradient(135deg, #fff7cc, #ffd700);
		color: #7a6000;
	}

	.badge-item-locked {
		opacity: 0.4;
		filter: grayscale(1);
		border: 2px dashed #ccc;
	}

	.no-badges {
		grid-column: 1 / -1;
		text-align: center;
		color: #7f8c8d;
		padding: 20px;
	}

	.popover-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 250;
		pointer-events: none;
	}

	.popover-container {
		position: fixed;
		z-index: 251;
		transform: translate(-50%, -50%);
		transition:
			transform 0.2s ease,
			opacity 0.2s ease;
		pointer-events: auto;
	}

	/* Mobile Responsive Styles */
	@media (max-width: 480px) {
		.modal-header {
			padding: 15px 15px 0;
		}
		.modal-header h2 {
			font-size: 18px;
		}
		.tabs-nav {
			padding: 10px 15px 0;
		}
		.tab-btn {
			padding: 10px;
			font-size: 13px;
		}
		.tab-content {
			padding: 15px;
			height: calc(100vh - 140px);
		}
		.ranking-header h3 {
			font-size: 16px;
			gap: 6px;
		}
		.level-tag {
			padding: 3px 10px;
			font-size: 11px;
		}

		.level-filter {
			flex-wrap: nowrap;
			overflow-x: auto;
			justify-content: flex-start;
			-ms-overflow-style: none; /* IE and Edge */
			scrollbar-width: none; /* Firefox */
			padding-bottom: 8px; /* For shadow visibility */
		}
		.level-filter::-webkit-scrollbar {
			display: none; /* Chrome, Safari and Opera */
		}
		.level-tab {
			flex-shrink: 0;
			white-space: nowrap;
		}

		.rank-item {
			padding: 8px 10px;
			border-radius: 12px;
		}
		.rank-avatar {
			width: 40px;
			height: 40px;
			margin-right: 10px;
		}
		.rank-pos {
			width: 25px;
			font-size: 14px;
			margin-right: 8px;
		}
		.rank-pos.top-3 {
			font-size: 20px;
		}
		.rank-name {
			font-size: 13px;
		}
		.rank-score {
			font-size: 15px;
		}

		/* Achievements Tab */
		.level-hero {
			padding: 15px;
			border-radius: 16px;
		}
		.level-icon-large {
			width: 60px;
			height: 60px;
			font-size: 36px;
		}
		.level-title {
			font-size: 18px;
		}
		.level-desc {
			font-size: 13px;
			margin: 8px 0 15px;
		}
		.badges-section h4 {
			font-size: 15px;
		}
		.badge-grid-compact {
			gap: 12px;
		}
		.badge-item-compact {
			border-radius: 16px;
		}
	}

	/* Share Button Styles */
	.share-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 6px 14px;
		background: #f8f9fa;
		color: #6c757d;
		border: 1px solid #dee2e6;
		border-radius: 20px;
		font-weight: 500;
		font-size: 13px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.share-btn:hover {
		background: #e9ecef;
		color: #495057;
		border-color: #adb5bd;
	}

	.share-btn:active {
		transform: scale(0.98);
	}

	/* Share Modal Styles */</style>