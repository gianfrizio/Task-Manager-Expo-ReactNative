import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  StyleSheet,
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius, Spacing } from '../styles/theme';
import { Categories } from '../utils/categories';

export const SearchAndFilter = ({ onSearch, onFilterChange, activeFilters = {} }) => {
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (text) => {
    setSearchText(text);
    onSearch(text);
  };

  const toggleFilter = (filterType, value) => {
    const newFilters = { ...activeFilters };
    if (newFilters[filterType] === value) {
      delete newFilters[filterType];
    } else {
      newFilters[filterType] = value;
    }
    onFilterChange(newFilters);
  };

  const priorities = ['low', 'medium', 'high'];
  const statuses = [
    { key: 'completed', label: 'Completate' },
    { key: 'pending', label: 'In Sospeso' },
    { key: 'overdue', label: 'Scadute' }
  ];

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.gray[500]} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cerca attività..."
          value={searchText}
          onChangeText={handleSearch}
        />
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons 
            name="options" 
            size={20} 
            color={showFilters ? Colors.primary : Colors.gray[500]} 
          />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          {/* Categories Filter */}
          <Text style={styles.filterTitle}>Categorie</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {Object.values(Categories).map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.filterChip,
                  { borderColor: category.color },
                  activeFilters.category === category.id && { backgroundColor: category.color }
                ]}
                onPress={() => toggleFilter('category', category.id)}
              >
                <Ionicons 
                  name={category.icon} 
                  size={16} 
                  color={activeFilters.category === category.id ? Colors.white : category.color} 
                />
                <Text style={[
                  styles.filterChipText,
                  { color: activeFilters.category === category.id ? Colors.white : category.color }
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Priority Filter */}
          <Text style={styles.filterTitle}>Priorità</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {priorities.map((priority) => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.filterChip,
                  activeFilters.priority === priority && styles.filterChipActive
                ]}
                onPress={() => toggleFilter('priority', priority)}
              >
                <Text style={[
                  styles.filterChipText,
                  activeFilters.priority === priority && styles.filterChipTextActive
                ]}>
                  {priority === 'low' ? 'Bassa' : priority === 'medium' ? 'Media' : 'Alta'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Status Filter */}
          <Text style={styles.filterTitle}>Stato</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {statuses.map((status) => (
              <TouchableOpacity
                key={status.key}
                style={[
                  styles.filterChip,
                  activeFilters.status === status.key && styles.filterChipActive
                ]}
                onPress={() => toggleFilter('status', status.key)}
              >
                <Text style={[
                  styles.filterChipText,
                  activeFilters.status === status.key && styles.filterChipTextActive
                ]}>
                  {status.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    height: '100%',
  },
  filterButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  filtersContainer: {
    marginTop: Spacing.md,
  },
  filterTitle: {
    ...Typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  filterRow: {
    marginBottom: Spacing.xs,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: BorderRadius.full,
    marginRight: Spacing.xs,
    backgroundColor: Colors.white,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    ...Typography.caption,
    marginLeft: Spacing.xs,
    color: Colors.gray[700],
  },
  filterChipTextActive: {
    color: Colors.white,
  },
});