import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ProtectedRoute } from '../navigation/ProtectedRoute';
import { usePosts } from '../context/PostsContext';
import { MainNavigationProp, navigationHelpers } from '../navigation/navigationHelpers';
import { ActionButton } from '../components/ActionButton';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { Post } from '../types';

interface PostItemProps {
  post: Post;
  onEdit: (postId: number) => void;
  onDelete: (postId: number) => void;
}

const PostItem: React.FC<PostItemProps> = ({ post, onEdit, onDelete }) => {
  return (
    <View style={styles.postItem}>
      <View style={styles.postHeader}>
        <Text style={styles.postTitle} numberOfLines={2}>
          {post.title}
        </Text>
        <Text style={styles.postAuthor}>by {post.author}</Text>
      </View>
      
      <Text style={styles.postContent} numberOfLines={3}>
        {post.content}
      </Text>
      
      {post.createdAt && (
        <Text style={styles.postDate}>
          Created: {new Date(post.createdAt).toLocaleDateString()}
        </Text>
      )}
      
      <View style={styles.postActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => onEdit(post.id)}
          accessibilityLabel={`Edit post: ${post.title}`}
          accessibilityHint="Tap to edit this post"
          accessibilityRole="button"
        >
          <Icon name="edit" size={20} color="#007AFF" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => onDelete(post.id)}
          accessibilityLabel={`Delete post: ${post.title}`}
          accessibilityHint="Tap to delete this post"
          accessibilityRole="button"
        >
          <Icon name="delete" size={20} color="#E53E3E" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const AdminContent: React.FC = () => {
  const navigation = useNavigation<MainNavigationProp>();
  const { posts, isLoading, error, actions } = usePosts();
  const [refreshing, setRefreshing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    visible: boolean;
    postId: number | null;
    postTitle: string;
  }>({
    visible: false,
    postId: null,
    postTitle: '',
  });

  // Fetch posts on component mount
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      await actions.fetchPosts();
    } catch (error) {
      // Error is handled by context
      console.error('Failed to load posts:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await actions.fetchPosts();
    } catch (error) {
      // Error is handled by context
      console.error('Failed to refresh posts:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreatePost = () => {
    navigationHelpers.navigateToCreatePost(navigation);
  };

  const handleEditPost = (postId: number) => {
    navigationHelpers.navigateToEditPost(navigation, postId);
  };

  const handleDeletePost = (postId: number) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setDeleteDialog({
        visible: true,
        postId,
        postTitle: post.title,
      });
    }
  };

  const confirmDeletePost = async () => {
    if (deleteDialog.postId) {
      try {
        await actions.deletePost(deleteDialog.postId);
        Alert.alert(
          'Success',
          'Post deleted successfully',
          [{ text: 'OK' }]
        );
      } catch (error) {
        Alert.alert(
          'Error',
          'Failed to delete post. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
    setDeleteDialog({ visible: false, postId: null, postTitle: '' });
  };

  const cancelDeletePost = () => {
    setDeleteDialog({ visible: false, postId: null, postTitle: '' });
  };

  const renderPostItem = ({ item }: { item: Post }) => (
    <PostItem
      post={item}
      onEdit={handleEditPost}
      onDelete={handleDeletePost}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="article" size={64} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No Posts Yet</Text>
      <Text style={styles.emptyStateMessage}>
        Create your first blog post to get started
      </Text>
      <ActionButton
        title="Create First Post"
        onPress={handleCreatePost}
        style={styles.emptyStateButton}
      />
    </View>
  );

  if (isLoading && posts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>
          Manage all blog posts ({posts.length} total)
        </Text>
      </View>

      {error && (
        <ErrorMessage
          message={error}
          onRetry={loadPosts}
          style={styles.errorMessage}
        />
      )}

      <View style={styles.createButtonContainer}>
        <ActionButton
          title="Create New Post"
          onPress={handleCreatePost}
          icon={<Icon name="add" size={20} color="#FFFFFF" />}
          fullWidth
        />
      </View>

      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.listContainer,
          posts.length === 0 && styles.emptyListContainer,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#2196F3']}
            tintColor="#2196F3"
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        accessibilityLabel="Posts list"
        accessibilityHint="Swipe down to refresh posts"
      />

      <ConfirmDialog
        visible={deleteDialog.visible}
        title="Delete Post"
        message={`Are you sure you want to delete "${deleteDialog.postTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeletePost}
        onCancel={cancelDeletePost}
        destructive
      />
    </View>
  );
};

export const AdminScreen: React.FC = () => {
  return (
    <ProtectedRoute 
      requiredRole="teacher"
      fallbackMessage="Only teachers can access the admin dashboard."
    >
      <AdminContent />
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  errorMessage: {
    margin: 16,
  },
  createButtonContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  postItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    marginBottom: 8,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  postAuthor: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  postContent: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
    marginBottom: 12,
  },
  postDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    minHeight: 36,
    gap: 4,
  },
  editButton: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#E53E3E',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E53E3E',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  emptyStateButton: {
    minWidth: 200,
  },
});