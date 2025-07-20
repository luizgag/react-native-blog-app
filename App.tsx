import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from './src/context/AppContext';
import { AuthProvider } from './src/context/AuthContext';
import { PostsProvider } from './src/context/PostsContext';
import { TeachersProvider } from './src/context/TeachersContext';
import { StudentsProvider } from './src/context/StudentsContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { ToastContainer } from './src/components/ToastContainer';
import { NetworkStatusIndicator } from './src/components/NetworkStatusIndicator';

// Development mode API testing
if (__DEV__) {
  // Uncomment the line below to run API tests on app startup (for development only)
  import('./src/utils/apiTest').then(({ quickApiTest }) => quickApiTest());
}

// Connected ToastContainer component that uses AppContext
const ConnectedToastContainer: React.FC = () => {
  const { toasts, actions } = useApp();

  return (
    <ToastContainer
      toasts={toasts}
      onHideToast={actions.hideToast}
    />
  );
};

// Main app content that needs to be inside AppProvider
const AppContent: React.FC = () => {
  return (
    <AuthProvider>
      <PostsProvider>
        <TeachersProvider>
          <StudentsProvider>
            <NetworkStatusIndicator />
            <AppNavigator />
            <ConnectedToastContainer />
            <StatusBar style="auto" />
          </StudentsProvider>
        </TeachersProvider>
      </PostsProvider>
    </AuthProvider>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
