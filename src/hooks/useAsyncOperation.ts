import { useState, useCallback } from 'react';
import { useErrorHandler, ErrorHandlerOptions } from './useErrorHandler';
import { ApiError } from '../types';

export interface AsyncOperationState<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | null;
  isRetryable: boolean;
}

export interface AsyncOperationOptions extends ErrorHandlerOptions {
  initialData?: any;
  onSuccess?: (data: any) => void;
  onComplete?: () => void;
}

export const useAsyncOperation = <T = any>(options: AsyncOperationOptions = {}) => {
  const { initialData = null, onSuccess, onComplete, ...errorOptions } = options;
  
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: initialData,
    isLoading: false,
    error: null,
    isRetryable: false,
  });

  const { handleError, clearError } = useErrorHandler(errorOptions);

  const execute = useCallback(async (operation: () => Promise<T>): Promise<T | null> => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      isRetryable: false,
    }));

    clearError();

    try {
      const result = await operation();
      
      setState(prev => ({
        ...prev,
        data: result,
        isLoading: false,
        error: null,
        isRetryable: false,
      }));

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (error) {
      const apiError = error as ApiError;
      
      handleError(apiError, 'async operation');
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: apiError,
        isRetryable: isRetryableError(apiError),
      }));

      return null;
    } finally {
      if (onComplete) {
        onComplete();
      }
    }
  }, [handleError, clearError, onSuccess, onComplete]);

  const retry = useCallback(async (operation: () => Promise<T>): Promise<T | null> => {
    if (!state.isRetryable) {
      return null;
    }
    return execute(operation);
  }, [state.isRetryable, execute]);

  const reset = useCallback(() => {
    setState({
      data: initialData,
      isLoading: false,
      error: null,
      isRetryable: false,
    });
    clearError();
  }, [initialData, clearError]);

  return {
    ...state,
    execute,
    retry,
    reset,
    clearError,
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

  return false;
};