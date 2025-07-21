// Configuration constants for the app

// Network configuration with Android emulator support
const getBaseUrl = () => {
  // For Android emulator, use 10.0.2.2 to access host machine
  // For iOS simulator and web, use localhost
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    // Check if running on Android
    const Platform = require('react-native').Platform;
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3001/api';
    }
  }
  return 'http://localhost:3001/api';
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  FALLBACK_URLS: [
    'http://localhost:3001/api',
    'http://10.0.2.2:3001/api',
    'http://127.0.0.1:3001/api'
  ],
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  RETRY_BACKOFF_MULTIPLIER: 2,
  CONNECTION_TIMEOUT: 5000,
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@blog_app_auth_token',
  USER_DATA: '@blog_app_user_data',
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
};

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_TITLE_LENGTH: 100,
  MAX_CONTENT_LENGTH: 5000,
};

export const COLORS = {
  PRIMARY: '#007AFF',
  SECONDARY: '#5856D6',
  SUCCESS: '#34C759',
  WARNING: '#FF9500',
  ERROR: '#FF3B30',
  BACKGROUND: '#F2F2F7',
  SURFACE: '#FFFFFF',
  TEXT_PRIMARY: '#000000',
  TEXT_SECONDARY: '#8E8E93',
};