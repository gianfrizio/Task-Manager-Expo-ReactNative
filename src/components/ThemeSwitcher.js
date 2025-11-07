import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { Typography, BorderRadius, Spacing } from '../styles/theme';

export const ThemeSwitcher = ({ style }) => {
  const { theme, themeMode, toggleTheme } = useTheme();

  const getThemeIcon = (mode) => {
    switch (mode) {
      case 'light': return 'sunny';
      case 'dark': return 'moon';
      case 'system': return 'phone-portrait';
      default: return 'sunny';
    }
  };

  const getThemeLabel = (mode) => {
    switch (mode) {
      case 'light': return 'Chiaro';
      case 'dark': return 'Scuro';
      case 'system': return 'Sistema';
      default: return 'Chiaro';
    }
  };

  return (
    <Pressable 
      onPress={toggleTheme} 
      style={({ pressed }) => [
        styles.container, 
        style,
        pressed && { opacity: 0.8 }
      ]}
    >
      <LinearGradient
        colors={theme.colors.primaryGradient}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <Ionicons 
            name={getThemeIcon(themeMode)} 
            size={20} 
            color={theme.colors.text} 
          />
          <Text style={[styles.label, { color: theme.colors.text }]}>
            {getThemeLabel(themeMode)}
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  gradient: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    ...Typography.body,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
});