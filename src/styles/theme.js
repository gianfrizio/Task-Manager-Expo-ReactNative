export const Colors = {
  primary: '#3B82F6',
  secondary: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  dark: '#1F2937',
  light: '#F9FAFB',
  white: '#FFFFFF',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  }
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.dark,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.dark,
  },
  body: {
    fontSize: 16,
    color: Colors.gray[700],
  },
  caption: {
    fontSize: 14,
    color: Colors.gray[500],
  }
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
};