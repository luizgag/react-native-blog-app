import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { PostsProvider } from './src/context/PostsContext';
import { TeachersProvider } from './src/context/TeachersContext';
import { StudentsProvider } from './src/context/StudentsContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PostsProvider>
          <TeachersProvider>
            <StudentsProvider>
              <AppNavigator />
              <StatusBar style="auto" />
            </StudentsProvider>
          </TeachersProvider>
        </PostsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
