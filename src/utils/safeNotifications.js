import { Platform, Alert } from 'react-native';

// Safe notification service compatible with Expo Go (no expo-notifications)
export const SafeNotificationService = {
  async requestPermission() {
    // In Expo Go, we simulate notifications with alerts
    console.log('📱 Notifiche simulate - Expo Go compatibility mode');
    return true; // Always return true for demo
  },

  async scheduleTaskReminder(task) {
    // Simulate notification scheduling for Expo Go
    console.log(`🔔 Reminder simulato per: "${task.title}"`);
    if (Platform.OS !== 'web') {
      // Show alert instead of actual notification
      setTimeout(() => {
        Alert.alert(
          '🔔 Promemoria Task',
          `Hai un task in scadenza: "${task.title}"`,
          [{ text: 'OK', style: 'default' }]
        );
      }, 3000); // Simulate a 3-second delay
    }
    return `reminder_${task.id}`;
  },

  async scheduleTaskOverdue(task) {
    // Simulate overdue notification for Expo Go
    console.log(`⚠️ Overdue simulato per: "${task.title}"`);
    if (Platform.OS !== 'web') {
      setTimeout(() => {
        Alert.alert(
          '⚠️ Task Scaduto',
          `Il task "${task.title}" è scaduto!`,
          [{ text: 'OK', style: 'destructive' }]
        );
      }, 5000); // Simulate a 5-second delay
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