import { Platform } from 'react-native';

// Safe notification service that doesn't import expo-notifications on web
export const SafeNotificationService = {
  async requestPermission() {
    if (Platform.OS === 'web') return false;
    
    try {
      const { NotificationService } = await import('./notifications');
      return await NotificationService.requestPermission();
    } catch (error) {
      console.warn('Notifications not available:', error);
      return false;
    }
  },

  async scheduleTaskReminder(task) {
    if (Platform.OS === 'web') return null;
    
    try {
      const { NotificationService } = await import('./notifications');
      return await NotificationService.scheduleTaskReminder(task);
    } catch (error) {
      console.warn('Task reminder not scheduled:', error);
      return null;
    }
  },

  async scheduleTaskOverdue(task) {
    if (Platform.OS === 'web') return null;
    
    try {
      const { NotificationService } = await import('./notifications');
      return await NotificationService.scheduleTaskOverdue(task);
    } catch (error) {
      console.warn('Overdue notification not scheduled:', error);
      return null;
    }
  },

  async cancelTaskNotifications(taskId) {
    if (Platform.OS === 'web') return;
    
    try {
      const { NotificationService } = await import('./notifications');
      return await NotificationService.cancelTaskNotifications(taskId);
    } catch (error) {
      console.warn('Notifications not canceled:', error);
    }
  },

  async scheduleDailyReminder() {
    if (Platform.OS === 'web') return null;
    
    try {
      const { NotificationService } = await import('./notifications');
      return await NotificationService.scheduleDailyReminder();
    } catch (error) {
      console.warn('Daily reminder not scheduled:', error);
      return null;
    }
  },

  async getBadgeCount() {
    if (Platform.OS === 'web') return 0;
    
    try {
      const { NotificationService } = await import('./notifications');
      return await NotificationService.getBadgeCount();
    } catch (error) {
      return 0;
    }
  },

  async setBadgeCount(count) {
    if (Platform.OS === 'web') return;
    
    try {
      const { NotificationService } = await import('./notifications');
      return await NotificationService.setBadgeCount(count);
    } catch (error) {
      console.warn('Badge count not set:', error);
    }
  },

  async clearBadge() {
    return await this.setBadgeCount(0);
  },

  async clearAllTaskNotifications() {
    if (Platform.OS === 'web') return;
    
    try {
      const { NotificationService } = await import('./notifications');
      return await NotificationService.clearAllTaskNotifications();
    } catch (error) {
      console.warn('Could not clear notifications:', error);
    }
  },

  async testLocalNotification() {
    if (Platform.OS === 'web') return null;
    
    try {
      const { NotificationService } = await import('./notifications');
      return await NotificationService.testLocalNotification();
    } catch (error) {
      console.warn('Test notification failed:', error);
      return null;
    }
  },
};

export default SafeNotificationService;