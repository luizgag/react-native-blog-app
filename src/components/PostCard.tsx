import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  AccessibilityRole,
  ActivityIndicator,
} from 'react-native';
import { Post } from '../types';
import { enhancedApiService } from '../services';

interface PostCardProps {
  post: Post;
  onPress: (post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onPress }) => {
  const [authorName, setAuthorName] = useState<string>(post.author || 'Loading author...');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // If we have an author_id, fetch the user data
    if (post.author_id) {
      fetchAuthorName(post.author_id);
    }
  }, [post.author_id]);

  const fetchAuthorName = async (authorId: number) => {
    try {
      setIsLoading(true);
      const userData = await enhancedApiService.getUser(authorId);

      // Check if the response has a name or nome field
      if (userData) {
        const name = userData.name || userData.nome || userData.usuario;
        if (name) {
          setAuthorName(name);
        }
      }
    } catch (error) {
      console.error('Failed to fetch author name:', error);
      // If there's an error, use the author field as fallback
      setAuthorName(post.author || 'Unknown author');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePress = () => {
    onPress(post);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Read post: ${post.title} by ${authorName}`}
      accessibilityHint="Tap to view full post content"
    >
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {post.title}
        </Text>
        <View style={styles.authorContainer}>
          <Text style={styles.author}>By {authorName}</Text>
          {isLoading && <ActivityIndicator size="small" color="#666666" style={styles.loader} />}
        </View>
        <Text style={styles.preview} numberOfLines={3}>
          {post.content}
        </Text>
        {post.createdAt && (
          <Text style={styles.date}>
            {new Date(post.createdAt).toLocaleDateString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: 44, // Accessibility: minimum touch target
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    lineHeight: 24,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  author: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
    marginRight: 8,
  },
  loader: {
    marginLeft: 4,
  },
  preview: {
    fontSize: 14,
    color: '#444444',
    lineHeight: 20,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'right',
  },
});