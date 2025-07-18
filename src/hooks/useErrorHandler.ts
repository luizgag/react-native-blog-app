import { useState, useCallback } from 'react';
import { ApiError } from '../types';
import { NetworkStatusService } from '../services/networkStatusService';

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  retryable?: boolean;
  onError?: (error: ApiError) => void;
}

export interface ErrorState {
  error: ApiError | null;
  isRetryable: boolean;
  retryCount: number;
}

export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const {
    showToast = true,
    logError = true,
    retryable = true,
    onError,
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isRetryable: false,
    retryCount: 0,
  });

  const handleError = useCallback((error: ApiError | Error, context?: string) => {
    let apiError: ApiError;

    // Convert Error to ApiError if needed
    if (error instanceof Error) {
      apiError = {
        message: error.message,
        code: 'UNKNOWN_ERROR',
      };
    } else {
      apiError = error;
    }

    // Log error if enabled
    if (logError) {
      console.error(`Error in ${context || 'unknown context'}:`, apiError);
    }

    // Determine if error is retryable
    const isRetryable = retryable && isRetryableError(apiError);

    // Update error state
    setErrorState(prev => ({
      error: apiError,
      isRetryable,
      retryCount: prev.error?.message === apiError.message ? prev.retryCount + 1 : 0,
    }));

    // Call custom error handler
    if (onError) {
      onError(apiError);
    }

    // Show toast if enabled (you might want to integrate with a toast library)
    if (showToast) {
      // For now, we'll just log to console
      // In a real app, you'd integrate with react-native-toast-message or similar
      console.warn('Toast:', getErrorMessage(apiError));
    }
  }, [showToast, logError, retryable, onError]);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isRetryable: false,
      retryCount: 0,
    });
  }, []);

  const retry = useCallback(async (operation: () => Promise<any>) => {
    if (!errorState.isRetryable) {
      return;
    }

    clearError();
    
    try {
      return await operation();
    } catch (error) {
      handleError(error as ApiError, 'retry operation');
      throw error;
    }
  }, [errorState.isRetryable, clearError, handleError]);

  return {
    ...errorState,
    handleError,
    clearError,
    retry,
    getErrorMessage: () => errorState.error ? getErrorMessage(errorState.error) : null,
  };
};

const isRetryableError = (error: ApiError): boolean => {
  // Network errors are retryable
  if (error.code === 'NETWORK_ERROR') {
    return true;
  }

  // 5xx server errors are retryable
  if (error.status && error.status >= 500) {
    return true;
  }

  // Timeout errors are retryable
  if (error.code === 'TIMEOUT_ERROR') {
    return true;
  }

  // Check if we're offline - if so, make it retryable
  if (!NetworkStatusService.isOnline()) {
    return true;
  }

  return false;
};

const getErrorMessage = (error: ApiError): string => {
  // Provide user-friendly error messages
  switch (error.code) {
    case 'NETWORK_ERROR':
      return 'Please check your internet connection and try again.';
    case 'TIMEOUT_ERROR':
      return 'The request timed out. Please try again.';
    case 'UNAUTHORIZED':
      return 'You need to log in to access this feature.';
    case 'FORBIDDEN':
      return 'You don\'t have permission to perform this action.';
    case 'NOT_FOUND':
      return 'The requested resource was not found.';
    default:
      if (error.status && error.status >= 500) {
        return 'Server error. Please try again later.';
      }
      return error.message || 'An unexpected error occurred.';
  }
};