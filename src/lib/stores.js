import { writable } from 'svelte/store';
import { localStore } from '$lib/infrastructure/LocalStore.js';

export const athlete = localStore('ATHLETE');

export const lastSync = localStore('LAST_SYNC');

export const token = localStore('TOKEN');

export const lastMeasurement = localStore('LAST_MEASUREMENT');

export const popup = writable(null);

// Notification history – persisted across sessions, user-controlled
// Shape: { id, title, body, timestamp, read }
export const notifications = localStore('NOTIFICATIONS', []);
