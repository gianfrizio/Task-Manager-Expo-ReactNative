import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const lightTheme = {
  colors: {
    primary: '#3B82F6',
    primaryGradient: ['#60A5FA', '#3B82F6'],
    secondary: '#10B981',
    secondaryGradient: ['#34D399', '#10B981'],
    danger: '#EF4444',
    dangerGradient: ['#F87171', '#EF4444'],
    warning: '#F59E0B',
    warningGradient: ['#FBBF24', '#F59E0B'],
    success: '#10B981',
    successGradient: ['#34D399', '#10B981'],
    background: '#FFFFFF',
    backgroundGradient: ['#F8FAFC', '#FFFFFF'],
    surface: '#F9FAFB',
    surfaceGradient: ['#F1F5F9', '#F8FAFC'],
    card: '#FFFFFF',
    cardGradient: ['#FFFFFF', '#F8FAFC'],
    text: '#1F2937',
    textSecondary: '#6B7280',
    textLight: '#9CA3AF',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.5)',
    accent: '#8B5CF6',
    accentGradient: ['#A78BFA', '#8B5CF6'],
  },
  dark: false,
};

export const darkTheme = {
  colors: {
    primary: '#60A5FA',
    primaryGradient: ['#3B82F6', '#1E40AF'],
    secondary: '#34D399',
    secondaryGradient: ['#10B981', '#059669'],
    danger: '#F87171',
    dangerGradient: ['#EF4444', '#DC2626'],
    warning: '#FBBF24',
    warningGradient: ['#F59E0B', '#D97706'],
    success: '#34D399',
    successGradient: ['#10B981', '#059669'],
    background: '#0F172A',
    backgroundGradient: ['#0F172A', '#1E293B'],
    surface: '#1E293B',
    surfaceGradient: ['#334155', '#475569'],
    card: '#334155',
    cardGradient: ['#475569', '#64748B'],
    text: '#F1F5F9',
    textSecondary: '#CBD5E1',
    textLight: '#94A3B8',
    border: '#475569',
    borderLight: '#64748B',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.7)',
    accent: '#A78BFA',
    accentGradient: ['#8B5CF6', '#7C3AED'],
  },
  dark: true,
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system'); // 'light', 'dark', 'system'

  // Memoizza getTheme
  const theme = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return themeMode === 'dark' ? darkTheme : lightTheme;
  }, [themeMode, systemColorScheme]);

  // Memoizza loadThemePreference
  const loadThemePreference = useCallback(async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themeMode');
      if (savedTheme) {
        setThemeMode(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  }, []);

  // Memoizza saveThemePreference
  const saveThemePreference = useCallback(async () => {
    try {
      await AsyncStorage.setItem('themeMode', themeMode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  }, [themeMode]);

  // Load theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, [loadThemePreference]);

  // Save theme preference quando cambia
  useEffect(() => {
    saveThemePreference();
  }, [saveThemePreference]);

  // Memoizza toggleTheme
  const toggleTheme = useCallback(() => {
    setThemeMode(current => {
      switch (current) {
        case 'light': return 'dark';
        case 'dark': return 'system';
        case 'system': return 'light';
        default: return 'light';
      }
    });
  }, []);

  // Memoizza setTheme
  const setTheme = useCallback((mode) => {
    setThemeMode(mode);
  }, []);

  // Memoizza context value
  const value = useMemo(() => ({
    theme,
    themeMode,
    toggleTheme,
    setTheme,
    isDark: theme.dark,
  }), [theme, themeMode, toggleTheme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};