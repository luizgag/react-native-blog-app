import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../config';
import { AuthUser } from '../../types';

/**
 * Hook for managing authentication data persistence
 * Provides utilities for storing and retrieving auth data from AsyncStorage
 */
export const useAuthPersistence = () => {
  const storeAuthData = useCallback(async (user: AuthUser, token: string): Promise<void> => {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.AUTH_TOKEN, token],
        [STORAGE_KEYS.USER_DATA, JSON.stringify(user)],
      ]);
    } catch (error) {
      console.error('Error storing auth data:', error);
      throw new Error('Failed to store authentication data');
    }
  }, []);

  const getStoredAuthData = useCallback(async (): Promise<{ user: AuthUser; token: string } | null> => {
    try {
      const [tokenResult, userResult] = await AsyncStorage.multiGet([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);

      const token = tokenResult[1];
      const userDataString = userResult[1];

      if (token && userDataString) {
        const user: AuthUser = JSON.parse(userDataString);
        return { user, token };
      }

      return null;
    } catch (error) {
      console.error('Error retrieving stored auth data:', error);
      return null;
    }
  }, []);

  const clearStoredAuthData = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
    } catch (error) {
      console.error('Error clearing stored auth data:', error);
      throw new Error('Failed to clear authentication data');
    }
  }, []);

  const hasStoredAuthData = useCallback(async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      return !!token;
    } catch (error) {
      console.error('Error checking for stored auth data:', error);
      return false;
    }
  }, []);

  return {
    storeAuthData,
    getStoredAuthData,
    clearStoredAuthData,
    hasStoredAuthData,
  };
};