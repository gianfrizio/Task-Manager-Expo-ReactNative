import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  FlatList, 
  StyleSheet,
  Alert,
  RefreshControl,
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import { 
  TaskItem, 
  StatsCard, 
  Button, 
  SearchAndFilter,
  VoiceTaskInput 
} from '../components';
import { Colors, Typography, Spacing } from '../styles/theme';

// Stili statici - creati una sola volta
const staticStyles = StyleSheet.create({
  header: {
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  statsContainer: {
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tasksContainer: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Spacing.md,
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  tasksList: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
    marginTop: Spacing.xxl,
  },
  emptyButton: {
    minWidth: 200,
  },
});

export const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { tasks, toggleTask, deleteTask, getTaskStats, addTask } = useTasks();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const stats = getTaskStats();

  // Memoizza i task ordinati per evitare sorting ripetuti
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const dateA = new Date(b.createdAt);
      const dateB = new Date(a.createdAt);
      return dateA - dateB;
    });
  }, [tasks]);

  // Stili dinamici - memoizzati e ricreati solo al cambio tema
  const dynamicStyles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    title: {
      ...Typography.h1,
      marginBottom: Spacing.xs,
      color: theme.colors.text,
    },
    subtitle: {
      ...Typography.body,
      color: theme.colors.textSecondary,
    },
    tasksContainerBg: {
      backgroundColor: theme.colors.card,
    },
    tasksTitle: {
      ...Typography.h2,
      color: theme.colors.text,
    },
    emptyTitle: {
      ...Typography.h2,
      marginTop: Spacing.md,
      marginBottom: Spacing.xs,
      color: theme.colors.textSecondary,
    },
    emptyText: {
      ...Typography.body,
      textAlign: 'center',
      color: theme.colors.textSecondary,
      marginBottom: Spacing.xl,
    },
  }), [theme]);

  // Combina stili statici e dinamici
  const styles = useMemo(() => ({
    ...staticStyles,
    ...dynamicStyles,
  }), [dynamicStyles]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleDeleteTask = (taskId) => {
    const confirmDelete = () => {
      deleteTask(taskId);
    };
    
    // Su web, usa confirm(), su mobile usa Alert.alert()
    if (Platform.OS === 'web') {
      if (window.confirm('Sei sicuro di voler eliminare questa attività?')) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        'Conferma Eliminazione',
        'Sei sicuro di voler eliminare questa attività?',
        [
          { text: 'Annulla', style: 'cancel' },
          { 
            text: 'Elimina', 
            style: 'destructive',
            onPress: confirmDelete
          }
        ]
      );
    }
  };

  const handleEditTask = (task) => {
    navigation.navigate('AddTask', { editTask: task });
  };

  const renderTask = ({ item }) => (
    <TaskItem
      task={item}
      onToggle={toggleTask}
      onEdit={handleEditTask}
      onDelete={handleDeleteTask}
    />
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="clipboard-outline" size={80} color={theme.colors.textSecondary} />
      <Text style={styles.emptyTitle}>Nessuna Attività</Text>
      <Text style={styles.emptyText}>
        Aggiungi la tua prima attività per iniziare!
      </Text>
      <Button
        title="Aggiungi Attività"
        onPress={() => navigation.navigate('AddTask')}
        variant="primary"
        style={styles.emptyButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 Le Mie Attività</Text>
        <Text style={styles.subtitle}>
          Gestisci le tue attività quotidiane
        </Text>
      </View>

      {/* Stats Cards */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.statsContainer}
      >
        <StatsCard
          title="Totali"
          value={stats.total}
          color={Colors.primary}
          subtitle="attività create"
        />
        <StatsCard
          title="Completate"
          value={stats.completed}
          color={Colors.secondary}
          subtitle="ben fatto!"
        />
        <StatsCard
          title="In Sospeso"
          value={stats.pending}
          color={Colors.warning}
          subtitle="da completare"
        />
        <StatsCard
          title="Alta Priorità"
          value={stats.highPriority}
          color={Colors.danger}
          subtitle="urgenti"
        />
      </ScrollView>

      {/* Tasks List */}
      <View style={[staticStyles.tasksContainer, dynamicStyles.tasksContainerBg]}>
        <View style={styles.tasksHeader}>
          <Text style={styles.tasksTitle}>
            Attività Recenti ({sortedTasks.length})
          </Text>
          <Button
            title="Aggiungi"
            onPress={() => navigation.navigate('AddTask')}
            variant="primary"
            size="small"
          />
        </View>

        <FlatList
          data={sortedTasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={EmptyState}
          style={styles.tasksList}
        />
      </View>
    </SafeAreaView>
  );
};