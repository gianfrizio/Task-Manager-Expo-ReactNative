import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors, Typography, BorderRadius, Spacing } from '../styles/theme';

export const StatsCard = ({ title, value, color = Colors.primary, subtitle }) => {
  return (
    <View style={[styles.container, { borderLeftColor: color }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginVertical: Spacing.xs,
    marginHorizontal: Spacing.xs,
    flex: 1,
    borderLeftWidth: 4,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: Colors.gray[900],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  title: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  value: {
    ...Typography.h1,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.gray[500],
  },
});