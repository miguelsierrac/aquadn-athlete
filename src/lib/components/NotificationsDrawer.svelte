<script>
	export let open = false;
	export let notificationList = [];
	export let onClose = () => {};
	export let onMarkAllRead = () => {};
	export let onDelete = (_id) => {};
	export let onClearAll = () => {};

	function formatTime(ts) {
		if (!ts) return '';
		const d = new Date(ts);
		const today = new Date();
		const isToday =
			d.getDate() === today.getDate() &&
			d.getMonth() === today.getMonth() &&
			d.getFullYear() === today.getFullYear();
		const timeStr = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
		if (isToday) return `Hoy · ${timeStr}`;
		return (
			d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) + ' · ' + timeStr
		);
	}

	$: hasUnread = notificationList.some((n) => !n.read);
</script>

{#if open}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="overlay" on:click={onClose}></div>
	<div class="drawer">
		<div class="drawer-header">
			<div class="drawer-title">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
					<path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
				</svg>
				<span>Notificaciones</span>
			</div>
			<div class="header-actions">
				{#if hasUnread}
					<button class="mark-read-btn" on:click={onMarkAllRead}>Marcar leídas</button>
				{/if}			{#if notificationList.length > 0}
				<button class="clear-btn" on:click={onClearAll} title="Eliminar todas">
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="3 6 5 6 21 6"></polyline>
						<path d="M19 6l-1 14H6L5 6"></path>
						<path d="M10 11v6"></path><path d="M14 11v6"></path>
						<path d="M9 6V4h6v2"></path>
					</svg>
				</button>
			{/if}				<button class="close-btn" on:click={onClose} aria-label="Cerrar">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			</div>
		</div>

		<div class="drawer-body">
			{#if notificationList.length === 0}
				<div class="empty-state">
					<div class="empty-icon">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="40"
							height="40"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
							<path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
						</svg>
					</div>
					<p class="empty-title">Sin notificaciones</p>
					<p class="empty-subtitle">Las notificaciones que recibas aparecerán aquí</p>
				</div>
			{:else}
				{#each notificationList as notif (notif.id)}
					<div class="notif-item" class:unread={!notif.read}>
						<div class="notif-icon" class:unread-icon={!notif.read}>
							{#if !notif.read}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="currentColor"
									stroke="none"
								>
									<path
										d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
									></path>
								</svg>
							{:else}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
									<path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
								</svg>
							{/if}
						</div>
						<div class="notif-content">
							<p class="notif-title">{notif.title}</p>
							<p class="notif-body">{notif.body}</p>
							<p class="notif-time">{formatTime(notif.timestamp)}</p>
						</div>
						<button class="delete-btn" on:click={() => onDelete(notif.id)} title="Eliminar">
							<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
								<line x1="18" y1="6" x2="6" y2="18"></line>
								<line x1="6" y1="6" x2="18" y2="18"></line>
							</svg>
						</button>
						{#if !notif.read}
							<div class="unread-dot"></div>
						{/if}
					</div>
				{/each}
			{/if}
		</div>
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		z-index: 100;
		animation: fade-in 0.2s ease;
	}

	.drawer {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		max-height: 70vh;
		background: #fff;
		border-radius: 0 0 24px 24px;
		box-shadow: 0 8px 40px rgba(0, 0, 0, 0.18);
		z-index: 101;
		display: flex;
		flex-direction: column;
		animation: slide-down 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
		overflow: hidden;
	}

	.drawer-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px 20px 16px;
		border-bottom: 1px solid #f0ede9;
		flex-shrink: 0;
	}

	.drawer-title {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 16px;
		font-weight: 700;
		color: #1c150d;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.mark-read-btn {
		background: none;
		border: 1px solid #4285f4;
		color: #4285f4;
		font-size: 12px;
		font-weight: 600;
		padding: 4px 10px;
		border-radius: 20px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.mark-read-btn:hover {
		background: #4285f4;
		color: white;
	}

	.close-btn {
		background: #f4eee7;
		border: none;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #1c150d;
		transition: background 0.2s;
	}

	.close-btn:hover {
		background: #e8e0d6;
	}

	.drawer-body {
		overflow-y: auto;
		flex: 1;
		padding: 8px 0;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 48px 24px;
		gap: 12px;
	}

	.empty-icon {
		color: #c8b9a8;
	}

	.empty-title {
		font-size: 15px;
		font-weight: 600;
		color: #1c150d;
		margin: 0;
	}

	.empty-subtitle {
		font-size: 13px;
		color: #9c7849;
		margin: 0;
		text-align: center;
	}

	.notif-item {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 14px 20px;
		transition: background 0.15s;
		position: relative;
	}

	.notif-item:hover {
		background: #faf8f5;
	}

	.notif-item.unread {
		background: #f0f5ff;
	}

	.notif-item.unread:hover {
		background: #e8efff;
	}

	.notif-icon {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: #f4eee7;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #9c7849;
		flex-shrink: 0;
		margin-top: 2px;
	}

	.notif-icon.unread-icon {
		background: #e8efff;
		color: #4285f4;
	}

	.notif-content {
		flex: 1;
		min-width: 0;
	}

	.notif-title {
		font-size: 14px;
		font-weight: 600;
		color: #1c150d;
		margin: 0 0 3px;
	}

	.notif-body {
		font-size: 13px;
		color: #6b5740;
		margin: 0 0 5px;
		line-height: 1.4;
	}

	.notif-time {
		font-size: 11px;
		color: #9c7849;
		margin: 0;
	}

	.delete-btn {
		background: none;
		border: none;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #c8b9a8;
		flex-shrink: 0;
		transition: background 0.15s, color 0.15s;
		margin-top: 4px;
	}

	.delete-btn:hover {
		background: #fee2e2;
		color: #dc2626;
	}

	.clear-btn {
		background: none;
		border: 1px solid #e5e0d8;
		width: 30px;
		height: 30px;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #9c7849;
		transition: all 0.2s;
	}

	.clear-btn:hover {
		background: #fee2e2;
		border-color: #dc2626;
		color: #dc2626;
	}

	.unread-dot {
		width: 8px;
		height: 8px;
		background: #4285f4;
		border-radius: 50%;
		flex-shrink: 0;
		margin-top: 6px;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slide-down {
		from {
			transform: translateY(-100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
</style>
