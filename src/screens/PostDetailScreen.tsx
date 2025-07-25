import React, { useEffect, useCallback, useState } from 'react';
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
import { CommentSection } from '../components/CommentSection';
import { apiService } from '../services/apiService';
import { User } from '../types';

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

  // State for author information
  const [postAuthor, setPostAuthor] = useState<User | null>(null);
  const [isLoadingAuthor, setIsLoadingAuthor] = useState(false);

  // Fetch author information
  const fetchAuthor = useCallback(async (authorId: number) => {
    if (!authorId) return;
    
    setIsLoadingAuthor(true);
    try {
      const author = await apiService.getUser(authorId);
      setPostAuthor(author);
    } catch (error) {
      console.log('Failed to load author:', error);
      setPostAuthor(null);
    } finally {
      setIsLoadingAuthor(false);
    }
  }, []);

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

  // Fetch author when post is loaded
  useEffect(() => {
    if (currentPost?.author_id) {
      fetchAuthor(currentPost.author_id);
    } else {
      setPostAuthor(null);
    }
  }, [currentPost?.author_id, fetchAuthor]);

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
    setPostAuthor(null);
    try {
      await fetchPost(postId);
    } catch (error) {
      // Error is handled by context
      console.log('Retry failed:', error);
    }
  }, [fetchPost, postId, clearError]);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setPostAuthor(null);
    try {
      await fetchPost(postId);
    } catch (error) {
      // Error is handled by context
      console.log('Failed to refresh post:', error);
    }
  }, [fetchPost, postId]);

  // Show loading state
  if ((isLoading || isLoadingAuthor) && !currentPost) {
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
      contentContainerStyle={styles.scrollContentContainer}
      refreshControl={
        <RefreshControl
          refreshing={isLoading || isLoadingAuthor}
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
          {/* Post Header */}
          <View style={styles.postHeader}>
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
                accessibilityLabel={`Autor: ${postAuthor?.nome || 'Carregando autor...'}`}
              >
                Por {postAuthor?.nome || (isLoadingAuthor ? 'Carregando autor...' : 'Autor desconhecido')}
              </Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          {/* Post Content */}
          <View style={styles.contentContainer}>
            <Text
              style={styles.content}
              accessibilityLabel="Conteúdo do post"
              accessibilityRole="text"
            >
              {currentPost.content}
            </Text>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsContainer}>
            <CommentSection postId={postId} />
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  postContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  postHeader: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    lineHeight: 36,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
  },
  author: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  date: {
    fontSize: 14,
    color: '#666666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subjectTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  subjectText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 20,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 24,
  },
  content: {
    fontSize: 17,
    color: '#333333',
    lineHeight: 26,
    textAlign: 'left',
  },
  updatedDate: {
    fontSize: 12,
    color: '#888888',
    fontStyle: 'italic',
    marginTop: 24,
    textAlign: 'right',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  commentsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});