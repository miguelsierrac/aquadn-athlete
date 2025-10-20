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
    apiKey: "AIzaSyCb7LzJc8dxo0QsudvR8OsXXf11wlmIj-A",
    authDomain: "aquadn-1acfb.firebaseapp.com",
    projectId: "aquadn-1acfb",
    storageBucket: "aquadn-1acfb.firebasestorage.app",
    messagingSenderId: "30267400091",
    appId: "1:30267400091:web:560c95e52f760f1f4e0b3e",
    measurementId: "G-PXX1RBTSEZ"
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