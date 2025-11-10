import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure LOCAL-ONLY notification behavior (Expo Go SDK 53+ compatible)
// Questo evita completamente le funzionalità push rimosse da Expo Go
if (Platform.OS !== 'web') {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,    // Mostra banner in alto (locale)
        shouldShowList: true,      // Mostra nella lista notifiche (locale)
        shouldPlaySound: true,     // Riproduci suono (locale)
        shouldSetBadge: false,     // Disabilitato per Expo Go SDK 53+
      }),
    });
    console.log('Local notification handler configured successfully');
  } catch (error) {
    console.log('Notification handler setup failed, using basic local notifications');
  }
}

export class NotificationService {
  // Wrapper sicuro per Expo Go - esegue solo se le notifiche sono disponibili
  static async _safeNotificationCall(fn) {
    if (Platform.OS === 'web') return null;
    
    try {
      return await fn();
    } catch (error) {
      console.log('Notification call failed (Expo Go limitation):', error.message);
      return null;
    }
  }

  // Test per verificare che le notifiche locali funzionino (Expo Go compatible)
  static async testLocalNotification() {
    return await this._safeNotificationCall(async () => {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: '✅ Test Notifica Locale',
          body: 'Le notifiche locali funzionano correttamente!',
          data: { type: 'test' },
          sound: 'default',
        },
        trigger: {
          seconds: 1, // Notifica tra 1 secondo
        },
      });
      console.log('Test notification scheduled:', identifier);
      return identifier;
    });
  }

  static async requestPermission() {
    // Skip notifications on web platform
    if (Platform.OS === 'web') {
      console.log('Local notifications not supported on web');
      return false;
    }

    // EXPO GO HACK: Non richiedere permessi, usa solo notifiche locali programmate
    try {
      console.log('Using LOCAL ONLY notifications (Expo Go compatible)');
      // Per Expo Go, assumiamo sempre che le notifiche locali siano disponibili
      // Non chiamiamo requestPermissionsAsync per evitare errori push
      return true;
    } catch (error) {
      console.log('Local notifications fallback');
      return true;
    }
  }

  static async scheduleTaskReminder(task, hoursBeforeDefault = 24) {
    if (Platform.OS === 'web' || !task.dueDate) return null;

    return await this._safeNotificationCall(async () => {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) return null;
      const dueDate = new Date(task.dueDate);
      const now = new Date();
      
      // Calcola quando programmare il promemoria
      let reminderTime;
      const timeDiff = dueDate.getTime() - now.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      
      console.log(`DEBUG: Task "${task.title}" scade il ${dueDate.toLocaleString('it-IT')}`);
      console.log(`DEBUG: Ora attuale: ${now.toLocaleString('it-IT')}`);
      
      const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutesDiff = Math.floor(timeDiff / (1000 * 60));
      
      console.log(`DEBUG: Differenza: ${daysDiff} giorni, ${hoursDiff} ore, ${minutesDiff} minuti`);
      
      // La data di scadenza ora include sempre un orario preciso dal form
      
      if (hoursDiff > 168) { // Più di una settimana (7*24 ore)
        // Se scade tra più di 7 giorni, ricorda 1 settimana prima
        reminderTime = new Date(dueDate.getTime() - (7 * 24 * 60 * 60 * 1000));
      } else if (hoursDiff > 48) { // Più di 2 giorni
        // Se scade tra 2-7 giorni, ricorda 24 ore prima
        reminderTime = new Date(dueDate.getTime() - (24 * 60 * 60 * 1000));
      } else if (hoursDiff > 24) { // Domani
        // Se scade domani, ricorda 12 ore prima
        reminderTime = new Date(dueDate.getTime() - (12 * 60 * 60 * 1000));
      } else if (hoursDiff > 4) { // Più di 4 ore
        // Se scade tra 4-24 ore, ricorda 2 ore prima
        reminderTime = new Date(dueDate.getTime() - (2 * 60 * 60 * 1000));
      } else if (hoursDiff > 2) { // Più di 2 ore
        // Se scade tra 2-4 ore, ricorda 1 ora prima
        reminderTime = new Date(dueDate.getTime() - (60 * 60 * 1000));
      } else if (minutesDiff > 30) { // Più di 30 minuti
        // Se scade tra 30 minuti e 2 ore, ricorda 15 minuti prima
        reminderTime = new Date(dueDate.getTime() - (15 * 60 * 1000));
      } else if (minutesDiff > 10) { // Più di 10 minuti
        // Se scade tra 10-30 minuti, ricorda 5 minuti prima
        reminderTime = new Date(dueDate.getTime() - (5 * 60 * 1000));
      } else if (minutesDiff > 0) { // Scade a breve
        // Se scade tra 1-10 minuti, ricorda tra 1 minuto
        reminderTime = new Date(now.getTime() + (60 * 1000)); // +1 minuto
        console.log('DEBUG: Scadenza imminente, promemoria tra 1 minuto');
      } else {
        // Se scade nel passato, non programmare
        return null;
      }
      
      // Non programmare se il tempo del promemoria è nel passato
      if (reminderTime <= now) return null;

      // Calcola il messaggio in base a quando scade (include ora precisa)
      let message;
      const dueDateString = dueDate.toLocaleDateString('it-IT');
      const dueTimeString = dueDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
      
      if (hoursDiff > 24) {
        message = `"${task.title}" scade il ${dueDateString} alle ${dueTimeString}`;
      } else if (hoursDiff > 2) {
        message = `"${task.title}" scade oggi alle ${dueTimeString}`;
      } else if (minutesDiff > 60) {
        const hoursLeft = Math.ceil(hoursDiff);
        message = `"${task.title}" scade tra ${hoursLeft} ${hoursLeft === 1 ? 'ora' : 'ore'} (${dueTimeString})`;
      } else if (minutesDiff > 0) {
        message = `"${task.title}" scade tra ${minutesDiff} minuti (${dueTimeString})`;
      } else {
        message = `"${task.title}" scade ORA!`;
      }

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Promemoria Attività',
          body: message,
          data: { taskId: task.id, type: 'reminder' },
          sound: 'default', // Use default sound for better compatibility
        },
        trigger: {
          date: reminderTime,
        },
      });

      console.log(`Promemoria programmato per: ${reminderTime.toLocaleString('it-IT')}`);
      return identifier;
    });
  }

  static async scheduleTaskOverdue(task) {
    if (Platform.OS === 'web' || !task.dueDate) return null;

    return await this._safeNotificationCall(async () => {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) return null;
      const dueDate = new Date(task.dueDate);
      const now = new Date();
      
      const timeDiff = dueDate.getTime() - now.getTime();
      const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
      
      // Solo per task che scadono nelle prossime 12 ore
      if (hoursDiff > 12 || hoursDiff < 0) {
        console.log(`Task scade tra ${hoursDiff} ore, no notifica "scade oggi"`);
        return null;
      }
      
      // Programma una notifica per il mattino (9:00) del giorno di scadenza
      // ma solo se mancano ancora almeno 2 ore alla scadenza
      let overdueTime;
      const taskDate = new Date(dueDate);
      const morningTime = new Date(taskDate);
      morningTime.setHours(9, 0, 0, 0);
      
      if (hoursDiff > 2 && now < morningTime) {
        // Se è ancora prima delle 9:00 e mancano più di 2 ore, programma per le 9:00
        overdueTime = morningTime;
      } else {
        // Altrimenti programma una notifica immediata (tra 1 minuto)
        overdueTime = new Date(now.getTime() + (60 * 1000)); // +1 minuto
        console.log('Scadenza imminente, notifica immediata');
      }

      const dueTimeString = dueDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
      
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Attività in Scadenza Oggi',
          body: `Non dimenticare: "${task.title}" scade alle ${dueTimeString}!`,
          data: { taskId: task.id, type: 'dueToday' },
          sound: 'default', // Use default sound for better compatibility
        },
        trigger: {
          date: overdueTime,
        },
      });

      console.log(`Notifica scadenza programmata per: ${overdueTime.toLocaleString('it-IT')}`);
      return identifier;
    });
  }

  static async cancelTaskNotifications(taskId) {
    if (Platform.OS === 'web') return;
    
    return await this._safeNotificationCall(async () => {
      // Solo notifiche locali programmate - niente API push
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      const notificationsToCancel = scheduledNotifications
        .filter(notification => notification.content.data?.taskId === taskId)
        .map(notification => notification.identifier);

      await Promise.all(
        notificationsToCancel.map(id => Notifications.cancelScheduledNotificationAsync(id))
      );
      
      console.log(`Cancelled ${notificationsToCancel.length} local notifications for task ${taskId}`);
    });
  }

  static async scheduleDailyReminder() {
    if (Platform.OS === 'web') return null;
    
    return await this._safeNotificationCall(async () => {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) return null;

      // Schedule daily reminder at 9 AM
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌅 Buongiorno!',
          body: 'Controlla le tue attività per oggi',
          data: { type: 'daily' },
          sound: 'default', // Use default sound for better compatibility
        },
        trigger: {
          hour: 9,
          minute: 0,
          repeats: true,
        },
      });

      return identifier;
    });
  }

  static async getBadgeCount() {
    // Badge functionality disabled for Expo Go compatibility
    return 0;
  }

  static async setBadgeCount(count) {
    // Badge functionality disabled for Expo Go compatibility
    return;
  }

  static async clearBadge() {
    // Badge functionality disabled for Expo Go compatibility
    return;
  }

  static async clearAllTaskNotifications() {
    if (Platform.OS === 'web') return;
    
    return await this._safeNotificationCall(async () => {
      // Solo notifiche locali programmate - Expo Go SDK 53+ compatible
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

      console.log(`Cancelled ${taskNotifications.length} local task notifications`);
    });
  }
}