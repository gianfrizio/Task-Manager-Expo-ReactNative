import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Alert,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Button } from './Button';
import { Typography, BorderRadius, Spacing } from '../styles/theme';
import { Categories } from '../utils/categories';

export const AddTaskForm = ({ onSubmit, initialTask = null, onCancel }) => {
  const { theme } = useTheme();

  // Utility per formattare la data da ISO a formato italiano
  function formatDateForInput(isoDate) {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Utility per formattare l'ora da ISO a formato HH:MM
  function formatTimeForInput(isoDate) {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // Utility per convertire da formato italiano + ora a ISO
  function convertToISOWithTime(italianDate, timeString) {
    if (!italianDate) return null;
    
    const dateParts = italianDate.split('/');
    if (dateParts.length !== 3) return null;
    
    const [day, month, year] = dateParts;
    let hours = 23, minutes = 59; // Default a fine giornata
    
    if (timeString && timeString.includes(':')) {
      const timeParts = timeString.split(':');
      if (timeParts.length === 2) {
        hours = parseInt(timeParts[0], 10);
        minutes = parseInt(timeParts[1], 10);
        
        // Valida ora e minuti
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
          return null;
        }
      }
    }
    
    const date = new Date(year, month - 1, day, hours, minutes);
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  }

  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [priority, setPriority] = useState(initialTask?.priority || 'medium');
  const [category, setCategory] = useState(initialTask?.category || 'other');
  const [dueDate, setDueDate] = useState(
    initialTask?.dueDate ? formatDateForInput(initialTask.dueDate) : ''
  );
  const [dueTime, setDueTime] = useState(
    initialTask?.dueDate ? formatTimeForInput(initialTask.dueDate) : ''
  );

  

  // Formattazione automatica durante la digitazione
  const handleDateChange = (text) => {
    // Se l'utente sta cancellando, permetti la cancellazione normale
    if (text.length < dueDate.length) {
      setDueDate(text);
      return;
    }
    
    // Se l'utente digita slash manualmente, mantienilo
    if (text.includes('/')) {
      // Controlla se il formato è corretto e limita a 10 caratteri
      if (text.length <= 10) {
        setDueDate(text);
      }
      return;
    }
    
    // Rimuovi tutti i caratteri non numerici per la formattazione automatica
    const numbersOnly = text.replace(/\D/g, '');
    
    let formatted = numbersOnly;
    if (numbersOnly.length >= 3) {
      formatted = `${numbersOnly.slice(0, 2)}/${numbersOnly.slice(2, 4)}`;
      if (numbersOnly.length >= 5) {
        formatted += `/${numbersOnly.slice(4, 8)}`;
      }
    }
    
    // Limita a 10 caratteri (gg/mm/aaaa)
    if (formatted.length <= 10) {
      setDueDate(formatted);
    }
  };

  // Formattazione automatica per l'ora
  const handleTimeChange = (text) => {
    // Se l'utente sta cancellando, permetti la cancellazione normale
    if (text.length < dueTime.length) {
      setDueTime(text);
      return;
    }
    
    // Se l'utente digita i due punti manualmente, mantienilo
    if (text.includes(':')) {
      if (text.length <= 5) {
        setDueTime(text);
      }
      return;
    }
    
    // Rimuovi tutti i caratteri non numerici per la formattazione automatica
    const numbersOnly = text.replace(/\D/g, '');
    
    let formatted = numbersOnly;
    if (numbersOnly.length >= 3) {
      formatted = `${numbersOnly.slice(0, 2)}:${numbersOnly.slice(2, 4)}`;
    }
    
    // Limita a 5 caratteri (HH:MM)
    if (formatted.length <= 5) {
      setDueTime(formatted);
    }
  };

  const priorities = [
    { value: 'low', label: 'Bassa', color: theme.colors.secondary || '#6C757D' },
    { value: 'medium', label: 'Media', color: theme.colors.warning || '#FFA500' },
    { value: 'high', label: 'Alta', color: theme.colors.danger || '#DC3545' },
  ];

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Errore', 'Il titolo è obbligatorio');
      return;
    }

    // Valida e converte la data con ora se presente
    let convertedDate = null;
    if (dueDate) {
      // Valida il formato dell'ora se presente
      if (dueTime && !dueTime.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
        Alert.alert('Errore', 'Formato ora non valido. Usa il formato HH:MM (es: 14:30)');
        return;
      }
      
      convertedDate = convertToISOWithTime(dueDate, dueTime);
      if (!convertedDate) {
        Alert.alert('Errore', 'Formato data/ora non valido. Usa gg/mm/aaaa per la data e HH:MM per l\'ora');
        return;
      }
    }

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
      dueDate: convertedDate,
    };

    onSubmit(taskData);
    
    if (!initialTask) {
      // Reset form only if creating new task
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('other');
      setDueDate('');
      setDueTime('');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView 
        style={[styles.scrollView, { backgroundColor: theme.colors.background }]} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.form}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Titolo *</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.card, 
            borderColor: theme.colors.border,
            color: theme.colors.text 
          }]}
          value={title}
          onChangeText={setTitle}
          placeholder="Inserisci il titolo dell'attività"
          placeholderTextColor={theme.colors.textSecondary}
          maxLength={100}
        />

        <Text style={[styles.label, { color: theme.colors.text }]}>Descrizione</Text>
        <TextInput
          style={[styles.input, styles.textArea, { 
            backgroundColor: theme.colors.card, 
            borderColor: theme.colors.border,
            color: theme.colors.text 
          }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Descrizione opzionale..."
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={500}
        />

                <Text style={[styles.label, { color: theme.colors.text }]}>Priorità</Text>
        <View style={styles.priorityContainer}>
          {priorities.map((item) => (
            <Pressable
              key={item.value}
              style={({ pressed }) => [
                styles.priorityButton,
                { 
                  backgroundColor: priority === item.value ? item.color : theme.colors.surface,
                  borderColor: priority === item.value ? item.color : theme.colors.border,
                  opacity: pressed ? 0.8 : 1
                }
              ]}
              onPress={() => setPriority(item.value)}
            >
              <Text style={[
                styles.priorityText,
                { 
                  color: priority === item.value ? '#FFFFFF' : theme.colors.text 
                }
              ]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { color: theme.colors.text }]}>Categoria</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {Object.values(Categories).map((cat) => (
            <Pressable
              key={cat.id}
              style={({ pressed }) => [
                styles.categoryButton,
                { 
                  backgroundColor: category === cat.id ? cat.color : theme.colors.surface,
                  borderColor: category === cat.id ? cat.color : theme.colors.border,
                  opacity: pressed ? 0.8 : 1
                }
              ]}
              onPress={() => setCategory(cat.id)}
            >
              <Ionicons 
                name={cat.icon} 
                size={20} 
                color={category === cat.id ? '#FFFFFF' : theme.colors.text} 
              />
              <Text style={[
                styles.categoryText,
                { 
                  color: category === cat.id ? '#FFFFFF' : theme.colors.text 
                }
              ]}>
                {cat.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={[styles.label, { color: theme.colors.text }]}>Data Scadenza (Opzionale)</Text>
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateContainer}>
            <TextInput
              style={[styles.input, styles.dateInput, { 
                backgroundColor: theme.colors.card, 
                borderColor: theme.colors.border,
                color: theme.colors.text 
              }]}
              value={dueDate}
              onChangeText={handleDateChange}
              placeholder="gg/mm/aaaa"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="default"
              maxLength={10}
            />
          </View>
          
          <View style={styles.timeContainer}>
            <TextInput
              style={[styles.input, styles.timeInput, { 
                backgroundColor: theme.colors.card, 
                borderColor: theme.colors.border,
                color: theme.colors.text 
              }]}
              value={dueTime}
              onChangeText={handleTimeChange}
              placeholder="HH:MM"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={initialTask ? 'Aggiorna' : 'Aggiungi Attività'}
            onPress={handleSubmit}
            variant="primary"
            size="large"
            style={styles.submitButton}
          />
          
          {onCancel && (
            <Button
              title="Annulla"
              onPress={onCancel}
              variant="secondary"
              size="large"
              style={styles.cancelButton}
            />
          )}
        </View>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  form: {
    padding: Spacing.md,
  },
  label: {
    ...Typography.h3,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  priorityButton: {
    flex: 1,
    padding: Spacing.md,
    marginHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  prioritySelected: {
  },
  priorityText: {
    ...Typography.body,
    fontWeight: '600',
  },
  priorityTextSelected: {
  },
  categoryScroll: {
    marginTop: Spacing.xs,
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xs,
  },
  categoryButton: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: Spacing.sm,
    marginHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minWidth: 80,
  },
  categoryText: {
    ...Typography.caption,
    fontWeight: '600',
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dateContainer: {
    flex: 2,
  },
  timeContainer: {
    flex: 1,
  },
  dateInput: {
    // Data input prende più spazio
  },
  timeInput: {
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  submitButton: {
    marginBottom: Spacing.xs,
  },
  cancelButton: {
    marginBottom: Spacing.md,
  },
});