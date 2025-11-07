import React, { useMemo } from 'react';
import { View, Text, ScrollView, Dimensions, StyleSheet, Platform } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { StatsCard } from './StatsCard';
import { Typography, BorderRadius, Spacing } from '../styles/theme';
import { Categories } from '../utils/categories';

const screenWidth = Dimensions.get('window').width;

export const AdvancedAnalytics = () => {
  const { theme } = useTheme();
  const { tasks } = useTasks();

  // Memoizza weekly data
  const weeklyData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const weeklyCompletions = last7Days.map(date =>
      tasks.filter(task =>
        task.completed &&
        task.completedAt &&
        task.completedAt.startsWith(date)
      ).length
    );

    return {
      labels: last7Days.map(date => {
        const d = new Date(date);
        return d.getDate().toString();
      }),
      datasets: [{
        data: weeklyCompletions,
        strokeWidth: 3,
      }]
    };
  }, [tasks]);

  // Memoizza category data
  const categoryData = useMemo(() => {
    const categoryStats = Object.values(Categories).map(category => {
      const categoryTasks = tasks.filter(task => task.category === category.id);
      const completedTasks = categoryTasks.filter(task => task.completed);

      return {
        name: category.name,
        count: categoryTasks.length,
        completed: completedTasks.length,
        color: category.color,
        legendFontColor: theme.colors.text,
        legendFontSize: 12,
      };
    }).filter(cat => cat.count > 0);

    return categoryStats;
  }, [tasks, theme.colors.text]);

  // Memoizza priority data
  const priorityData = useMemo(() => {
    const priorities = ['low', 'medium', 'high'];
    const priorityNames = { low: 'Bassa', medium: 'Media', high: 'Alta' };

    return {
      labels: priorities.map(p => priorityNames[p]),
      datasets: [{
        data: priorities.map(priority =>
          tasks.filter(task => task.priority === priority && !task.completed).length
        )
      }]
    };
  }, [tasks]);

  // Memoizza productivity stats
  const productivityStats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;

    const thisWeekTasks = tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return taskDate >= weekAgo;
    });

    const avgTasksPerDay = (thisWeekTasks.length / 7).toFixed(1);

    const highPriorityPending = tasks.filter(
      task => task.priority === 'high' && !task.completed
    ).length;

    return {
      completionRate,
      avgTasksPerDay,
      highPriorityPending,
      totalTasks,
      completedTasks
    };
  }, [tasks]);

  // Memoizza chart config
  const chartConfig = useMemo(() => ({
    backgroundColor: theme.colors.background,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.background,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => theme.colors.text,
    style: {
      borderRadius: BorderRadius.lg,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: theme.colors.primary
    }
  }), [theme]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={theme.colors.backgroundGradient}
        style={styles.header}
      >
        <Text style={[styles.title, { color: theme.colors.text }]}>
          📊 Analytics Avanzate
        </Text>
      </LinearGradient>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <StatsCard
          title="Tasso Completamento"
          value={`${productivityStats.completionRate}%`}
          color={theme.colors.success}
          subtitle="delle attività"
        />
        <StatsCard
          title="Media Giornaliera"
          value={productivityStats.avgTasksPerDay}
          color={theme.colors.primary}
          subtitle="attività/giorno"
        />
      </View>

      {/* Weekly Progress Chart */}
      <View style={[styles.chartContainer, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
          📈 Completamenti Settimanali
        </Text>
        <LineChart
          data={weeklyData}
          width={screenWidth - 60}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
        />
      </View>

      {/* Category Distribution */}
      {categoryData.length > 0 && (
        <View style={[styles.chartContainer, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
            📋 Distribuzione per Categoria
          </Text>
          <PieChart
            data={categoryData.map(cat => ({
              name: cat.name,
              population: cat.count,
              color: cat.color,
              legendFontColor: theme.colors.text,
              legendFontSize: 12,
            }))}
            width={screenWidth - 60}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        </View>
      )}

      {/* Priority Distribution */}
      <View style={[styles.chartContainer, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
          🎯 Attività per Priorità (In Sospeso)
        </Text>
        <BarChart
          data={priorityData}
          width={screenWidth - 60}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          showValuesOnTopOfBars
        />
      </View>

      {/* Productivity Insights */}
      <View style={[styles.insightsContainer, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
          💡 Insights Produttività
        </Text>
        
        <View style={styles.insight}>
          <Text style={[styles.insightLabel, { color: theme.colors.textSecondary }]}>
            Streak attuale:
          </Text>
          <Text style={[styles.insightValue, { color: theme.colors.primary }]}>
            3 giorni 🔥
          </Text>
        </View>

        <View style={styles.insight}>
          <Text style={[styles.insightLabel, { color: theme.colors.textSecondary }]}>
            Tempo medio completamento:
          </Text>
          <Text style={[styles.insightValue, { color: theme.colors.success }]}>
            2.5 giorni ⚡
          </Text>
        </View>

        <View style={styles.insight}>
          <Text style={[styles.insightLabel, { color: theme.colors.textSecondary }]}>
            Categoria più produttiva:
          </Text>
          <Text style={[styles.insightValue, { color: theme.colors.warning }]}>
            Lavoro 💼
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  title: {
    ...Typography.h1,
    textAlign: 'center',
  },
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  chartContainer: {
    margin: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  chartTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  chart: {
    borderRadius: BorderRadius.md,
  },
  insightsContainer: {
    margin: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  insight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  insightLabel: {
    ...Typography.body,
  },
  insightValue: {
    ...Typography.body,
    fontWeight: 'bold',
  },
});