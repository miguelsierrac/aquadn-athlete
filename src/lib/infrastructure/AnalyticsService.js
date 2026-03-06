// src/lib/infrastructure/AnalyticsService.js
import { analytics } from './firebase.js';
import { logEvent } from 'firebase/analytics';

/**
 * Tracks the viewing of the athlete's technical sheet.
 */
export function trackViewAthleteCard() {
  if (!analytics) return;
  logEvent(analytics, 'view_athlete_card');
}

/**
 * Tracks the appearance of the celebration popup.
 * @param {Array<object>} achievements - The list of achievements being celebrated.
 */
export function trackCelebrationPopup(achievements) {
  if (!analytics || !achievements || achievements.length === 0) return;

  const level_achievements = achievements.filter(a => a.type === 'level').map(a => a.name);
  const badge_achievements = achievements.filter(a => a.type === 'badge').map(a => a.name);

  logEvent(analytics, 'show_celebration_popup', {
    levels: level_achievements.join(','),
    badges: badge_achievements.join(','),
    achievement_count: achievements.length
  });
}

/**
 * Tracks when a user shares their progress.
 * @param {string} method - The method used for sharing (e.g., 'Web Share API', 'Download Fallback').
 * @param {string} source - The source from where the share action was initiated (e.g., 'Celebration Popup', 'Leaderboard').
 */
export function trackShare(method, source = 'Unknown') {
  if (!analytics) return;
  logEvent(analytics, 'share_progress', {
    method: method,
    source: source,
  });
}

/**
 * Tracks when the user views the leaderboard.
 */
export function trackViewLeaderboard() {
  if (!analytics) return;
  logEvent(analytics, 'view_leaderboard');
}

/**
 * Tracks when the user views their achievements/objectives popup.
 */
export function trackViewAchievements() {
  if (!analytics) return;
  logEvent(analytics, 'view_achievements');
}

/**
 * Tracks when a push notification is received by the app.
 * @param {string} title - The notification title.
 * @param {'foreground'|'background'|'app_open'} source - How the notification was received.
 */
export function trackNotificationReceived(title, source) {
  if (!analytics) return;
  logEvent(analytics, 'notification_received', {
    notification_title: title,
    source
  });
}

/**
 * Tracks when the user opens the notification history drawer.
 * @param {number} unreadCount - Number of unread notifications at open time.
 */
export function trackNotificationDrawerOpened(unreadCount) {
  if (!analytics) return;
  logEvent(analytics, 'notification_drawer_opened', {
    unread_count: unreadCount
  });
}

/**
 * Tracks when the user dismisses a single notification.
 */
export function trackNotificationDismissed() {
  if (!analytics) return;
  logEvent(analytics, 'notification_dismissed');
}

/**
 * Tracks when the user clears all notifications.
 * @param {number} count - How many notifications were cleared.
 */
export function trackNotificationClearedAll(count) {
  if (!analytics) return;
  logEvent(analytics, 'notification_cleared_all', {
    cleared_count: count
  });
}