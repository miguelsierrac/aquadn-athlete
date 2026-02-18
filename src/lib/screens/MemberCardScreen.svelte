<script>
	import { toast } from '@zerodevx/svelte-toast';
	import TechnicalSheet from '$lib/screens/TechnicalSheet.svelte';
	import ProductTour from '$lib/components/ProductTour.svelte';
	import { tick } from 'svelte';

	export let athlete;
	export let onLogOut;
	export let badges = [];
	export let level = null;
	export let stats = {};
	export let isLoading = false;
	export let gamificationLevels = [];
	export let currentUserID;

	let isFlipped = false;
	let tourInstance;
	let isTransitioning = false;
	let tourInitialized = false;

	// Configure tour steps based on athlete tier
	let tourSteps = [];
	$: if (athlete && athlete.tier !== 'standard') {
		tourSteps = [
			{
				element: '.flip-btn',
				popover: {
					title: '🔄 Voltea tu Carnet',
					description:
						'¡Bienvenido! Haz click en este botón para voltear tu carnet y acceder a tu <strong>Ficha Técnica</strong> con toda tu información de progreso.',
					side: 'bottom',
					align: 'center',
					onNextClick: async () => {
						if (isTransitioning) return;
						isTransitioning = true;
						isFlipped = true;
						await tick();
						setTimeout(() => {
							const driver = tourInstance?.getInstance();
							if (driver) driver.moveNext();
							isTransitioning = false;
						}, 600);
					}
				}
			},
			{
				element: '#tech-sheet-header',
				popover: {
					title: '📊 Tu Ficha Técnica',
					description:
						'Aquí encontrarás toda tu información de progreso y desarrollo. Vamos a explorar las secciones principales.',
					side: 'bottom',
					align: 'start',
					onPrevClick: async () => {
						if (isTransitioning) return;
						isTransitioning = true;
						isFlipped = false;
						await tick();
						setTimeout(() => {
							const driver = tourInstance?.getInstance();
							if (driver) driver.movePrevious();
							isTransitioning = false;
						}, 600);
					}
				}
			},
			{
				element: '#basic-stats-section',
				popover: {
					title: '⚖️ Estadísticas Básicas',
					description: 'Tus medidas básicas de peso y talla, actualizadas regularmente.',
					side: 'bottom',
					align: 'center'
				}
			},
			{
				element: '#level-section',
				popover: {
					title: '🎯 Tu Nivel y Objetivos',
					description:
						'Aquí ves tu nivel actual y progreso. <strong>Haz click</strong> para ver todos tus objetivos en detalle.',
					side: 'bottom',
					align: 'center'
				}
			},
			{
				element: '#leaderboard-section',
				popover: {
					title: '🏆 Tabla de Posiciones',
					description:
						'Accede al ranking para ver cómo te comparas con otros atletas de tu nivel. ¡Compite y mejora tu posición!',
					side: 'top',
					align: 'center'
				}
			}
		];
	}

	// Ensure card is not flipped when tour starts
	$: if (!isLoading && tourSteps.length > 0 && !tourInitialized) {
		const hasSeenTour =
			typeof localStorage !== 'undefined' && localStorage.getItem('hasSeenMemberCardTour');
		if (!hasSeenTour) {
			isFlipped = false;
			tourInitialized = true;
		}
	}

	function convertDateToUTC(date) {
		return new Date(
			date.getUTCFullYear(),
			date.getUTCMonth(),
			date.getUTCDate(),
			date.getUTCHours(),
			date.getUTCMinutes(),
			date.getUTCSeconds()
		);
	}

	function expired(date) {
		let now = convertDateToUTC(new Date());

		return now > date;
	}

	function showNotification(title, body, message, duration = undefined) {
		var options = {
			target: 'critical-notifications'
		};
		if (duration) {
			options['duration'] = duration;
		} else {
			options['initial'] = 0;
		}
		toast.push(
			'<strong>' +
				title +
				'</strong><br>' +
				body +
				'<br><br><a class="bg-red-500 hover:bg-red-700 text-white py-1 px-1 rounded" aria-label="Contactarme" href="https://wa.me/573215384134?text=' +
				encodeURIComponent(message) +
				'">💬 CONTACTARSE<a />',
			options
		);
	}

	$: {
		toast.pop({ target: 'critical-notifications' });
		if (athlete) {
			if (
				expired(convertDateToUTC(new Date(athlete.expiration_date))) ||
				athlete.remaining_days <= 0
			) {
				showNotification(
					'IMPORTANTE ‼',
					'Tu plan ha expirado o ya no te quedan clases disponibles, si deseas continuar con nosotros, puedes contactarnos para renovar tu plan o solicitar días adicionales, puedes hacerlo dando click aquí:',
					'Quiero renovar mi plan o solicitar clases adicionales'
				);
			} else if (athlete.remaining_days < 2) {
				showNotification(
					'Recordatorio',
					'Ya solo te quedan ' +
						athlete.remaining_days +
						' clases restantes. Si lo deseas, puedes contactarnos para cambiar tu plan o solicitar días adicionales, puedes hacerlo dando click aquí:',
					'Quiero cambiar mi plan o solicitar clases adicionales',
					8000
				);
			}
		}
	}
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.gstatic.com/" crossorigin="" />
	<link
		rel="stylesheet"
		as="style"
		onload="this.rel='stylesheet'"
		href="https://fonts.googleapis.com/css2?display=swap&amp;family=Lexend%3Awght%40400%3B500%3B700%3B900&amp;family=Noto+Sans%3Awght%40400%3B500%3B700%3B900"
	/>
	<link rel="icon" type="image/x-icon" href="data:image/x-icon;base64," />
