export const NotificationService = {
  show(title: string, message: string, id?: string) {
    const notificationId = id || `cp-vault-notification-${Date.now()}`;
    if (chrome.notifications) {
      chrome.notifications.create(notificationId, {
        type: 'basic',
        iconUrl: chrome.runtime.getURL('src/assets/icon128.png'),
        title,
        message,
        priority: 1
      });
    } else {
      console.log(`[Notification Fallback] ${title}: ${message}`);
    }
  },

  showSuccess(problemName: string, platform: string) {
    this.show(
      'Solution Synced!',
      `Successfully pushed ${problemName} (${platform}) to GitHub.`
    );
  },

  showFailure(problemName: string, error: string) {
    this.show(
      'Sync Failed',
      `Could not sync ${problemName}. Error: ${error}. Queued for retry.`
    );
  },

  showAuthExpired() {
    this.show(
      'GitHub Session Expired',
      'Please sign in again to resume automatic code syncing.',
      'auth-expired'
    );
  }
};
