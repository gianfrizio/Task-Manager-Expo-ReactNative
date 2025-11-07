import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import { AddTaskForm } from '../components';
import { Colors, Typography, Spacing } from '../styles/theme';

// Stili statici
const staticStyles = StyleSheet.create({
  header: {
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  titleBase: {
    ...Typography.h1,
    marginBottom: Spacing.xs,
  },
  subtitleBase: {
    ...Typography.body,
  },
});

export const AddTaskScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { addTask, updateTask } = useTasks();
  const editTask = route.params?.editTask;

  // Memoizza handler
  const handleSubmit = useCallback((taskData) => {
    try {
      if (editTask) {
        updateTask(editTask.id, taskData);
        Alert.alert(
          'Successo!',
          'Attività aggiornata con successo',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        addTask(taskData);
        Alert.alert(
          'Successo!',
          'Attività aggiunta con successo',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Errore',
        'Si è verificato un errore durante il salvataggio'
      );
    }
  }, [editTask, addTask, updateTask, navigation]);

  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Stili dinamici memoizzati
  const dynamicStyles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    title: {
      color: theme.colors.text,
    },
    subtitle: {
      color: theme.colors.textSecondary,
    },
  }), [theme]);

  const styles = useMemo(() => ({
    ...staticStyles,
    ...dynamicStyles,
  }), [dynamicStyles]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={staticStyles.header}>
        <Text style={[staticStyles.titleBase, dynamicStyles.title]}>
          {editTask ? '✏️ Modifica Attività' : '➕ Nuova Attività'}
        </Text>
        <Text style={[staticStyles.subtitleBase, dynamicStyles.subtitle]}>
          {editTask
            ? 'Modifica i dettagli dell\'attività'
            : 'Aggiungi una nuova attività alla tua lista'
          }
        </Text>
      </View>

      <AddTaskForm
        onSubmit={handleSubmit}
        initialTask={editTask}
        onCancel={editTask ? handleCancel : null}
      />
    </SafeAreaView>
  );
};