import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { AuthScreensDemo } from './src/screens/AuthScreensDemo';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AuthScreensDemo />
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
