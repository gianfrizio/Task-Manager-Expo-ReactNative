import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlatformUtils } from '../utils/platform';
import { SafeNotificationService } from '../utils/safeNotifications';

const TaskContext = createContext();

// Actions
const ADD_TASK = 'ADD_TASK';
const UPDATE_TASK = 'UPDATE_TASK';
const DELETE_TASK = 'DELETE_TASK';
const TOGGLE_TASK = 'TOGGLE_TASK';
const SET_TASKS = 'SET_TASKS';

// Reducer
const taskReducer = (state, action) => {
  switch (action.type) {
    case SET_TASKS:
      return action.payload;
    
    case ADD_TASK:
      return [...state, action.payload];
    
    case UPDATE_TASK:
      return state.map(task => 
        task.id === action.payload.id ? { ...task, ...action.payload.updates } : task
      );
    
    case DELETE_TASK:
      return state.filter(task => task.id !== action.payload);
    
    case TOGGLE_TASK:
      return state.map(task => 
        task.id === action.payload ? { ...task, completed: !task.completed } : task
      );
    
    default:
      return state;
  }
};

// Context Provider
export const TaskProvider = ({ children }) => {
  const [tasks, dispatch] = useReducer(taskReducer, []);

  // Memoizza loadTasks con error handling migliorato
  const loadTasks = useCallback(async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);

        // Validazione: assicurati che sia un array
        if (Array.isArray(parsedTasks)) {
          dispatch({ type: SET_TASKS, payload: parsedTasks });
        } else {
          console.error('Invalid tasks data format, resetting to empty array');
          dispatch({ type: SET_TASKS, payload: [] });
        }
      }

      // Pulisci notifiche vecchie all'avvio
      if (PlatformUtils.supportsNotifications) {
        try {
          await SafeNotificationService.clearAllTaskNotifications();
          console.log('Notifiche vecchie pulite all\'avvio');
        } catch (notifError) {
          console.error('Error clearing notifications:', notifError);
          // Non bloccare il caricamento se la pulizia notifiche fallisce
        }
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      // Inizializza con array vuoto in caso di errore
      dispatch({ type: SET_TASKS, payload: [] });

      // Mostra alert solo se è un errore critico (non solo dati mancanti)
      if (error.name !== 'SyntaxError') {
        Alert.alert(
          'Errore Caricamento',
          'Si è verificato un errore durante il caricamento delle attività. Le modifiche potrebbero non essere salvate.',
          [{ text: 'OK' }]
        );
      }
    }
  }, []);

  // Memoizza saveTasks
  const saveTasks = useCallback(async (tasksToSave) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasksToSave));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  }, []);

  // Load tasks from AsyncStorage on app start
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Save tasks to AsyncStorage whenever tasks change
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks, saveTasks]);

  // Memoizza addTask con validazione e error handling
  const addTask = useCallback(async (taskData) => {
    try {
      // Validazione input
      if (!taskData || typeof taskData.title !== 'string' || !taskData.title.trim()) {
        throw new Error('Il titolo dell\'attività è obbligatorio');
      }

      const newTask = {
        id: Date.now().toString(),
        title: taskData.title.trim(),
        description: taskData.description?.trim() || '',
        completed: false,
        priority: ['low', 'medium', 'high'].includes(taskData.priority) ? taskData.priority : 'medium',
        category: taskData.category || 'other',
        tags: Array.isArray(taskData.tags) ? taskData.tags : [],
        createdAt: new Date().toISOString(),
        dueDate: taskData.dueDate || null,
        completedAt: null,
        estimatedMinutes: typeof taskData.estimatedMinutes === 'number' ? taskData.estimatedMinutes : null,
        actualMinutes: null,
        reminderIds: [],
        streak: 0,
        difficulty: ['easy', 'medium', 'hard'].includes(taskData.difficulty) ? taskData.difficulty : 'medium',
      };

      // Schedule notifications if due date is set and platform supports it
      if (newTask.dueDate && PlatformUtils.supportsNotifications) {
        try {
          console.log('Programmando notifiche per task:', newTask.title, 'Scadenza:', newTask.dueDate);

          // Cancella eventuali notifiche esistenti per questo task
          await SafeNotificationService.cancelTaskNotifications(newTask.id);

          const reminderId = await SafeNotificationService.scheduleTaskReminder(newTask);
          const dueTodayId = await SafeNotificationService.scheduleTaskOverdue(newTask);
          newTask.reminderIds = [reminderId, dueTodayId].filter(Boolean);
          console.log('Notifiche programmate:', newTask.reminderIds.length);
        } catch (notifError) {
          console.error('Error scheduling notifications:', notifError);
          // Continua comunque con l'aggiunta del task
          Alert.alert(
            'Avviso',
            'Attività creata ma le notifiche potrebbero non funzionare correttamente.',
            [{ text: 'OK' }]
          );
        }
      }

      dispatch({ type: ADD_TASK, payload: newTask });
      return { success: true, task: newTask };
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert(
        'Errore',
        error.message || 'Si è verificato un errore durante la creazione dell\'attività',
        [{ text: 'OK' }]
      );
      return { success: false, error: error.message };
    }
  }, []);

  // Memoizza updateTask
  const updateTask = useCallback((id, updates) => {
    dispatch({ type: UPDATE_TASK, payload: { id, updates } });
  }, []);

  // Memoizza deleteTask con error handling
  const deleteTask = useCallback(async (id) => {
    try {
      // Validazione input
      if (!id) {
        throw new Error('ID attività non valido');
      }

      // Cancella le notifiche associate al task prima di eliminarlo
      if (PlatformUtils.supportsNotifications) {
        try {
          await SafeNotificationService.cancelTaskNotifications(id);
          console.log('Notifiche cancellate per task:', id);
        } catch (notifError) {
          console.error('Error canceling notifications:', notifError);
          // Continua comunque con l'eliminazione
        }
      }

      dispatch({ type: DELETE_TASK, payload: id });
      return { success: true };
    } catch (error) {
      console.error('Error deleting task:', error);
      Alert.alert(
        'Errore',
        error.message || 'Si è verificato un errore durante l\'eliminazione dell\'attività',
        [{ text: 'OK' }]
      );
      return { success: false, error: error.message };
    }
  }, []);

  // Memoizza toggleTask
  const toggleTask = useCallback((id) => {
    dispatch({ type: TOGGLE_TASK, payload: id });
  }, []);

  // Memoizza getTaskStats per evitare ricalcoli
  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    const highPriority = tasks.filter(task => task.priority === 'high' && !task.completed).length;

    return { total, completed, pending, highPriority };
  }, [tasks]);

  // Esponi taskStats come funzione per compatibilità con codice esistente
  const getTaskStats = useCallback(() => taskStats, [taskStats]);

  // Memoizza value per evitare re-render non necessari
  const value = useMemo(() => ({
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    getTaskStats,
  }), [tasks, addTask, updateTask, deleteTask, toggleTask, getTaskStats]);

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

// Custom hook
export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};