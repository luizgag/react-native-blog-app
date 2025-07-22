import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  AuthContextValue, 
  AuthContextState, 
  AuthAction
} from '../types/context';
import { AuthUser } from '../types';
import { enhancedApiService } from '../services';
import { STORAGE_KEYS } from '../config';

// Initial state
const initialState: AuthContextState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to check stored auth
  error: null,
};

// Auth reducer
const authReducer = (state: AuthContextState, action: AuthAction): AuthContextState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    
    case 'CHECK_AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    
    case 'CHECK_AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    
    case 'CHECK_AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on app start and setup token expiration callback
  useEffect(() => {
    checkAuthStatus();
    
    // Set up callback for when token expires
    enhancedApiService.setTokenExpiredCallback(handleTokenExpired);
  }, []);

  const checkAuthStatus = async (): Promise<void> => {
    dispatch({ type: 'CHECK_AUTH_START' });
    
    try {
      const [token, userData] = await AsyncStorage.multiGet([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);

      const authToken = token[1];
      const userDataString = userData[1];

      if (authToken && userDataString) {
        const user: AuthUser = JSON.parse(userDataString);
        
        // Verify token is still valid by making a test API call
        // This could be a simple endpoint like /auth/verify or /auth/me
        try {
          // For now, we'll assume the token is valid if it exists
          // In a real app, you might want to verify with the server
          dispatch({ type: 'CHECK_AUTH_SUCCESS', payload: user });
        } catch (error) {
          // Token is invalid, clear stored data
          await clearStoredAuthData();
          dispatch({ type: 'CHECK_AUTH_FAILURE' });
        }
      } else {
        dispatch({ type: 'CHECK_AUTH_FAILURE' });
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      dispatch({ type: 'CHECK_AUTH_FAILURE' });
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Transform password to senha for backend API
      const response = await enhancedApiService.login({ email, senha: password });
      const { user, token } = response;
      
      // Create AuthUser object with token
      const authUser: AuthUser = {
        ...user,
        token,
      };
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: authUser });
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed. Please try again.';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error; // Re-throw to allow components to handle
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await enhancedApiService.logout();
    } catch (error) {
      console.warn('Logout API call failed:', error);
      // Continue with logout even if API call fails
    } finally {
      await clearStoredAuthData();
      dispatch({ type: 'LOGOUT' });
    }
  };

  const handleTokenExpired = async (): Promise<void> => {
    // Clear auth data and update state without making API call
    // since we already know the token is expired
    await clearStoredAuthData();
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const clearStoredAuthData = async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
    } catch (error) {
      console.error('Error clearing stored auth data:', error);
    }
  };

  const contextValue: AuthContextValue = {
    ...state,
    actions: {
      login,
      logout,
      clearError,
      checkAuthStatus,
      handleTokenExpired,
    },
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export context for testing purposes
export { AuthContext };