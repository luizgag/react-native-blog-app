import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../navigation';
import { ProtectedRoute } from '../navigation/ProtectedRoute';

interface EditPostContentProps {
  route: RouteProp<MainStackParamList, 'EditPost'>;
}

const EditPostContent: React.FC<EditPostContentProps> = ({ route }) => {
  const { postId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Post Screen</Text>
      <Text style={styles.subtitle}>Post ID: {postId}</Text>
      <Text style={styles.description}>Post editing form will be here</Text>
    </View>
  );
};

interface EditPostScreenProps {
  route: RouteProp<MainStackParamList, 'EditPost'>;
}

export const EditPostScreen: React.FC<EditPostScreenProps> = ({ route }) => {
  return (
    <ProtectedRoute 
      requiredRole="teacher"
      fallbackMessage="Only teachers can edit posts."
    >
      <EditPostContent route={route} />
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