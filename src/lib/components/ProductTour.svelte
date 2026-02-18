<script>
	import { onMount, onDestroy } from 'svelte';
	import { driver } from 'driver.js';
	import 'driver.js/dist/driver.css';

	export let steps = [];
	export let onComplete = () => {};
	export let storageKey = 'hasSeenTour';
	export let shouldStart = true;

	let driverInstance;
	let hasCheckedStorage = false;

	onMount(() => {
		// Check if user has already seen the tour
		const hasSeenTour = localStorage.getItem(storageKey);
		hasCheckedStorage = true;

		if (!hasSeenTour && steps.length > 0 && shouldStart) {
			// Small delay to ensure DOM is ready
			setTimeout(() => {
				startTour();
			}, 500);
		}
	});

	// Watch for shouldStart changes to trigger tour when data is ready
	$: if (hasCheckedStorage && shouldStart && !localStorage.getItem(storageKey) && steps.length > 0 && !driverInstance) {
		setTimeout(() => {
			startTour();
		}, 500);
	}

	function startTour() {
		driverInstance = driver({
			showProgress: true,
			showButtons: ['next', 'previous', 'close'],
			steps: steps,
			onDestroyed: () => {
				localStorage.setItem(storageKey, 'true');
				onComplete();
			},
			onNextClick: (element, step, options) => {
				// Get the current step index
				const currentIndex = driverInstance.getActiveIndex();
				const currentStep = steps[currentIndex];
				
				// Check if the current step has a custom onNextClick
				if (currentStep?.popover?.onNextClick) {
					currentStep.popover.onNextClick(driverInstance);
				} else {
					driverInstance.moveNext();
				}
			},
			onPrevClick: (element, step, options) => {
				// Get the current step index
				const currentIndex = driverInstance.getActiveIndex();
				const currentStep = steps[currentIndex];
				
				// Check if the current step has a custom onPrevClick
				if (currentStep?.popover?.onPrevClick) {
					currentStep.popover.onPrevClick(driverInstance);
				} else {
					driverInstance.movePrevious();
				}
			},
			popoverClass: 'product-tour-popover',
			nextBtnText: 'Siguiente →',
			prevBtnText: '← Anterior',
			doneBtnText: '¡Entendido! ✓',
			progressText: '{{current}} de {{total}}'
		});

		driverInstance.drive();
	}

	export function restart() {
		localStorage.removeItem(storageKey);
		startTour();
	}

	export function getInstance() {
		return driverInstance;
	}

	onDestroy(() => {
		if (driverInstance) {
			driverInstance.destroy();
		}
	});
</script>

<style>
	:global(.product-tour-popover) {
		max-width: 360px;
	}

	:global(.driver-popover.product-tour-popover .driver-popover-title) {
		font-size: 18px;
		font-weight: 700;
		color: #2c3e50;
		margin-bottom: 8px;
	}

	:global(.driver-popover.product-tour-popover .driver-popover-description) {
		font-size: 14px;
		line-height: 1.6;
		color: #555;
	}

	:global(.driver-popover.product-tour-popover .driver-popover-progress-text) {
		font-size: 12px;
		color: #7f8c8d;
		font-weight: 600;
	}

	:global(.driver-popover.product-tour-popover .driver-popover-next-btn) {
		background: #4285f4;
		color: white;
		border: none;
		padding: 8px 16px;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	:global(.driver-popover.product-tour-popover .driver-popover-next-btn:hover) {
		background: #3c78d8;
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(66, 133, 244, 0.3);
	}

	:global(.driver-popover.product-tour-popover .driver-popover-prev-btn) {
		background: #e0e0e0;
		color: #555;
		border: none;
		padding: 8px 16px;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	:global(.driver-popover.product-tour-popover .driver-popover-prev-btn:hover) {
		background: #d0d0d0;
	}

	:global(.driver-popover.product-tour-popover .driver-popover-close-btn) {
		color: #7f8c8d;
		font-size: 24px;
		font-weight: 400;
	}

	:global(.driver-popover.product-tour-popover .driver-popover-close-btn:hover) {
		color: #2c3e50;
	}

	:global(.driver-popover-arrow-side-left.driver-popover-arrow) {
		border-right-color: white;
	}

	:global(.driver-popover-arrow-side-right.driver-popover-arrow) {
		border-left-color: white;
	}

	:global(.driver-popover-arrow-side-top.driver-popover-arrow) {
		border-bottom-color: white;
	}

	:global(.driver-popover-arrow-side-bottom.driver-popover-arrow) {
		border-top-color: white;
	}
</style>
