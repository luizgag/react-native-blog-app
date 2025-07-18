import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useAsyncOperation } from '../hooks/useAsyncOperation';
import { ApiError } from '../types';

export const ErrorHandlingDemoScreen: React.FC = () => {
  const { isOnline, isConnected, type } = useNetworkStatus();
  const [demoLoading, setDemoLoading] = useState(false);
  
  const { error, handleError, clearError, getErrorMessage } = useErrorHandler({
    showToast: true,
    logError: true,
    retryable: true,
  });

  const asyncOp = useAsyncOperation<string>({
    onSuccess: (data) => console.log('Async operation succeeded:', data),
    onComplete: () => console.log('Async operation completed'),
  });

  // Simulate different types of errors
  const simulateNetworkError = () => {
    const networkError: ApiError = {
      message: 'Network request failed',
      code: 'NETWORK_ERROR',
    };
    handleError(networkError, 'network simulation');
  };

  const simulateServerError = () => {
    const serverError: ApiError = {
      message: 'Internal server error',
      code: 'SERVER_ERROR',
      status: 500,
    };
    handleError(serverError, 'server simulation');
  };

  const simulateAuthError = () => {
    const authError: ApiError = {
      message: 'Authentication required',
      code: 'UNAUTHORIZED',
      status: 401,
    };
    handleError(authError, 'auth simulation');
  };

  const simulateLoadingState = async () => {
    setDemoLoading(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setDemoLoading(false);
  };

  const simulateAsyncOperation = async () => {
    await asyncOp.execute(async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Randomly succeed or fail
      if (Math.random() > 0.5) {
        return 'Operation completed successfully!';
      } else {
        throw new Error('Random operation failure');
      }
    });
  };

  const simulateRetryableOperation = async () => {
    await asyncOp.execute(async () => {
      // Simulate network-dependent operation
      if (!isOnline) {
        const offlineError: ApiError = {
          message: 'No internet connection',
          code: 'NETWORK_ERROR',
        };
        throw offlineError;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      return 'Network operation completed!';
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Network Status</Text>
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            Status: {isOnline ? '🟢 Online' : '🔴 Offline'}
          </Text>
          <Text style={styles.statusText}>
            Connected: {isConnected ? 'Yes' : 'No'}
          </Text>
          <Text style={styles.statusText}>
            Connection Type: {type}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Error Simulation</Text>
        <TouchableOpacity style={styles.button} onPress={simulateNetworkError}>
          <Text style={styles.buttonText}>Simulate Network Error</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={simulateServerError}>
          <Text style={styles.buttonText}>Simulate Server Error</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={simulateAuthError}>
          <Text style={styles.buttonText}>Simulate Auth Error</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={clearError}>
          <Text style={styles.buttonText}>Clear Error</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.section}>
          <ErrorMessage
            message={getErrorMessage() || 'Unknown error'}
            onRetry={clearError}
            retryText="Clear Error"
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Loading States</Text>
        <TouchableOpacity style={styles.button} onPress={simulateLoadingState}>
          <Text style={styles.buttonText}>Simulate Loading (3s)</Text>
        </TouchableOpacity>
        
        {demoLoading && (
          <View style={styles.loadingDemo}>
            <LoadingSpinner message="Demo loading state..." />
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Async Operations</Text>
        <TouchableOpacity style={styles.button} onPress={simulateAsyncOperation}>
          <Text style={styles.buttonText}>Random Async Operation</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={simulateRetryableOperation}>
          <Text style={styles.buttonText}>Network-Dependent Operation</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={asyncOp.reset}>
          <Text style={styles.buttonText}>Reset Async State</Text>
        </TouchableOpacity>

        {asyncOp.isLoading && (
          <View style={styles.loadingDemo}>
            <LoadingSpinner size="small" message="Async operation in progress..." />
          </View>
        )}

        {asyncOp.error && (
          <ErrorMessage
            message={asyncOp.error.message}
            onRetry={asyncOp.isRetryable ? () => simulateRetryableOperation() : undefined}
            retryText="Retry Operation"
          />
        )}

        {asyncOp.data && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>✅ {asyncOp.data}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Loading Spinner Variants</Text>
        <View style={styles.spinnerContainer}>
          <LoadingSpinner size="small" />
          <Text style={styles.spinnerLabel}>Small</Text>
        </View>
        <View style={styles.spinnerContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.spinnerLabel}>Large</Text>
        </View>
        <View style={styles.spinnerContainer}>
          <LoadingSpinner size="large" message="With message" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Error Message Variants</Text>
        <ErrorMessage
          message="This is an error message"
          type="error"
        />
        <ErrorMessage
          message="This is a warning message"
          type="warning"
        />
        <ErrorMessage
          message="This is an info message"
          type="info"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  section: {
    margin: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  statusContainer: {
    gap: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#666666',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginVertical: 4,
    minHeight: 44,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingDemo: {
    marginVertical: 16,
  },
  successContainer: {
    backgroundColor: '#D4EDDA',
    borderColor: '#C3E6CB',
    borderWidth: 1,
    padding: 12,
    borderRadius: 6,
    marginVertical: 8,
  },
  successText: {
    color: '#155724',
    fontSize: 14,
    textAlign: 'center',
  },
  spinnerContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  spinnerLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#666666',
  },
});