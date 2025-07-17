import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../navigation';
import { ProtectedRoute } from '../navigation/ProtectedRoute';

interface EditStudentContentProps {
  route: RouteProp<MainStackParamList, 'EditStudent'>;
}

const EditStudentContent: React.FC<EditStudentContentProps> = ({ route }) => {
  const { studentId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Student</Text>
      <Text style={styles.subtitle}>Student ID: {studentId}</Text>
      <Text style={styles.description}>Student editing form will be here</Text>
    </View>
  );
};

interface EditStudentScreenProps {
  route: RouteProp<MainStackParamList, 'EditStudent'>;
}

export const EditStudentScreen: React.FC<EditStudentScreenProps> = ({ route }) => {
  return (
    <ProtectedRoute 
      requiredRole="teacher"
      fallbackMessage="Only teachers can edit student information."
    >
      <EditStudentContent route={route} />
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
    fontSize: 18,
    color: '#2196F3',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});