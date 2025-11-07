import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { AdvancedAnalytics } from '../components';
import { useTheme } from '../context/ThemeContext';

export const AnalyticsScreen = () => {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AdvancedAnalytics />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});