</svelte:head>

{#if athlete}
	<ProductTour
		steps={tourSteps}
		storageKey="hasSeenMemberCardTour"
		shouldStart={!isLoading}
		bind:this={tourInstance}
	/>

	<!-- Help button to restart tour -->
	{#if athlete.tier !== 'standard' && !isFlipped}
		<button
			class="help-tour-btn"
			on:click={() => {
				if (tourInstance) tourInstance.restart();
			}}
			title="Ver tutorial"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<circle cx="12" cy="12" r="10"></circle>
				<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
				<line x1="12" y1="17" x2="12.01" y2="17"></line>
			</svg>
		</button>
	{/if}

	<div class="page-wrapper">
		<div class="card-scene">
			<div class="card-inner" class:is-flipped={isFlipped}>
				<!-- Capas para simular grosor 3D -->
				<div class="thickness-layer" style="transform: translateZ(-2px)"></div>
				<div class="thickness-layer" style="transform: translateZ(-1px)"></div>
				<div class="thickness-layer" style="transform: translateZ(0px)"></div>
				<div class="thickness-layer" style="transform: translateZ(1px)"></div>
				<div class="thickness-layer" style="transform: translateZ(2px)"></div>

				<!-- CARA FRONTAL -->
				<div class="card-face card-front">
					{#if athlete.tier !== 'standard'}
						<button class="flip-btn" on:click={() => (isFlipped = !isFlipped)}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
							</svg>
						</button>
					{/if}

					<div
						class="relative flex size-full h-full flex-col bg-[#fcfaf8] justify-between group/design-root overflow-hidden"
					>
						<div>
							<div class="flex p-4 @container">
								<div class="flex w-full flex-col gap-4 items-center">
									<div class="flex gap-4 flex-col items-center">
										<div
											class="bg-center bg-no-repeat aspect-square bg-cover rounded-xl h-auto w-1/3"
											style="background-image: url('logo_512.png');"
										></div>
										<div class="flex flex-col items-center justify-center">
											<p
												class="text-[#1c150d] text-[20px] font-bold leading-tight tracking-[-0.015em] text-center"
											>
												AQUADN Club de Natación
											</p>
											<p class="text-[#9c7849] text-[14px] font-normal leading-normal text-center">
												ID: {athlete.identification}
											</p>
											{#if !athlete.expiration_date}
												<p
													class="text-[#9c7849] text-[14px] text-red-600 font-bold leading-normal text-center"
												>
													Membresía ha expirado
												</p>
											{:else if expired(convertDateToUTC(new Date(athlete.expiration_date)))}
												<p
													class="text-[#9c7849] text-[14px] text-red-600 font-bold leading-normal text-center"
												>
													Expiró {convertDateToUTC(
														new Date(athlete.expiration_date)
													).toLocaleDateString('es-ES', {
														day: 'numeric',
														month: 'long',
														year: 'numeric'
													})}
												</p>
											{:else}
												<p
													class="text-[#9c7849] text-[14px] font-normal leading-normal text-center"
												>
													Valido hasta {convertDateToUTC(
														new Date(athlete.expiration_date)
													).toLocaleDateString('es-ES', {
														day: 'numeric',
														month: 'long',
														year: 'numeric'
													})}
												</p>
											{/if}
										</div>
									</div>
								</div>
							</div>
							<div class="flex items-center gap-4 bg-[#fcfaf8] px-4 min-h-10">
								<div
									class="text-[#1c150d] flex items-center justify-center rounded-lg bg-[#f4eee7] shrink-0 size-8"
									data-icon="Person"
									data-size="18px"
									data-weight="regular"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="18px"
										height="18px"
										fill="currentColor"
										viewBox="0 0 256 256"
									>
										<path
											d="M160,40a32,32,0,1,0-32,32A32,32,0,0,0,160,40ZM128,56a16,16,0,1,1,16-16A16,16,0,0,1,128,56Zm90.34,78.05L173.17,82.83a32,32,0,0,0-24-10.83H106.83a32,32,0,0,0-24,10.83L37.66,134.05a20,20,0,0,0,28.13,28.43l16.3-13.08L65.55,212.28A20,20,0,0,0,102,228.8l26-44.87,26,44.87a20,20,0,0,0,36.41-16.52L173.91,149.4l16.3,13.08a20,20,0,0,0,28.13-28.43Zm-11.51,16.77a4,4,0,0,1-5.66,0c-.21-.2-.42-.4-.65-.58L165,121.76A8,8,0,0,0,152.26,130L175.14,217a7.72,7.72,0,0,0,.48,1.35,4,4,0,1,1-7.25,3.38,6.25,6.25,0,0,0-.33-.63L134.92,164a8,8,0,0,0-13.84,0L88,221.05a6.25,6.25,0,0,0-.33.63,4,4,0,0,1-2.26,2.07,4,4,0,0,1-5-5.45,7.72,7.72,0,0,0,.48-1.35L103.74,130A8,8,0,0,0,91,121.76L55.48,150.24c-.23.18-.44.38-.65.58a4,4,0,1,1-5.66-5.65c.12-.12.23-.24.34-.37L94.83,93.41a16,16,0,0,1,12-5.41h42.34a16,16,0,0,1,12,5.41l45.32,51.39c.11.13.22.25.34.37A4,4,0,0,1,206.83,150.82Z"
										></path>
									</svg>
								</div>
								<p
									class="text-[#1c150d] text-base font-normal leading-normal flex-1 truncate text-left"
								>
									{athlete.forename}
									{athlete.surname}
								</p>
							</div>
							<div class="flex w-full justify-center grow bg-[#fcfaf8] @container p-4 px-28">
								{#if athlete.photo}
									<div
										class="bg-center bg-no-repeat aspect-square bg-cover rounded-xl max-h-40 w-full"
										style="background-image: url({athlete.photo});"
									></div>
								{:else}
									<div
										class="flex justify-center w-full max-h-40 p-4 overflow-hidden bg-gray-100 rounded-lg dark:bg-gray-600"
									>
										<svg
											class="flex w-auto h-auto text-gray-400"
											fill="currentColor"
											viewBox="0 0 20 20"
											xmlns="http://www.w3.org/2000/svg"
											><path
												fill-rule="evenodd"
												d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
												clip-rule="evenodd"
											></path></svg
										>
									</div>
								{/if}
							</div>
							{#if athlete.total_distance}
								<div class="flex @container">
									<div class="flex w-full flex-col gap-4 items-center">
										<div class="flex gap-4 flex-row items-center">
											{#if athlete.total_distance >= 1000}
												<img src="medal_1k.png" alt="Icono" class="icon" width="50" height="50" />
											{/if}
											{#if athlete.total_distance >= 2000}
												<img src="medal_2k.png" alt="Icono" class="icon" width="50" height="50" />
											{/if}
											{#if athlete.total_distance >= 5000}
												<img src="medal_5k.png" alt="Icono" class="icon" width="50" height="50" />
											{/if}
											{#if athlete.total_distance >= 10000}
												<img src="medal_10k.png" alt="Icono" class="icon" width="50" height="50" />
											{/if}
											{#if athlete.total_distance >= 20000}
												<img src="medal_20k.png" alt="Icono" class="icon" width="50" height="50" />
											{/if}
										</div>
									</div>
								</div>
							{/if}
							<div class="flex items-center gap-4 bg-[#fcfaf8] px-4 min-h-10">
								<div
									class="text-[#1c150d] flex items-center justify-center rounded-lg bg-[#f4eee7] shrink-0 size-8"
									data-icon="Calendar"
									data-size="18px"
									data-weight="regular"
								>
									<span class="material-symbols-outlined"> bloodtype </span>
								</div>
								<p
									class="text-[#1c150d] text-base font-normal leading-normal flex-1 truncate text-left"
								>
									{athlete.blood_type
										? `Tipo de sangre: ${athlete.blood_type}`
										: 'Tipo de sangre: No registrado'}
								</p>
							</div>
							<div class="flex items-center gap-4 bg-[#fcfaf8] px-4 min-h-10">
								<div
									class="text-[#1c150d] flex items-center justify-center rounded-lg bg-[#f4eee7] shrink-0 size-8"
									data-icon="Calendar"
									data-size="18px"
									data-weight="regular"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="18px"
										height="18px"
										fill="currentColor"
										viewBox="0 0 256 256"
									>
										<path
											d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-96-88v64a8,8,0,0,1-16,0V132.94l-4.42,2.22a8,8,0,0,1-7.16-14.32l16-8A8,8,0,0,1,112,120Zm59.16,30.45L152,176h16a8,8,0,0,1,0,16H136a8,8,0,0,1-6.4-12.8l28.78-38.37A8,8,0,1,0,145.07,132a8,8,0,1,1-13.85-8A24,24,0,0,1,176,136,23.76,23.76,0,0,1,171.16,150.45Z"
										></path>
									</svg>
								</div>
								<p
									class="text-[#1c150d] text-base font-normal leading-normal flex-1 truncate text-left"
								>
									Miembro desde {convertDateToUTC(new Date(athlete.start_date)).toLocaleDateString(
										'es-ES',
										{ month: 'long', year: 'numeric' }
									)}
								</p>
							</div>
							<!-- 
							<div class="flex items-center gap-4 bg-[#fcfaf8] px-4 min-h-10">
								<div
									class="text-[#1c150d] flex items-center justify-center rounded-lg bg-[#f4eee7] shrink-0 size-8"
									data-icon="Copy"
									data-size="18px"
									data-weight="regular"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="18px"
										height="18px"
										fill="currentColor"
										viewBox="0 0 256 256"
									>
										<path
											d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"
										></path>
									</svg>
								</div>
								<p
									class="text-[#1c150d] text-base font-normal leading-normal flex-1 truncate text-left"
								>
									{#if athlete.remaining_days >= 0}
										Clases restantes: <b>{athlete.remaining_days}</b>
									{:else}
										Clases restantes: <b
											>0 <span class="text-[#9c7849] text-base text-red-600"
												>({athlete.remaining_days} extras)</span
											></b
										>
									{/if}
								</p>
							</div>
							-->
							{#if athlete.phone}
								<div class="flex items-center gap-4 bg-[#fcfaf8] px-4 min-h-10">
									<div
										class="text-[#1c150d] flex items-center justify-center rounded-lg bg-[#f4eee7] shrink-0 size-8"
										data-icon="Phone"
										data-size="18px"
										data-weight="regular"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="18px"
											height="18px"
											fill="currentColor"
											viewBox="0 0 256 256"
										>
											<path
												d="M222.37,158.46l-47.11-21.11-.13-.06a16,16,0,0,0-15.17,1.4,8.12,8.12,0,0,0-.75.56L134.87,160c-15.42-7.49-31.34-23.29-38.83-38.51l20.78-24.71c.2-.25.39-.5.57-.77a16,16,0,0,0,1.32-15.06l0-.12L97.54,33.64a16,16,0,0,0-16.62-9.52A56.26,56.26,0,0,0,32,80c0,79.4,64.6,144,144,144a56.26,56.26,0,0,0,55.88-48.92A16,16,0,0,0,222.37,158.46ZM176,208A128.14,128.14,0,0,1,48,80,40.2,40.2,0,0,1,82.87,40a.61.61,0,0,0,0,.12l21,47L83.2,111.86a6.13,6.13,0,0,0-.57.77,16,16,0,0,0-1,15.7c9.06,18.53,27.73,37.06,46.46,46.11a16,16,0,0,0,15.75-1.14,8.44,8.44,0,0,0,.74-.56L168.89,152l47,21.05h0s.08,0,.11,0A40.21,40.21,0,0,1,176,208Z"
											></path>
										</svg>
									</div>
									<p
										class="text-[#1c150d] text-base font-normal leading-normal flex-1 truncate text-left"
									>
										Telefóno: {athlete.phone}
									</p>
								</div>
							{/if}
							<div class="flex p-4 @container">
								<div class="flex w-full flex-col gap-4 items-center">
									<div class="flex gap-4 flex-col items-center">
										<div class="flex flex-col items-center justify-center">
											<img
												id="barcode"
												src="https://api.qrserver.com/v1/create-qr-code/?data={athlete.id}&amp;size=100x100"
												alt=""
												title="ID"
												width="50"
												height="50"
											/>
										</div>
										<div class="flex flex-col items-center justify-center">
											<button
												class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
												on:click={onLogOut()}>Cerrar Sesión</button
											>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{#if !athlete.expiration_date || expired(convertDateToUTC(new Date(athlete.expiration_date)))}
						<div class="absolute top-60 right-8 left-8 z-10">
							<span class="stamp is-nope">Vencido</span>
						</div>
					{/if}
				</div>

				<!-- CARA TRASERA -->
				<div class="card-face card-back">
					<TechnicalSheet
						tier={athlete.tier}
						weeklyDistance={athlete.weeklyDistance}
						monthlyRecord={athlete.monthlyRecord}
						monthlyRecordDate={athlete.monthlyRecordDate}
						totalDistance={athlete.total_distance}
						{stats}
						{badges}
						{level}
						{isLoading}
						allLevels={gamificationLevels}
						{currentUserID}
						on:flip={() => (isFlipped = !isFlipped)}
					/>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	:root {
		--primary-blue: #4285f4;
		--secondary-green: #34a853;
		--kids-color: #ff6d00;
		--accent-gold: #ffc107;
		--bg-icon: #f7f3ef;
		--text-dark: #2c3e50;
		--text-muted: #7f8c8d;
	}

	.page-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		background-color: #f0f2f5;
		perspective: 1000px;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.card-scene {
		width: 90%;
		height: 90%;
		position: absolute;
	}

	.card-inner {
		position: relative;
		width: 100%;
		height: 100%;
		text-align: center;
		transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
		transform-style: preserve-3d;
	}

	.card-inner.is-flipped {
		transform: rotateY(180deg);
	}

	.card-face {
		position: absolute;
		width: 100%;
		height: 100%;
		-webkit-backface-visibility: hidden;
		backface-visibility: hidden;
		background: white;
		border-radius: 24px;
		box-shadow:
			0 2px 4px rgba(0, 0, 0, 0.04),
			0 8px 16px rgba(0, 0, 0, 0.04),
			0 24px 48px rgba(0, 0, 0, 0.08),
			inset 0 1px 0 rgba(255, 255, 255, 0.6);
		overflow: hidden;
		-webkit-mask-image: -webkit-radial-gradient(
			white,
			black
		); /* Fix Safari border-radius overflow */
		transform: translateZ(3px);
		z-index: 1;
		border: 1px solid rgba(0, 0, 0, 0.08);
	}

	.card-back {
		transform: rotateY(180deg) translateZ(3px);
	}

	.thickness-layer {
		position: absolute;
		width: 100%;
		height: 100%;
		background-color: #e2e8f0;
		border-radius: 24px;
		border: 1px solid #cbd5e1;
	}

	.flip-btn {
		position: absolute;
		top: 20px;
		right: 20px;
		background: var(--bg-icon);
		border: none;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		cursor: pointer;
		font-size: 18px;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 20;
		color: var(--primary-blue);
		box-shadow: 0 4px 12px rgba(66, 133, 244, 0.25);
		transition:
			transform 0.2s,
			opacity 0s 0.4s;
		opacity: 1;
		-webkit-backface-visibility: hidden;
		backface-visibility: hidden;
		animation: pulse-attention 2s infinite;
	}

	.help-tour-btn {
		position: fixed;
		bottom: 20px;
		right: 20px;
		background: #4285f4;
		border: none;
		width: 56px;
		height: 56px;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 999;
		color: white;
		box-shadow: 0 4px 16px rgba(66, 133, 244, 0.4);
		transition: all 0.3s ease;
	}

	.help-tour-btn:hover {
		background: #3c78d8;
		transform: translateY(-2px) scale(1.05);
		box-shadow: 0 6px 20px rgba(66, 133, 244, 0.5);
	}

	.help-tour-btn:active {
		transform: translateY(0) scale(0.98);
	}

	@keyframes pulse-attention {
		0% {
			box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.4);
		}
		70% {
			box-shadow: 0 0 0 8px rgba(66, 133, 244, 0);
		}
		100% {
			box-shadow: 0 0 0 0 rgba(66, 133, 244, 0);
		}
	}

	.card-inner.is-flipped .card-front .flip-btn {
		opacity: 0;
		pointer-events: none;
		transition:
			opacity 0s 0s,
			transform 0.2s;
	}

	.stamp {
		transform: rotate(12deg);
		color: #555;
		font-size: 3rem;
		font-weight: 700;
		border: 0.25rem solid #555;
		display: inline-block;
		padding: 0.25rem 1rem;
		text-transform: uppercase;
		border-radius: 1rem;
		font-family: 'Courier';
		-webkit-mask-image: url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/8399/grunge.png');
		-webkit-mask-size: 944px 604px;
		mix-blend-mode: multiply;
	}

	.is-nope {
		color: #d23;
		border: 0.5rem double #d23;
		transform: rotate(12deg);
		-webkit-mask-position: 2rem 3rem;
		font-size: 4rem;
	}
</style>
