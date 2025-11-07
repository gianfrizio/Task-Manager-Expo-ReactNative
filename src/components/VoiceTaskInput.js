import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  Animated,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { Typography, BorderRadius, Spacing } from '../styles/theme';

export const VoiceTaskInput = ({ onTaskCreated, onClose }) => {
  const { theme } = useTheme();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const pulseAnim = new Animated.Value(1);

  const startListening = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsListening(true);
      
      // Simulate voice recognition (in real app, use expo-speech or react-native-voice)
      startPulseAnimation();
      
      // Simulate speech recognition
      setTimeout(() => {
        const sampleTranscripts = [
          "Comprare il latte al supermercato",
          "Chiamare il dentista per prenotazione",
          "Finire il progetto React Native",
          "Fare esercizio fisico in palestra",
          "Studiare per l'esame di domani"
        ];
        
        const randomTranscript = sampleTranscripts[Math.floor(Math.random() * sampleTranscripts.length)];
        setTranscript(randomTranscript);
        setIsListening(false);
        stopPulseAnimation();
        
        // Parse transcript and create task
        parseTranscriptAndCreateTask(randomTranscript);
      }, 2000);
      
    } catch (error) {
      Alert.alert('Errore', 'Impossibile avviare il riconoscimento vocale');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    stopPulseAnimation();
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const parseTranscriptAndCreateTask = (text) => {
    // AI-powered parsing simulation
    const taskData = {
      title: text,
      description: '',
      priority: 'medium',
      category: 'other',
    };

    // Smart categorization
    if (text.toLowerCase().includes('lavoro') || text.toLowerCase().includes('progetto')) {
      taskData.category = 'work';
      taskData.priority = 'high';
    } else if (text.toLowerCase().includes('spesa') || text.toLowerCase().includes('comprare')) {
      taskData.category = 'shopping';
    } else if (text.toLowerCase().includes('studio') || text.toLowerCase().includes('esame')) {
      taskData.category = 'study';
      taskData.priority = 'high';
    } else if (text.toLowerCase().includes('palestra') || text.toLowerCase().includes('sport')) {
      taskData.category = 'health';
    }

    // Priority detection
    if (text.toLowerCase().includes('urgente') || text.toLowerCase().includes('importante')) {
      taskData.priority = 'high';
    }

    onTaskCreated(taskData);
    
    // Provide audio feedback
    Speech.speak(`Attività "${taskData.title}" aggiunta con successo`, {
      language: 'it-IT',
      rate: 0.8,
    });
    
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const confirmTask = () => {
    if (transcript) {
      parseTranscriptAndCreateTask(transcript);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.overlay }]}>
      <View style={[styles.modal, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          🎤 Aggiungi con la Voce
        </Text>

        <Animated.View 
          style={[
            styles.micContainer,
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <TouchableOpacity
            style={[
              styles.micButton,
              isListening && styles.micButtonActive
            ]}
            onPress={isListening ? stopListening : startListening}
          >
            <LinearGradient
              colors={isListening ? theme.colors.dangerGradient : theme.colors.primaryGradient}
              style={styles.micGradient}
            >
              <Ionicons
                name={isListening ? 'stop' : 'mic'}
                size={40}
                color="white"
              />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <Text style={[styles.status, { color: theme.colors.textSecondary }]}>
          {isListening ? 'Sto ascoltando...' : 'Tocca per iniziare'}
        </Text>

        {transcript ? (
          <View style={[styles.transcriptContainer, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.transcriptLabel, { color: theme.colors.textSecondary }]}>
              Trascrizione:
            </Text>
            <Text style={[styles.transcript, { color: theme.colors.text }]}>
              "{transcript}"
            </Text>
            
            <View style={styles.transcriptActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
                onPress={confirmTask}
              >
                <Ionicons name="checkmark" size={20} color="white" />
                <Text style={styles.actionButtonText}>Conferma</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.warning }]}
                onPress={() => setTranscript('')}
              >
                <Ionicons name="refresh" size={20} color="white" />
                <Text style={styles.actionButtonText}>Riprova</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: theme.colors.border }]}
          onPress={onClose}
        >
          <Text style={[styles.closeButtonText, { color: theme.colors.text }]}>
            Chiudi
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    width: '90%',
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
    }),
  },
  title: {
    ...Typography.h2,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  micContainer: {
    marginBottom: Spacing.lg,
  },
  micButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
  },
  micGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonActive: {
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)',
    } : {
      shadowColor: '#EF4444',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 10,
    }),
  },
  status: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  transcriptContainer: {
    width: '100%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  transcriptLabel: {
    ...Typography.caption,
    marginBottom: Spacing.xs,
  },
  transcript: {
    ...Typography.body,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
  },
  transcriptActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  actionButtonText: {
    color: 'white',
    marginLeft: Spacing.xs,
    fontWeight: '600',
  },
  closeButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  closeButtonText: {
    ...Typography.body,
    fontWeight: '600',
  },
});