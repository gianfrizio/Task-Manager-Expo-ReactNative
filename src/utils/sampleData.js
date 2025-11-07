/**
 * Sample data for testing the Task Manager app
 */

export const sampleTasks = [
  {
    id: '1',
    title: 'Completare il progetto React Native',
    description: 'Finire l\'app Task Manager con tutte le funzionalità richieste',
    priority: 'high',
    completed: false,
    createdAt: new Date().toISOString(),
    dueDate: '2025-11-15',
  },
  {
    id: '2', 
    title: 'Fare la spesa',
    description: 'Comprare ingredienti per la cena di domani',
    priority: 'medium',
    completed: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    dueDate: '2025-11-08',
  },
  {
    id: '3',
    title: 'Chiamare il dentista',
    description: 'Prenotare appuntamento per controllo',
    priority: 'low',
    completed: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    dueDate: null,
  },
  {
    id: '4',
    title: 'Studiare React Navigation',
    description: 'Approfondire la navigazione in React Native per il progetto',
    priority: 'high',
    completed: false,
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    dueDate: '2025-11-10',
  },
  {
    id: '5',
    title: 'Palestra',
    description: 'Sessione di allenamento cardio e pesi',
    priority: 'medium',
    completed: true,
    createdAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    dueDate: null,
  }
];

// Function to load sample data (for development/testing)
export const loadSampleData = () => {
  return sampleTasks;
};