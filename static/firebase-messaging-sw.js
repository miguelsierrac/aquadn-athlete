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

messaging.onBackgroundMessage((payload) => {
    console.log(
        '[firebase-messaging-sw.js] Received background message ',
        payload
    );

    const dbPromise = indexedDB.open('aquadn-athlete', 1);

    dbPromise.onsuccess = (event) => {
        try {
            const db = event.target.result;
            const transaction = db.transaction('notifications', 'readwrite');
            const store = transaction.objectStore('notifications');
            store.add(payload);
        } catch (error) {
            console.error('Error adding notification to DB:', error);
        }
    };

    if (payload.notification) {
        console.log('Notification payload received:', payload.notification);
        return;
    }
    
    if (!payload.data || !payload.data.title || !payload.data.body) {
        console.error('Invalid payload data:', payload.data);
        return;
    }

    // Customize notification here
    const notificationTitle = payload.data.title;
    const notificationOptions = {
        body: payload.data.body,
        icon: '/aquadn-athlete/logo_512.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});