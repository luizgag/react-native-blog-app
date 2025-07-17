import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProtectedRoute } from '../navigation/ProtectedRoute';

const TeacherListContent: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teacher Management</Text>
      <Text style={styles.subtitle}>Teacher list will be displayed here</Text>
    </View>
  );
};

export const TeacherListScreen: React.FC = () => {
  return (
    <ProtectedRoute 
      requiredRole="teacher"
      fallbackMessage="Only teachers can manage other teachers."
    >
      <TeacherListContent />
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