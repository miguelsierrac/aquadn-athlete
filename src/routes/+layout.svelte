<script>
	import '../app.css';
	import Provider from '$lib/Provider';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { browser } from '$app/environment';
	import { onMount, setContext } from 'svelte';
	import { athlete, lastSync, token, lastMeasurement, notifications } from '$lib/stores.js';
	import { get } from 'svelte/store';
	import { getToken, onMessage } from 'firebase/messaging';
	import { messaging } from '$lib/infrastructure/firebase.js';
	import { SvelteToast, toast } from '@zerodevx/svelte-toast';
	import PushNotificationComponent from '$lib/components/PushNotification.svelte';
	import CelebrationPopup from '$lib/components/CelebrationPopup.svelte';
	import { openDB } from 'idb';



	const provider = Provider;

	const MAX_NOTIFICATIONS = 50;
	const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

	setContext('provider', provider);

	const redirect = async (destination) => {
		if (!browser) {
			return;
		}
		await goto(base + destination);
	};

	setContext('redirect', redirect);

	setContext('athlete', athlete);
	setContext('lastSync', lastSync);
	setContext('token', token);
	setContext('lastMeasurement', lastMeasurement);

	const isNotificationSupported = () =>
		'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;

	async function requestNotificationPermission() {
		console.log('Requesting permission...');
		let permission = await Notification.requestPermission();

		return permission === 'granted';
	}

	async function setupNotifications() {
		if (Notification.permission === 'granted') {
			console.log('Notification permission granted.');

			navigator.serviceWorker
				.register(base + '/firebase-messaging-sw.js')
				.then((registration) => {
					console.log('Messaging get token...');
					getToken(messaging, {
						serviceWorkerRegistration: registration,
						vapidKey:
							'BIxDq1HszvHFhbBARVJcPokYfOFQo74ZAzq2LZCBVn2K740j0TnvCJMBAgHweAGIG5bPlJTfHcE9cdr_du4Gqc4'
					})
						.then((currentToken) => {
							if (currentToken) {
								// Send the token to your server and update the UI if necessary
								// ...
								console.log('Token available: ', currentToken);
								$token = currentToken;
							} else {
								// Show permission request UI
								console.log('No registration token available. Request permission to generate one.');
							}
						})
						.catch((err) => {
							console.log('An error occurred while retrieving token. ', err);
						});
				})
				.catch((error) => {
					console.error('Service Worker registration failed: ', error);
				});

			onMessage(messaging, (payload) => {
				console.log('Message received. ', payload);

				if (!isNotificationSupported()) {
					// Notifications aren't supported
					return;
				}

				showNotification(payload);
			});
		} else {
			console.log('Unable to get permission to notify.');
		}
	}

	async function retrieveNotifications() {
		const db = await openDB('aquadn-athlete', 1, {
			upgrade(db) {
				db.createObjectStore('notifications', {
					keyPath: 'id',
					autoIncrement: true
				});
			}
		});

		const items = await db.getAll('notifications');
		await db.clear('notifications');

		items.forEach((item) => {
			// Adapt the minimal IDB format { title, body } to what showNotification expects
			const payload = item.notification
				? item
				: { notification: { title: item.title, body: item.body } };
			showNotification(payload, true);
		});
	}

	function showNotification(payload, fromBackground = false) {
		const notificationTitle = payload.notification.title;
		const notificationOptions = {
			body: payload.notification.body,
			icon: '/logo_512.png'
		};

		// Add to persistent notification history (max 50, max age 30 days)
		// Deduplicate: skip if same title+body arrived within the last 10 seconds
		const existing = get(notifications);
		const isDuplicate = existing.some(
			(n) => n.title === notificationTitle && n.body === notificationOptions.body && Date.now() - n.timestamp < 10_000
		);
		if (isDuplicate) return;

		const cutoff = Date.now() - TTL_MS;
		const updated = [
			{
				id: Date.now() + Math.random(),
				title: notificationTitle,
				body: notificationOptions.body,
				timestamp: Date.now(),
				read: false
			},
			...get(notifications).filter((n) => n.timestamp > cutoff)
		].slice(0, MAX_NOTIFICATIONS);
		notifications.set(updated);

		if (!fromBackground) {
			try {
				var notification = new Notification(notificationTitle, notificationOptions);
				notification.onclick = () => {
					notification.close();
					window.parent.focus();
				};
			} catch (error) {
				console.log('Notification error: ', error);
			}
		}

		toast.push('<strong>' + notificationTitle + '</strong><br>' + notificationOptions.body, {
			initial: 0
		});
	}

	onMount(async () => {
		// Purge expired notifications on startup
		const cutoff = Date.now() - TTL_MS;
		notifications.set(get(notifications).filter((n) => n.timestamp > cutoff));

		retrieveNotifications();

		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				retrieveNotifications();
			}
		};
		document.addEventListener('visibilitychange', handleVisibilityChange);

		// Listen for messages posted by the SW via clients.postMessage() — works on iOS
		const handleSwMessage = (event) => {
			if (event.data?.type === 'PUSH_NOTIFICATION') {
				showNotification(event.data.payload, true);
			}
		};
		navigator.serviceWorker.addEventListener('message', handleSwMessage);

		// BroadcastChannel as secondary channel for browsers that support it
		let notifChannel = null;
		try {
			notifChannel = new BroadcastChannel('aquadn-notifications');
			notifChannel.onmessage = (event) => {
				showNotification(event.data, true);
			};
		} catch (e) {
			console.warn('BroadcastChannel not available:', e);
		}

		if (isNotificationSupported()) {
			if (Notification.permission === 'granted') {
				console.log('Notification permission already granted.');
				setupNotifications();
			} else {
				toast.push({
					component: {
						src: PushNotificationComponent,
						props: {
							title: 'Aceptar notificaciones',
							content: '¿Deseas recibir notificaciones de AQUADN?',
							confirmText: 'ACEPTAR',
							cancelText: 'CANCELAR',
							onConfirm: async () => {
								await requestNotificationPermission();
								setupNotifications();
							},
							onCancel: () => {
								console.log('User accepted notifications.');
							}
						},
						sendIdTo: 'toastId' // send toast id to `toastId` prop
					},
					dismissable: false,
					initial: 0
				});
			}
		} else {
			console.log('Notifications are not supported in this browser.');
		}

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			navigator.serviceWorker.removeEventListener('message', handleSwMessage);
			notifChannel?.close();
		};
	});
</script>

<slot />

<SvelteToast />

<SvelteToast target="critical-notifications" />

<CelebrationPopup />
