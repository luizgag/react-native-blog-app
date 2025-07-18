import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { PostsProvider } from './src/context/PostsContext';
import { TeachersProvider } from './src/context/TeachersContext';
import { StudentsProvider } from './src/context/StudentsContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { NetworkStatusIndicator } from './src/components/NetworkStatusIndicator';
import { NetworkStatusService } from './src/services/networkStatusService';

export default function App() {
  useEffect(() => {
    // Initialize network status service
    NetworkStatusService.initialize().catch(console.error);
  }, []);

  const handleGlobalError = (error: Error, errorInfo: string) => {
    // Log to crash reporting service (e.g., Crashlytics, Sentry)
    console.error('Global error caught by ErrorBoundary:', error);
    console.error('Error info:', errorInfo);
    
    // You can integrate with crash reporting services here
    // Example: crashlytics().recordError(error);
  };

  return (
    <ErrorBoundary onError={handleGlobalError}>
      <SafeAreaProvider>
        <AuthProvider>
          <PostsProvider>
            <TeachersProvider>
              <StudentsProvider>
                <AppNavigator />
                <NetworkStatusIndicator />
                <StatusBar style="auto" />
              </StudentsProvider>
            </TeachersProvider>
          </PostsProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
