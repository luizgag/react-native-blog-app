import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../navigation';
import { ProtectedRoute } from '../navigation/ProtectedRoute';

interface EditTeacherContentProps {
  route: RouteProp<MainStackParamList, 'EditTeacher'>;
}

const EditTeacherContent: React.FC<EditTeacherContentProps> = ({ route }) => {
  const { teacherId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Teacher</Text>
      <Text style={styles.subtitle}>Teacher ID: {teacherId}</Text>
      <Text style={styles.description}>Teacher editing form will be here</Text>
    </View>
  );
};

interface EditTeacherScreenProps {
  route: RouteProp<MainStackParamList, 'EditTeacher'>;
}

export const EditTeacherScreen: React.FC<EditTeacherScreenProps> = ({ route }) => {
  return (
    <ProtectedRoute 
      requiredRole="teacher"
      fallbackMessage="Only teachers can edit teacher information."
    >
      <EditTeacherContent route={route} />
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