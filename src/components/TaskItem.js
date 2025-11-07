import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Typography, BorderRadius, Spacing } from '../styles/theme';
import { formatDate, getPriorityColorWithTheme } from '../utils/helpers';

// Stili statici - creati una sola volta
const staticStyles = StyleSheet.create({
  containerBase: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginVertical: Spacing.xs,
    marginHorizontal: Spacing.md,
    flexDirection: 'row',
  },
  containerShadowWeb: Platform.OS === 'web' ? {
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  } : null,
  containerShadowNative: Platform.OS !== 'web' ? {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } : null,
  completed: {
    opacity: 0.7,
  },
  checkbox: {
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  titleBase: {
    ...Typography.h3,
    flex: 1,
    marginRight: Spacing.sm,
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  descriptionBase: {
    ...Typography.body,
    marginBottom: Spacing.sm,
  },
  priorityBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    minWidth: 50,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDateBase: {
    ...Typography.caption,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});

export const TaskItem = ({ task, onToggle, onEdit, onDelete }) => {
  const { theme } = useTheme();
  
  // Debug: logga i dati della task per identificare il problema
  if (!task || typeof task.title !== 'string') {
    console.error('TaskItem: task data invalid:', task);
    return null;
  }
  
  // Memoizza priority color usando helper centralizzato
  const priorityColor = useMemo(() =>
    getPriorityColorWithTheme(task.priority, theme),
    [task.priority, theme]
  );

  // Memoizza formatted date usando helper centralizzato
  const formattedDate = useMemo(() =>
    formatDate(task?.dueDate),
    [task?.dueDate]
  );

  // Stili dinamici - memoizzati per theme
  const dynamicStyles = useMemo(() => ({
    container: {
      backgroundColor: theme.colors.card,
      shadowColor: theme.colors.shadow || '#000000',
    },
    completedBg: {
      backgroundColor: theme.colors.surface,
    },
    title: {
      color: theme.colors.text,
    },
    completedTextColor: {
      color: theme.colors.textSecondary,
    },
    description: {
      color: theme.colors.textSecondary,
    },
    dueDate: {
      color: theme.colors.textSecondary,
    },
  }), [theme]);

  // Funzioni di rendering sicure (memoizzate)
  const renderTitle = useMemo(() => {
    const title = task?.title;
    return typeof title === 'string' && title.trim() ? title.trim() : 'Attività senza titolo';
  }, [task?.title]);

  const renderDescription = useMemo(() => {
    const description = task?.description;
    return typeof description === 'string' && description.trim() ? description.trim() : null;
  }, [task?.description]);

  const renderPriority = useMemo(() => {
    const priority = task?.priority;
    return typeof priority === 'string' && priority.trim() ? priority.trim().toUpperCase() : 'MEDIUM';
  }, [task?.priority]);

  const renderDueDate = useMemo(() => {
    if (!formattedDate) return null;
    return `📅 Scadenza: ${formattedDate}`;
  }, [formattedDate]);

  return (
    <View style={[
      staticStyles.containerBase,
      staticStyles.containerShadowWeb,
      staticStyles.containerShadowNative,
      dynamicStyles.container,
      task.completed && staticStyles.completed,
      task.completed && dynamicStyles.completedBg,
    ]}>
      <Pressable
        style={({ pressed }) => [
          staticStyles.checkbox,
          pressed && { opacity: 0.7 }
        ]}
        onPress={() => onToggle(task.id)}
      >
        <Ionicons
          name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={task.completed ? theme.colors.secondary : theme.colors.textSecondary}
        />
      </Pressable>
      <View style={staticStyles.content}>
        <View style={staticStyles.header}>
          <Text style={[
            staticStyles.titleBase,
            dynamicStyles.title,
            task.completed && staticStyles.completedText,
            task.completed && dynamicStyles.completedTextColor,
          ]}>
            {renderTitle}
          </Text>
          <View style={[
            staticStyles.priorityBadge,
            { backgroundColor: priorityColor }
          ]}>
            <Text style={staticStyles.priorityText}>
              {renderPriority}
            </Text>
          </View>
        </View>
        {renderDescription && (
          <Text style={[
            staticStyles.descriptionBase,
            dynamicStyles.description,
            task.completed && staticStyles.completedText,
            task.completed && dynamicStyles.completedTextColor,
          ]}>
            {renderDescription}
          </Text>
        )}
        <View style={staticStyles.footer}>
          {renderDueDate && (
            <Text style={[staticStyles.dueDateBase, dynamicStyles.dueDate]}>
              {renderDueDate}
            </Text>
          )}
          <View style={staticStyles.actions}>
            <Pressable
              style={({ pressed }) => [
                staticStyles.actionButton,
                pressed && { opacity: 0.7 }
              ]}
              onPress={() => onEdit(task)}
            >
              <Ionicons name="pencil" size={16} color={theme.colors.primary} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                staticStyles.actionButton,
                pressed && { opacity: 0.7 }
              ]}
              onPress={() => onDelete(task.id)}
            >
              <Ionicons name="trash" size={16} color={theme.colors.danger} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};