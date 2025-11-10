/**
 * Utility functions for the Task Manager app
 */

// Format date to Italian locale
export const formatDate = (dateString) => {
  if (!dateString) return null;

  try {
    const date = new Date(dateString);
    // Validate date is valid
    if (isNaN(date.getTime())) {
      console.warn('formatDate: invalid date string:', dateString);
      return null;
    }
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return null;
  }
};

// Format time from date string
export const formatTime = (dateString) => {
  if (!dateString) return null;

  try {
    const date = new Date(dateString);
    // Validate date is valid
    if (isNaN(date.getTime())) {
      console.warn('formatTime: invalid date string:', dateString);
      return null;
    }
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return null;
  }
};

// Format date and time together
export const formatDateTime = (dateString) => {
  if (!dateString) return null;

  try {
    const date = new Date(dateString);
    // Validate date is valid
    if (isNaN(date.getTime())) {
      console.warn('formatDateTime: invalid date string:', dateString);
      return null;
    }
    
    const formattedDate = date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    
    const formattedTime = date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return { date: formattedDate, time: formattedTime };
  } catch (error) {
    console.error('Error formatting date time:', error);
    return null;
  }
};

// Validate date format (YYYY-MM-DD)
export const isValidDate = (dateString) => {
  if (!dateString) return true; // Empty date is valid (optional)
  
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

// Get priority color (versione base con colori default)
export const getPriorityColor = (priority) => {
  const colors = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#EF4444'
  };
  return colors[priority] || colors.medium;
};

// Get priority color con theme (per componenti che usano theme)
export const getPriorityColorWithTheme = (priority, theme) => {
  const colors = {
    high: theme?.colors?.danger || '#EF4444',
    medium: theme?.colors?.warning || '#F59E0B',
    low: theme?.colors?.success || '#10B981'
  };
  return colors[priority] || colors.medium;
};

// Generate unique ID
export const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substring(2, 11);
};

// Debounce function for search/input
export const debounce = (func, wait = 300) => {
  // Validazione input
  if (typeof func !== 'function') {
    console.error('debounce: first parameter must be a function');
    return () => {};
  }

  if (typeof wait !== 'number' || wait < 0) {
    console.warn('debounce: wait time should be a positive number, using default 300ms');
    wait = 300;
  }

  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Sort tasks by various criteria
export const sortTasks = (tasks, criteria = 'createdAt', direction = 'desc') => {
  // Validazione input
  if (!Array.isArray(tasks)) {
    console.error('sortTasks: tasks must be an array, received:', typeof tasks);
    return [];
  }

  if (tasks.length === 0) {
    return [];
  }

  const validCriteria = ['createdAt', 'dueDate', 'priority', 'title'];
  if (!validCriteria.includes(criteria)) {
    console.warn(`sortTasks: invalid criteria '${criteria}', using 'createdAt'`);
    criteria = 'createdAt';
  }

  const validDirections = ['asc', 'desc'];
  if (!validDirections.includes(direction)) {
    console.warn(`sortTasks: invalid direction '${direction}', using 'desc'`);
    direction = 'desc';
  }

  try {
    return [...tasks].sort((a, b) => {
      let aValue = a[criteria];
      let bValue = b[criteria];

      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return direction === 'asc' ? 1 : -1;
      if (bValue === undefined) return direction === 'asc' ? -1 : 1;

      // Handle date strings
      if (criteria === 'createdAt' || criteria === 'dueDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);

        // Handle invalid dates
        if (isNaN(aValue.getTime())) aValue = new Date(0);
        if (isNaN(bValue.getTime())) bValue = new Date(0);
      }

      // Handle priority (convert to numeric for sorting)
      if (criteria === 'priority') {
        const priorityOrder = { low: 1, medium: 2, high: 3 };
        aValue = priorityOrder[aValue] || 2; // default to medium
        bValue = priorityOrder[bValue] || 2;
      }

      if (direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  } catch (error) {
    console.error('sortTasks: error during sorting:', error);
    return [...tasks]; // Return unsorted copy as fallback
  }
};

// Filter tasks by status
export const filterTasks = (tasks, filter = 'all') => {
  // Validazione input
  if (!Array.isArray(tasks)) {
    console.error('filterTasks: tasks must be an array, received:', typeof tasks);
    return [];
  }

  if (tasks.length === 0) {
    return [];
  }

  const validFilters = ['all', 'completed', 'pending', 'high_priority'];
  if (!validFilters.includes(filter)) {
    console.warn(`filterTasks: invalid filter '${filter}', using 'all'`);
    filter = 'all';
  }

  try {
    switch (filter) {
      case 'completed':
        return tasks.filter(task => task && task.completed === true);
      case 'pending':
        return tasks.filter(task => task && task.completed === false);
      case 'high_priority':
        return tasks.filter(task =>
          task &&
          task.priority === 'high' &&
          task.completed === false
        );
      default:
        return tasks;
    }
  } catch (error) {
    console.error('filterTasks: error during filtering:', error);
    return [...tasks]; // Return copy as fallback
  }
};