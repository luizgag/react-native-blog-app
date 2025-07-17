import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProtectedRoute } from '../navigation/ProtectedRoute';

const CreateStudentContent: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Student</Text>
      <Text style={styles.subtitle}>Student creation form will be here</Text>
    </View>
  );
};

export const CreateStudentScreen: React.FC = () => {
  return (
    <ProtectedRoute 
      requiredRole="teacher"
      fallbackMessage="Only teachers can add new students."
    >
      <CreateStudentContent />
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});