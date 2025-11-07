// Web Push Notifications Service
export const WebNotificationService = {
  async requestPermission() {
    if (!('Notification' in window)) {
      console.log('Browser non supporta le notifiche');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  async showNotification(title, options = {}) {
    const hasPermission = await this.requestPermission();
    
    if (hasPermission) {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    } else {
      console.log('Permesso notifiche negato');
      return null;
    }
  },

  async scheduleTaskReminder(task) {
    return this.showNotification('🔔 Promemoria Task', {
      body: `Hai un task in scadenza: "${task.title}"`,
      tag: `task-${task.id}`,
      icon: '/favicon.ico'
    });
  },

  async scheduleTaskOverdue(task) {
    return this.showNotification('⚠️ Task Scaduto', {
      body: `Il task "${task.title}" è scaduto!`,
      tag: `overdue-${task.id}`,
      icon: '/favicon.ico',
      requireInteraction: true
    });
  }
};