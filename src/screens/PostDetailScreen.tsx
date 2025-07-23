import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { MainStackParamList } from '../navigation';
import { usePosts } from '../context/PostsContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

interface PostDetailScreenProps {
  route: RouteProp<MainStackParamList, 'PostDetail'>;
}

export const PostDetailScreen: React.FC<PostDetailScreenProps> = ({ route }) => {
  const { postId } = route.params;
  const {
    currentPost,
    isLoading,
    error,
    actions: {
      fetchPost,
      clearCurrentPost,
      clearError,
    },
  } = usePosts();

  // Fetch post when component mounts or postId changes
  useEffect(() => {
    const loadPost = async () => {
      try {
        await fetchPost(postId);
      } catch (error) {
        // Error is handled by context
        console.log('Failed to load post:', error);
      }
    };

    loadPost();
  }, [postId, fetchPost]);

  // Clear current post when component unmounts
  useFocusEffect(
    useCallback(() => {
      return () => {
        clearCurrentPost();
      };
    }, [clearCurrentPost])
  );

  // Handle retry
  const handleRetry = useCallback(async () => {
    clearError();
    try {
      await fetchPost(postId);
    } catch (error) {
      // Error is handled by context
      console.log('Retry failed:', error);
    }
  }, [fetchPost, postId, clearError]);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    try {
      await fetchPost(postId);
    } catch (error) {
      // Error is handled by context
      console.log('Failed to refresh post:', error);
    }
  }, [fetchPost, postId]);

  // Show loading state
  if (isLoading && !currentPost) {
    return (
      <View style={styles.centerContainer}>
        <LoadingSpinner message="Carregando post..." />
      </View>
    );
  }

  // Show error state
  if (error && !currentPost) {
    return (
      <View style={styles.centerContainer}>
        <ErrorMessage
          message={error}
          onRetry={handleRetry}
        />
      </View>
    );
  }

  // Show not found state
  if (!currentPost && !isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ErrorMessage
          message="Post não encontrado"
          onRetry={handleRetry}
          retryText="Tentar Novamente"
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={onRefresh}
          colors={['#2196F3']}
          tintColor="#2196F3"
        />
      }
      showsVerticalScrollIndicator={false}
      accessibilityLabel="Conteúdo do post"
      accessibilityHint="Deslize para baixo para atualizar o conteúdo do post"
    >
      {currentPost && (
        <View style={styles.postContainer}>
          <Text
            style={styles.title}
            accessibilityRole="header"
            accessibilityLabel={`Título do post: ${currentPost.title}`}
          >
            {currentPost.title}
          </Text>
          
          <View style={styles.metaContainer}>
            <Text
              style={styles.author}
              accessibilityLabel={`Autor: ${currentPost.author || 'Autor desconhecido'}`}
            >
              Por {currentPost.author || 'Autor desconhecido'}
            </Text>
            {currentPost.createdAt && (
              <Text
                style={styles.date}
                accessibilityLabel={`Publicado em ${new Date(currentPost.createdAt).toLocaleDateString()}`}
              >
                {new Date(currentPost.createdAt).toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            )}
          </View>
          
          <View style={styles.divider} />
          
          <Text
            style={styles.content}
            accessibilityLabel="Conteúdo do post"
            accessibilityRole="text"
          >
            {currentPost.content}
          </Text>
          
          {currentPost.updatedAt && currentPost.updatedAt !== currentPost.createdAt && (
            <Text
              style={styles.updatedDate}
              accessibilityLabel={`Última atualização em ${new Date(currentPost.updatedAt).toLocaleDateString()}`}
            >
              Última atualização: {new Date(currentPost.updatedAt).toLocaleDateString('pt-BR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    flexGrow: 1,
  },
  postContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: 36,
    marginBottom: 16,
  },
  metaContainer: {
    marginBottom: 20,
  },
  author: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#666666',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: 20,
  },
  content: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
    textAlign: 'left',
  },
  updatedDate: {
    fontSize: 12,
    color: '#888888',
    fontStyle: 'italic',
    marginTop: 20,
    textAlign: 'right',
  },
});