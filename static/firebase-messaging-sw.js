// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
// Replace 10.13.2 with latest version of the Firebase JS SDK.
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
    apiKey: "AIzaSyAt1EqOTzjAgPHtk4vF0tbxmHGv9dsuDdI",
    authDomain: "club-deportivo-aquadn.firebaseapp.com",
    projectId: "club-deportivo-aquadn",
    storageBucket: "club-deportivo-aquadn.firebasestorage.app",
    messagingSenderId: "106284365123",
    appId: "1:106284365123:web:7bcf14419f6a058d172bf6",
    measurementId: "G-0J0B082C0W"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

// Wraps the IDB write in a Promise so the SW stays alive until it completes.
function saveToIDB(entry) {
	return new Promise((resolve, reject) => {
		const dbOpen = indexedDB.open('aquadn-athlete', 1);

		dbOpen.onupgradeneeded = (event) => {
			const db = event.target.result;
			if (!db.objectStoreNames.contains('notifications')) {
				db.createObjectStore('notifications', { keyPath: 'id', autoIncrement: true });
			}
		};

		dbOpen.onerror = (event) => reject(event.target.error);

		dbOpen.onsuccess = (event) => {
			const db = event.target.result;
			const tx = db.transaction('notifications', 'readwrite');
			tx.objectStore('notifications').add(entry);
			tx.oncomplete = resolve;
			tx.onerror = (e) => reject(e.target.error);
		};
	});
}

messaging.onBackgroundMessage((payload) => {
	console.log('[firebase-messaging-sw.js] Received background message ', payload);

	// Extract title/body regardless of whether they come in payload.notification or payload.data
	const title = payload.notification?.title ?? payload.data?.title ?? '';
	const body  = payload.notification?.body  ?? payload.data?.body  ?? '';

	// Store a minimal plain object — avoids structured-clone errors with Firebase objects
	const entry = { title, body, timestamp: Date.now() };

	// Return a Promise so Firebase keeps the SW alive until all async work is done
	return Promise.all([
		// 1. Persist to IDB (read when the app opens / comes back to foreground)
		saveToIDB(entry).catch((e) => console.error('IDB write failed:', e)),

		// 2. Post directly to any open window (works on iOS; no BroadcastChannel needed)
		self.clients
			.matchAll({ includeUncontrolled: true, type: 'window' })
			.then((clients) => {
				clients.forEach((client) =>
					client.postMessage({
						type: 'PUSH_NOTIFICATION',
						payload: { notification: { title, body } }
					})
				);
			})
	]).then(() => {
		// 3. Show system notification only for data-only messages
		//    (notification messages are shown automatically by the browser)
		if (!payload.notification && title) {
			return self.registration.showNotification(title, {
				body,
				icon: '/aquadn-athlete/logo_512.png'
			});
		}
	});
});
