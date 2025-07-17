import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from '../AuthContext';
import { apiService } from '../../services/apiService';
import { STORAGE_KEYS } from '../../config';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock API service
jest.mock('../../services/apiService', () => ({
  apiService: {
    login: jest.fn(),
    logout: jest.fn(),
  },
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('should initialize with loading state', () => {
    mockAsyncStorage.multiGet.mockResolvedValue([
      [STORAGE_KEYS.AUTH_TOKEN, null],
      [STORAGE_KEYS.USER_DATA, null],
    ]);

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
  });

  it('should handle successful login', async () => {
    const mockUser = {
      id: 1,
      name: 'Test Teacher',
      email: 'teacher@test.com',
      role: 'teacher' as const,
      token: 'test-token',
    };

    const mockAuthResponse = {
      user: mockUser,
      token: 'test-token',
    };

    mockApiService.login.mockResolvedValue(mockAuthResponse);
    mockAsyncStorage.multiGet.mockResolvedValue([
      [STORAGE_KEYS.AUTH_TOKEN, null],
      [STORAGE_KEYS.USER_DATA, null],
    ]);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.actions.login('teacher@test.com', 'password');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle login failure', async () => {
    const mockError = new Error('Invalid credentials');
    mockApiService.login.mockRejectedValue(mockError);
    mockAsyncStorage.multiGet.mockResolvedValue([
      [STORAGE_KEYS.AUTH_TOKEN, null],
      [STORAGE_KEYS.USER_DATA, null],
    ]);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      try {
        await result.current.actions.login('teacher@test.com', 'wrong-password');
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Invalid credentials');
  });

  it('should handle logout', async () => {
    // First set up authenticated state
    const mockUser = {
      id: 1,
      name: 'Test Teacher',
      email: 'teacher@test.com',
      role: 'teacher' as const,
      token: 'test-token',
    };

    mockAsyncStorage.multiGet.mockResolvedValue([
      [STORAGE_KEYS.AUTH_TOKEN, 'test-token'],
      [STORAGE_KEYS.USER_DATA, JSON.stringify(mockUser)],
    ]);

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for initial auth check
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Now logout
    await act(async () => {
      await result.current.actions.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(mockApiService.logout).toHaveBeenCalled();
    expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USER_DATA,
    ]);
  });

  it('should restore authentication from storage', async () => {
    const mockUser = {
      id: 1,
      name: 'Test Teacher',
      email: 'teacher@test.com',
      role: 'teacher' as const,
      token: 'test-token',
    };

    mockAsyncStorage.multiGet.mockResolvedValue([
      [STORAGE_KEYS.AUTH_TOKEN, 'test-token'],
      [STORAGE_KEYS.USER_DATA, JSON.stringify(mockUser)],
    ]);

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for auth check to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoading).toBe(false);
  });

  it('should clear error', async () => {
    const mockError = new Error('Test error');
    mockApiService.login.mockRejectedValue(mockError);
    mockAsyncStorage.multiGet.mockResolvedValue([
      [STORAGE_KEYS.AUTH_TOKEN, null],
      [STORAGE_KEYS.USER_DATA, null],
    ]);

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Trigger error
    await act(async () => {
      try {
        await result.current.actions.login('test@test.com', 'password');
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe('Test error');

    // Clear error
    act(() => {
      result.current.actions.clearError();
    });

    expect(result.current.error).toBe(null);
  });
});