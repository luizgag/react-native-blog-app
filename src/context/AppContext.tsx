import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { AppContextState, AppContextActions, AppContextValue, ToastMessage } from '../types';

// Initial state
const initialState: AppContextState = {
  isOnline: true,
  toasts: [],
  theme: 'light',
};

// Action types
type AppAction =
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'SHOW_TOAST'; payload: ToastMessage }
  | { type: 'HIDE_TOAST'; payload: string }
  | { type: 'TOGGLE_THEME' };

// Reducer
const appReducer = (state: AppContextState, action: AppAction): AppContextState => {
  switch (action.type) {
    case 'SET_ONLINE_STATUS':
      return {
        ...state,
        isOnline: action.payload,
      };
    
    case 'SHOW_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, action.payload],
      };
    
    case 'HIDE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.payload),
      };
    
    case 'TOGGLE_THEME':
      return {
        ...state,
        theme: state.theme === 'light' ? 'dark' : 'light',
      };
    
    default:
      return state;
  }
};

// Context
const AppContext = createContext<AppContextValue | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Generate unique ID for toasts
  const generateToastId = useCallback(() => {
    return `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Actions
  const actions: AppContextActions = {
    showToast: useCallback((toast: Omit<ToastMessage, 'id'>) => {
      const toastWithId: ToastMessage = {
        ...toast,
        id: generateToastId(),
      };
      dispatch({ type: 'SHOW_TOAST', payload: toastWithId });
    }, [generateToastId]),

    hideToast: useCallback((id: string) => {
      dispatch({ type: 'HIDE_TOAST', payload: id });
    }, []),

    setOnlineStatus: useCallback((isOnline: boolean) => {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: isOnline });
    }, []),

    toggleTheme: useCallback(() => {
      dispatch({ type: 'TOGGLE_THEME' });
    }, []),
  };

  const value: AppContextValue = {
    ...state,
    actions,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the context
export const useApp = (): AppContextValue => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Convenience hooks for specific actions
export const useToast = () => {
  const { actions } = useApp();
  
  const showSuccess = useCallback((message: string, title?: string) => {
    actions.showToast({
      type: 'success',
      message,
      title,
    });
  }, [actions]);

  const showError = useCallback((message: string, title?: string) => {
    actions.showToast({
      type: 'error',
      message,
      title,
    });
  }, [actions]);

  const showWarning = useCallback((message: string, title?: string) => {
    actions.showToast({
      type: 'warning',
      message,
      title,
    });
  }, [actions]);

  const showInfo = useCallback((message: string, title?: string) => {
    actions.showToast({
      type: 'info',
      message,
      title,
    });
  }, [actions]);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};