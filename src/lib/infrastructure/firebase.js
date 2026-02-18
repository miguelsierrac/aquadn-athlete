// src/lib/infrastructure/firebase.js
import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
		apiKey: "AIzaSyAt1EqOTzjAgPHtk4vF0tbxmHGv9dsuDdI",
		authDomain: "club-deportivo-aquadn.firebaseapp.com",
		projectId: "club-deportivo-aquadn",
		storageBucket: "club-deportivo-aquadn.firebasestorage.app",
		messagingSenderId: "106284365123",
		appId: "1:106284365123:web:7bcf14419f6a058d172bf6",
		measurementId: "G-0J0B082C0W"
	};

// Initialize Firebase
let app;
let analytics;
let messaging;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
  messaging = getMessaging(app);
}

export { app, analytics, messaging };
