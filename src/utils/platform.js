import { Platform } from 'react-native';

export const PlatformUtils = {
  isWeb: Platform.OS === 'web',
  isMobile: Platform.OS === 'ios' || Platform.OS === 'android',
  
  // Feature support checks
  supportsNotifications: Platform.OS !== 'web',
  supportsVoiceRecording: Platform.OS !== 'web',
  supportsHaptics: Platform.OS !== 'web',
  supportsBiometrics: Platform.OS !== 'web',
  
  // Style utilities for cross-platform shadows
  getShadowStyle: (shadowConfig = {}) => {
    const {
      shadowColor = '#000',
      shadowOffset = { width: 0, height: 2 },
      shadowOpacity = 0.1,
      shadowRadius = 4,
      elevation = 3,
    } = shadowConfig;

    if (Platform.OS === 'web') {
      const { width, height } = shadowOffset;
      return {
        boxShadow: `${width}px ${height}px ${shadowRadius}px rgba(0, 0, 0, ${shadowOpacity})`,
      };
    }

    return {
      shadowColor,
      shadowOffset,
      shadowOpacity,
      shadowRadius,
      elevation,
    };
  },

  // Performance optimizations
  getAnimationScale: () => {
    // Reduce animations on web for better performance
    return Platform.OS === 'web' ? 0.8 : 1;
  },

  // Network utilities
  getStoragePrefix: () => {
    return Platform.OS === 'web' ? 'web_' : 'mobile_';
  },
};

export default PlatformUtils;