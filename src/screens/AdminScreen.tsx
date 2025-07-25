import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
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
import { enhancedApiService } from '../services';

interface PostItemProps {
  post: Post;
  onEdit: (postId: number) => void;
  onDelete: (postId: number) => void;
}

const PostItem: React.FC<PostItemProps> = ({ post, onEdit, onDelete }) => {
  const [authorName, setAuthorName] = useState<string>(post.author || 'Autor desconhecido');
  const [isLoadingAuthor, setIsLoadingAuthor] = useState<boolean>(false);

  useEffect(() => {
    // If we have an author_id, fetch the user data
    if (post.author_id) {
      fetchAuthorName(post.author_id);
    }
  }, [post.author_id]);

  const fetchAuthorName = async (authorId: number) => {
    try {
      setIsLoadingAuthor(true);
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
      setAuthorName(post.author || 'Autor desconhecido');
    } finally {
      setIsLoadingAuthor(false);
    }
  };

  return (
    <View style={styles.postItem}>
      <View style={styles.postHeader}>
        <Text style={styles.postTitle} numberOfLines={2}>
          {post.title}
        </Text>
        <View style={styles.authorContainer}>
          <Text style={styles.postAuthor}>por {authorName}</Text>
          {isLoadingAuthor && <ActivityIndicator size="small" color="#666666" style={styles.authorLoader} />}
        </View>
      </View>
      
      <Text style={styles.postContent} numberOfLines={3}>
        {post.content}
      </Text>
      
      <View style={styles.postActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => post.id && onEdit(post.id)}
          accessibilityLabel={`Editar post: ${post.title}`}
          accessibilityHint="Toque para editar este post"
          accessibilityRole="button"
        >
          <Icon name="edit" size={20} color="#007AFF" />
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => post.id && onDelete(post.id)}
          accessibilityLabel={`Excluir post: ${post.title}`}
          accessibilityHint="Toque para excluir este post"
          accessibilityRole="button"
        >
          <Icon name="delete" size={20} color="#E53E3E" />
          <Text style={styles.deleteButtonText}>Excluir</Text>
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
    if (post && post.id) {
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
          'Sucesso',
          'Post excluído com sucesso',
          [{ text: 'OK' }]
        );
      } catch (error) {
        Alert.alert(
          'Erro',
          'Falha ao excluir post. Tente novamente.',
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
      <Text style={styles.emptyStateTitle}>Nenhum Post Ainda</Text>
      <Text style={styles.emptyStateMessage}>
        Crie seu primeiro post do blog para começar
      </Text>
      <ActionButton
        title="Criar Primeiro Post"
        onPress={handleCreatePost}
        style={styles.emptyStateButton}
      />
    </View>
  );

  if (isLoading && posts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <Text style={styles.loadingText}>Carregando posts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Painel Administrativo</Text>
        <Text style={styles.subtitle}>
          Gerencie todos os posts do blog ({posts.length} total)
        </Text>
      </View>

      {error && (
        <View style={styles.errorMessage}>
          <ErrorMessage
            message={error}
            onRetry={loadPosts}
          />
        </View>
      )}

      <View style={styles.createButtonContainer}>
        <ActionButton
          title="Criar Novo Post"
          onPress={handleCreatePost}
          icon={<Icon name="add" size={20} color="#FFFFFF" />}
          fullWidth
        />
      </View>

      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id?.toString() || `post-${Math.random()}`}
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
        accessibilityLabel="Lista de posts"
        accessibilityHint="Deslize para baixo para atualizar os posts"
      />

      <ConfirmDialog
        visible={deleteDialog.visible}
        title="Excluir Post"
        message={`Tem certeza de que deseja excluir "${deleteDialog.postTitle}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
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
      fallbackMessage="Apenas professores podem acessar o painel administrativo."
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
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postAuthor: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginRight: 8,
  },
  authorLoader: {
    marginLeft: 4,
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