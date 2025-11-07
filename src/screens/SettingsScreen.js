import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { ThemeSwitcher, Button } from '../components';
import { SafeNotificationService } from '../utils/safeNotifications';
import { Typography, BorderRadius, Spacing } from '../styles/theme';

export const SettingsScreen = () => {
  const { theme } = useTheme();
  const { tasks, deleteTask } = useTasks();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);

  const toggleNotifications = async (value) => {
    if (value) {
      const hasPermission = await SafeNotificationService.requestPermission();
      if (hasPermission) {
        setNotificationsEnabled(true);
      } else {
        Alert.alert(
          'Permessi Necessari',
          'Abilita le notifiche nelle impostazioni del dispositivo per ricevere promemoria.'
        );
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const toggleDailyReminder = async (value) => {
    setDailyReminder(value);
    if (value) {
      await SafeNotificationService.scheduleDailyReminder();
    }
  };

  const exportData = () => {
    Alert.alert(
      'Export Dati',
      'Funzionalità in arrivo! I tuoi dati verranno esportati in formato JSON.',
      [{ text: 'OK' }]
    );
  };

  const importData = () => {
    Alert.alert(
      'Import Dati',
      'Funzionalità in arrivo! Potrai importare dati da backup precedenti.',
      [{ text: 'OK' }]
    );
  };

  const clearAllData = () => {
    const confirmClear = async () => {
      // Elimina tutte le task una per una per triggerare anche la cancellazione delle notifiche
      const taskIds = tasks.map(task => task.id);
      
      for (const taskId of taskIds) {
        await deleteTask(taskId);
      }
      
      // Cancella anche tutte le notifiche rimanenti per sicurezza
      if (Platform.OS !== 'web') {
        await SafeNotificationService.clearAllTaskNotifications();
      }
      
      Alert.alert('Successo', 'Tutti i dati sono stati eliminati.');
    };
    
    // Su web, usa confirm(), su mobile usa Alert.alert()
    if (Platform.OS === 'web') {
      if (window.confirm('Sei sicuro? Questa azione eliminerà TUTTE le attività e non può essere annullata.')) {
        confirmClear();
      }
    } else {
      Alert.alert(
        'Elimina Tutti i Dati',
        'Sei sicuro? Questa azione non può essere annullata.',
        [
          { text: 'Annulla', style: 'cancel' },
          { 
            text: 'Elimina', 
            style: 'destructive',
            onPress: confirmClear
          }
        ]
      );
    }
  };

  const SettingRow = ({ icon, title, subtitle, rightComponent, onPress }) => (
    <View style={[styles.settingRow, { borderBottomColor: theme.colors.border }]}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={24} color={theme.colors.primary} />
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightComponent}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={theme.colors.backgroundGradient}
        style={styles.header}
      >
        <Text style={[styles.title, { color: theme.colors.text }]}>
          ⚙️ Impostazioni
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Appearance Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            🎨 Aspetto
          </Text>
          
          <SettingRow
            icon="color-palette"
            title="Tema"
            subtitle="Cambia l'aspetto dell'app"
            rightComponent={<ThemeSwitcher />}
          />
        </View>

        {/* Notifications Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            🔔 Notifiche
          </Text>
          
          <SettingRow
            icon="notifications"
            title="Notifiche"
            subtitle="Ricevi promemoria per le scadenze"
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              />
            }
          />

          <SettingRow
            icon="alarm"
            title="Promemoria Giornaliero"
            subtitle="Notifica quotidiana alle 9:00"
            rightComponent={
              <Switch
                value={dailyReminder}
                onValueChange={toggleDailyReminder}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                disabled={!notificationsEnabled}
              />
            }
          />

          <SettingRow
            icon="volume-high"
            title="Suoni"
            subtitle="Abilita feedback audio"
            rightComponent={
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              />
            }
          />

          <SettingRow
            icon="phone-portrait"
            title="Vibrazione"
            subtitle="Feedback tattile"
            rightComponent={
              <Switch
                value={hapticEnabled}
                onValueChange={setHapticEnabled}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              />
            }
          />
        </View>

        {/* Data Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            💾 Dati
          </Text>
          
          <SettingRow
            icon="download"
            title="Esporta Dati"
            subtitle="Salva backup delle tue attività"
            rightComponent={
              <Button
                title="Esporta"
                onPress={exportData}
                variant="outline"
                size="small"
              />
            }
          />

          <SettingRow
            icon="cloud-upload"
            title="Importa Dati"
            subtitle="Ripristina da backup"
            rightComponent={
              <Button
                title="Importa"
                onPress={importData}
                variant="outline"
                size="small"
              />
            }
          />
        </View>

        {/* Danger Zone */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.danger }]}>
            ⚠️ Zona Pericolosa
          </Text>
          
          <SettingRow
            icon="trash"
            title="Elimina Tutti i Dati"
            subtitle="Rimuovi tutte le attività permanentemente"
            rightComponent={
              <Button
                title="Elimina"
                onPress={clearAllData}
                variant="danger"
                size="small"
              />
            }
          />
        </View>

        {/* App Info */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            ℹ️ Informazioni App
          </Text>
          
          <SettingRow
            icon="information-circle"
            title="Versione"
            subtitle="Task Manager Pro v1.0.0"
          />

          <SettingRow
            icon="person"
            title="Sviluppatore"
            subtitle="@gianfrizio"
          />

          <SettingRow
            icon="star"
            title="Valuta l'App"
            subtitle="Lascia una recensione"
            rightComponent={
              <Button
                title="Valuta"
                onPress={() => Alert.alert('Grazie!', 'Funzionalità in arrivo')}
                variant="outline"
                size="small"
              />
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  title: {
    ...Typography.h1,
  },
  content: {
    flex: 1,
  },
  section: {
    margin: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  sectionTitle: {
    ...Typography.h3,
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  settingTitle: {
    ...Typography.body,
    fontWeight: '600',
  },
  settingSubtitle: {
    ...Typography.caption,
    marginTop: 2,
  },
});