import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  static async requestPermission() {
    // Skip notifications on web platform
    if (Platform.OS === 'web') {
      console.log('Push notifications not supported on web');
      return false;
    }

    if (!Device.isDevice) {
      console.log('Must use physical device for push notifications');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return false;
    }

    return true;
  }

  static async scheduleTaskReminder(task, hoursBeforeDefault = 24) {
    if (Platform.OS === 'web' || !task.dueDate) return null;

    const hasPermission = await this.requestPermission();
    if (!hasPermission) return null;

    try {
      const dueDate = new Date(task.dueDate);
      const now = new Date();
      
      // Calcola quando programmare il promemoria
      let reminderTime;
      const timeDiff = dueDate.getTime() - now.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      
      console.log(`DEBUG: Task "${task.title}" scade il ${dueDate.toLocaleString('it-IT')}`);
      console.log(`DEBUG: Ora attuale: ${now.toLocaleString('it-IT')}`);
      console.log(`DEBUG: Differenza giorni: ${daysDiff}, Differenza ore: ${Math.floor(timeDiff / (1000 * 60 * 60))}`);
      
      // Se la data di scadenza non ha orario impostato, assumiamo fine giornata (23:59)
      if (dueDate.getHours() === 0 && dueDate.getMinutes() === 0 && dueDate.getSeconds() === 0) {
        dueDate.setHours(23, 59, 59, 999);
        console.log(`DEBUG: Aggiustato orario scadenza a: ${dueDate.toLocaleString('it-IT')}`);
      }
      
      if (daysDiff > 7) {
        // Se scade tra più di 7 giorni, ricorda 1 settimana prima
        reminderTime = new Date(dueDate.getTime() - (7 * 24 * 60 * 60 * 1000));
      } else if (daysDiff > 1) {
        // Se scade tra 2-7 giorni, ricorda 1 giorno prima
        reminderTime = new Date(dueDate.getTime() - (24 * 60 * 60 * 1000));
      } else if (daysDiff === 1) {
        // Se scade domani, ricorda questa sera alle 18:00
        reminderTime = new Date();
        reminderTime.setHours(18, 0, 0, 0);
        if (reminderTime <= now) reminderTime.setDate(reminderTime.getDate() + 1);
      } else if (daysDiff === 0 || (timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000)) {
        // Se scade oggi o entro 24 ore, ricorda tra 1 ora (se possibile)
        console.log('DEBUG: Task scade oggi, calcolo promemoria...');
        reminderTime = new Date(now.getTime() + (60 * 60 * 1000)); // +1 ora

        // Se la scadenza è molto vicina (meno di 2 ore), ricorda tra 30 minuti
        if (dueDate.getTime() - now.getTime() < (2 * 60 * 60 * 1000)) {
          reminderTime = new Date(now.getTime() + (30 * 60 * 1000)); // +30 minuti
        }

        // Se la scadenza è tra meno di 30 minuti, ricorda tra 10 minuti
        if (dueDate.getTime() - now.getTime() < (30 * 60 * 1000)) {
          reminderTime = new Date(now.getTime() + (10 * 60 * 1000)); // +10 minuti
        }

        // Se la scadenza è tra meno di 15 minuti, ricorda tra 5 minuti (minimo garantito)
        if (dueDate.getTime() - now.getTime() < (15 * 60 * 1000)) {
          reminderTime = new Date(now.getTime() + (5 * 60 * 1000)); // +5 minuti
          console.log('DEBUG: Scadenza imminente, promemoria tra 5 minuti');
        }
      } else {
        // Se scade nel passato, non programmare
        return null;
      }
      
      // Non programmare se il tempo del promemoria è nel passato
      if (reminderTime <= now) return null;

      // Calcola il messaggio in base a quando scade
      let message;
      if (daysDiff > 1) {
        message = `"${task.title}" scade il ${dueDate.toLocaleDateString('it-IT')}`;
      } else if (daysDiff === 1) {
        message = `"${task.title}" scade domani!`;
      } else {
        const hoursLeft = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));
        if (hoursLeft > 1) {
          message = `"${task.title}" scade tra circa ${hoursLeft} ore!`;
        } else {
          const minutesLeft = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60));
          message = `"${task.title}" scade tra ${minutesLeft} minuti!`;
        }
      }

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Promemoria Attività',
          body: message,
          data: { taskId: task.id, type: 'reminder' },
          sound: true,
        },
        trigger: {
          date: reminderTime,
        },
      });

      console.log(`Promemoria programmato per: ${reminderTime.toLocaleString('it-IT')}`);
      return identifier;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  static async scheduleTaskOverdue(task) {
    if (Platform.OS === 'web' || !task.dueDate) return null;

    const hasPermission = await this.requestPermission();
    if (!hasPermission) return null;

    try {
      const dueDate = new Date(task.dueDate);
      const now = new Date();
      
      // Calcola i giorni di differenza
      const timeDiff = dueDate.getTime() - now.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      
      // SOLO per task che scadono oggi programma la notifica delle 9:00
      if (daysDiff !== 0) {
        console.log(`Task scade tra ${daysDiff} giorni, no notifica "scade oggi"`);
        return null;
      }
      
      // Non programmare notifiche di scadenza per date nel passato
      if (dueDate <= now) {
        console.log('Task già scaduta, non programmo notifica');
        return null;
      }
      
      // Programma per le 9:00 del giorno di scadenza (solo se è oggi)
      let overdueTime = new Date(dueDate);
      overdueTime.setHours(9, 0, 0, 0);

      // Se sono già passate le 9:00 di oggi, programma una notifica immediata (tra 2 minuti)
      if (overdueTime <= now) {
        console.log('Sono già passate le 9:00 di oggi, programmo notifica immediata');
        overdueTime = new Date(now.getTime() + (2 * 60 * 1000)); // +2 minuti
      }

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: '� Attività in Scadenza Oggi',
          body: `Non dimenticare: "${task.title}" scade oggi!`,
          data: { taskId: task.id, type: 'dueToday' },
          sound: true,
        },
        trigger: {
          date: overdueTime,
        },
      });

      console.log(`Notifica scadenza programmata per: ${overdueTime.toLocaleString('it-IT')}`);
      return identifier;
    } catch (error) {
      console.error('Error scheduling overdue notification:', error);
      return null;
    }
  }

  static async cancelTaskNotifications(taskId) {
    if (Platform.OS === 'web') return;
    
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      const notificationsToCancel = scheduledNotifications
        .filter(notification => notification.content.data?.taskId === taskId)
        .map(notification => notification.identifier);

      await Promise.all(
        notificationsToCancel.map(id => Notifications.cancelScheduledNotificationAsync(id))
      );
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }

  static async scheduleDailyReminder() {
    if (Platform.OS === 'web') return null;
    
    const hasPermission = await this.requestPermission();
    if (!hasPermission) return null;

    try {
      // Schedule daily reminder at 9 AM
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌅 Buongiorno!',
          body: 'Controlla le tue attività per oggi',
          data: { type: 'daily' },
        },
        trigger: {
          hour: 9,
          minute: 0,
          repeats: true,
        },
      });

      return identifier;
    } catch (error) {
      console.error('Error scheduling daily reminder:', error);
      return null;
    }
  }

  static async getBadgeCount() {
    if (Platform.OS === 'web') return 0;
    
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      return 0;
    }
  }

  static async setBadgeCount(count) {
    if (Platform.OS === 'web') return;
    
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  static async clearBadge() {
    await this.setBadgeCount(0);
  }

  static async clearAllTaskNotifications() {
    if (Platform.OS === 'web') return;
    
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      // Cancella solo le notifiche dei task (non quella giornaliera)
      const taskNotifications = scheduledNotifications
        .filter(notification => 
          notification.content.data?.taskId || 
          notification.content.data?.type === 'reminder' ||
          notification.content.data?.type === 'dueToday'
        )
        .map(notification => notification.identifier);

      await Promise.all(
        taskNotifications.map(id => Notifications.cancelScheduledNotificationAsync(id))
      );

      console.log(`Cancellate ${taskNotifications.length} notifiche task esistenti`);
    } catch (error) {
      console.error('Error clearing task notifications:', error);
    }
  }
}