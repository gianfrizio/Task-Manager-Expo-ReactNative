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

  // Utility per convertire da formato italiano a ISO
  function convertToISO(italianDate) {
    if (!italianDate) return null;
    const parts = italianDate.split('/');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts;
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  }

  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [priority, setPriority] = useState(initialTask?.priority || 'medium');
  const [dueDate, setDueDate] = useState(
    initialTask?.dueDate ? formatDateForInput(initialTask.dueDate) : ''
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

    // Valida e converte la data se presente
    let convertedDate = null;
    if (dueDate) {
      convertedDate = convertToISO(dueDate);
      if (!convertedDate) {
        Alert.alert('Errore', 'Formato data non valido. Usa il formato gg/mm/aaaa');
        return;
      }
    }

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: convertedDate,
    };

    onSubmit(taskData);
    
    if (!initialTask) {
      // Reset form only if creating new task
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
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

        <Text style={[styles.label, { color: theme.colors.text }]}>Data Scadenza (Opzionale)</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.card, 
            borderColor: theme.colors.border,
            color: theme.colors.text 
          }]}
          value={dueDate}
          onChangeText={handleDateChange}
          placeholder="gg/mm/aaaa (es: 31/12/2025)"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="default"
          maxLength={10}
        />

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