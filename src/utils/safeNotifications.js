import { Platform, Alert } from 'react-native';

// Safe notification service with web notifications support
export const SafeNotificationService = {
  async requestPermission() {
    if (Platform.OS === 'web') {
      // Use web notifications on web platform
      try {
        const { WebNotificationService } = await import('./webNotifications');
        return await WebNotificationService.requestPermission();
      } catch (error) {
        console.log('Web notifications not available, using alerts');
        return true;
      }
    }
    console.log('📱 Notifiche simulate - Mobile compatibility mode');
    return true; // Always return true for mobile demo
  },

  async scheduleTaskReminder(task) {
    console.log(`🔔 Reminder per: "${task.title}"`);
    
    if (Platform.OS === 'web') {
      // Use web notifications on web platform
      try {
        const { WebNotificationService } = await import('./webNotifications');
        setTimeout(() => {
          WebNotificationService.scheduleTaskReminder(task);
        }, 3000); // 3 second delay
      } catch (error) {
        console.log('Fallback to alert for web');
        setTimeout(() => {
          alert(`🔔 Promemoria: "${task.title}"`);
        }, 3000);
      }
    } else {
      // Show alert for mobile
      setTimeout(() => {
        Alert.alert(
          '🔔 Promemoria Task',
          `Hai un task in scadenza: "${task.title}"`,
          [{ text: 'OK', style: 'default' }]
        );
      }, 3000);
    }
    return `reminder_${task.id}`;
  },

  async scheduleTaskOverdue(task) {
    console.log(`⚠️ Overdue per: "${task.title}"`);
    
    if (Platform.OS === 'web') {
      // Use web notifications on web platform
      try {
        const { WebNotificationService } = await import('./webNotifications');
        setTimeout(() => {
          WebNotificationService.scheduleTaskOverdue(task);
        }, 5000); // 5 second delay
      } catch (error) {
        console.log('Fallback to alert for web');
        setTimeout(() => {
          alert(`⚠️ Task Scaduto: "${task.title}"`);
        }, 5000);
      }
    } else {
      setTimeout(() => {
        Alert.alert(
          '⚠️ Task Scaduto',
          `Il task "${task.title}" è scaduto!`,
          [{ text: 'OK', style: 'destructive' }]
        );
      }, 5000);
    }
    return `overdue_${task.id}`;
  },

  async cancelTaskNotifications(taskId) {
    // Simulate notification cancellation for Expo Go
    console.log(`🚫 Notifiche cancellate per task: ${taskId}`);
    return true;
  },

  async scheduleDailyReminder() {
    // Simulate daily reminder scheduling for Expo Go  
    console.log('📅 Reminder giornaliero simulato');
    if (Platform.OS !== 'web') {
      Alert.alert(
        '📅 Reminder Attivato',
        'Reminder giornaliero configurato (modalità demo)',
        [{ text: 'OK', style: 'default' }]
      );
    }
    return 'daily_reminder_simulated';
  },

  async getBadgeCount() {
    // Simulate badge count for Expo Go
    return 0; // Always return 0 in simulation mode
  },

  async setBadgeCount(count) {
    // Simulate badge setting for Expo Go
    console.log(`📱 Badge count simulato: ${count}`);
    return true;
  },

  async clearBadge() {
    return await this.setBadgeCount(0);
  },

  async clearAllTaskNotifications() {
    // Simulate clearing all notifications for Expo Go
    console.log('🧹 Tutte le notifiche simulate cancellate');
    return true;
  },
};

export default SafeNotificationService;