export const Categories = {
  WORK: { id: 'work', name: 'Lavoro', icon: 'briefcase', color: '#3B82F6' },
  PERSONAL: { id: 'personal', name: 'Personale', icon: 'person', color: '#10B981' },
  HEALTH: { id: 'health', name: 'Salute', icon: 'fitness', color: '#EF4444' },
  SHOPPING: { id: 'shopping', name: 'Shopping', icon: 'bag', color: '#F59E0B' },
  STUDY: { id: 'study', name: 'Studio', icon: 'school', color: '#8B5CF6' },
  FAMILY: { id: 'family', name: 'Famiglia', icon: 'people', color: '#EC4899' },
  OTHER: { id: 'other', name: 'Altro', icon: 'ellipsis-horizontal', color: '#6B7280' },
};

export const getCategoryById = (id) => {
  return Object.values(Categories).find(cat => cat.id === id) || Categories.OTHER;
};