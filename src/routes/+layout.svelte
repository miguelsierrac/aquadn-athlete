<script>
	import '../app.css';
	import Provider from '$lib/Provider';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { browser } from '$app/environment';
	import { onMount, setContext } from 'svelte';
	import { athlete, lastSync, token } from '$lib/stores.js';
	import { initializeApp } from 'firebase/app';
	import { getAnalytics } from 'firebase/analytics';
	import { getMessaging, getToken, onMessage } from 'firebase/messaging';
	import { SvelteToast, toast } from '@zerodevx/svelte-toast';
	import PushNotificationComponent from '$lib/components/PushNotification.svelte';

	const firebaseConfig = {
		apiKey: '',
		authDomain: '',
		projectId: '',
		storageBucket: '',
		messagingSenderId: '',
		appId: '',
		measurementId: ''
	};

	// console.log('Initialize Firebase...');
	// Initialize Firebase
	// const app = initializeApp(firebaseConfig);
	// const analytics = getAnalytics(app);
	// const messaging = getMessaging(app);

	const provider = Provider;

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

				const notificationTitle = payload.notification.title;
				const notificationOptions = {
					body: payload.notification.body,
					icon: '/logo_512.png'
				};

				try {
					var notification = new Notification(notificationTitle, notificationOptions);
					notification.onclick = () => {
						notification.close();
						window.parent.focus();
					};
				} catch (error) {
					console.log('Notification error: ', error);
				}

				toast.push('<strong>' + notificationTitle + '</strong><br>' + notificationOptions.body, {
					initial: 0
				});
			});
		} else {
			console.log('Unable to get permission to notify.');
		}
	}

	onMount(async () => {
		if (!isNotificationSupported()) {
			console.log('Notifications are not supported in this browser.');
			return;
		}
		// if (Notification.permission === 'granted') {
		// 	console.log('Notification permission already granted.');
		// 	setupNotifications();
		// 	return;
		// }
		// toast.push({
		// 	component: {
		// 		src: PushNotificationComponent,
		// 		props: {
		// 			title: 'Aceptar notificaciones',
		// 			content: '¿Deseas recibir notificaciones de AQUADN?',
		// 			confirmText: 'ACEPTAR',
		// 			cancelText: 'CANCELAR',
		// 			onConfirm: async () => {
		// 				await requestNotificationPermission();
		// 				setupNotifications();
		// 			},
		// 			onCancel: () => {
		// 				console.log('User accepted notifications.');
		// 			}
		// 		},
		// 		sendIdTo: 'toastId' // send toast id to `toastId` prop
		// 	},
		// 	dismissable: false,
		// 	initial: 0
		// });
	});
</script>

<slot />

<SvelteToast />
