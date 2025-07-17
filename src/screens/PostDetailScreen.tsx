import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../navigation';

interface PostDetailScreenProps {
  route: RouteProp<MainStackParamList, 'PostDetail'>;
}

export const PostDetailScreen: React.FC<PostDetailScreenProps> = ({ route }) => {
  const { postId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Post Detail Screen</Text>
      <Text style={styles.subtitle}>Post ID: {postId}</Text>
      <Text style={styles.description}>Post details will be displayed here</Text>
    </View>
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