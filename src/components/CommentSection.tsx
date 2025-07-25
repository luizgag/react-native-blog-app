import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Comment, User } from '../types';
import { apiService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

interface CommentSectionProps {
  postId: number;
}

interface CommentItemProps {
  comment: Comment;
  author: User | null;
  isLoadingAuthor: boolean;
  onDelete?: (commentId: number) => void;
  canDelete?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, author, isLoadingAuthor, onDelete, canDelete }) => {
  const handleDelete = () => {
    if (!onDelete) return;

    Alert.alert(
      'Excluir Comentário',
      'Tem certeza que deseja excluir este comentário?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => onDelete(comment.id)
        },
      ]
    );
  };

  return (
    <View style={styles.commentItem}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentAuthor}>
          {isLoadingAuthor ? 'Carregando autor...' : (author?.nome || 'Autor desconhecido')}
        </Text>
        <View style={styles.commentActions}>
          {canDelete && (
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.deleteButton}
              accessibilityLabel="Excluir comentário"
              accessibilityRole="button"
            >
              <Icon name="delete" size={16} color="#f44336" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Text style={styles.commentText}>{comment.comentario}</Text>
    </View>
  );
};

export const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for comment authors
  const [commentAuthors, setCommentAuthors] = useState<Record<number, User>>({});
  const [loadingAuthors, setLoadingAuthors] = useState<Set<number>>(new Set());

  // Load comments when component mounts
  useEffect(() => {
    loadComments();
  }, [postId]);

  // Fetch author information for a comment
  const fetchCommentAuthor = useCallback(async (authorId: number) => {
    if (!authorId || commentAuthors[authorId] || loadingAuthors.has(authorId)) {
      return;
    }

    setLoadingAuthors(prev => new Set(prev).add(authorId));

    try {
      const author = await apiService.getUser(authorId);
      setCommentAuthors(prev => ({
        ...prev,
        [authorId]: author
      }));
    } catch (error) {
      console.log('Failed to load comment author:', error);
    } finally {
      setLoadingAuthors(prev => {
        const newSet = new Set(prev);
        newSet.delete(authorId);
        return newSet;
      });
    }
  }, [commentAuthors, loadingAuthors]);

  // Fetch authors for all comments
  useEffect(() => {
    const uniqueAuthorIds = [...new Set(comments.map(comment => comment.author_id))];
    uniqueAuthorIds.forEach(authorId => {
      if (authorId) {
        fetchCommentAuthor(authorId);
      }
    });
  }, [comments, fetchCommentAuthor]);

  const loadComments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const commentsData = await apiService.getComments(postId);
      setComments(commentsData || []);
      // Clear previous author data when loading new comments
      setCommentAuthors({});
      setLoadingAuthors(new Set());
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar comentários';
      setError(errorMessage);
      console.error('Failed to load comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      Alert.alert('Erro', 'Por favor, digite um comentário');
      return;
    }

    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para comentar');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const comment = await apiService.createComment(postId, newComment.trim());

      // Add the new comment to the list
      setComments(prevComments => [comment, ...prevComments]);
      setNewComment('');

      Alert.alert('Sucesso', 'Comentário adicionado com sucesso!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao adicionar comentário';
      setError(errorMessage);
      Alert.alert('Erro', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await apiService.deleteComment(commentId);
      setComments(prevComments => prevComments.filter(c => c.id !== commentId));
      Alert.alert('Sucesso', 'Comentário excluído com sucesso!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir comentário';
      Alert.alert('Erro', errorMessage);
    }
  };

  const renderEmptyComments = () => (
    <View style={styles.emptyContainer}>
      <Icon name="comment" size={48} color="#ccc" />
      <Text style={styles.emptyText}>Nenhum comentário ainda</Text>
      <Text style={styles.emptySubtext}>Seja o primeiro a comentar!</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="comment" size={20} color="#2196F3" />
        <Text style={styles.headerText}>
          Comentários ({comments.length})
        </Text>
      </View>

      {/* Add Comment Form */}
      {user && (
        <View style={styles.addCommentContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Escreva um comentário..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
            numberOfLines={3}
            maxLength={500}
            accessibilityLabel="Campo para novo comentário"
            accessibilityHint="Digite seu comentário aqui"
          />
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!newComment.trim() || isSubmitting) && styles.submitButtonDisabled
            ]}
            onPress={handleAddComment}
            disabled={!newComment.trim() || isSubmitting}
            accessibilityLabel="Enviar comentário"
            accessibilityRole="button"
          >
            {isSubmitting ? (
              <LoadingSpinner size="small" color="#fff" />
            ) : (
              <>
                <Icon name="send" size={16} color="#fff" />
                <Text style={styles.submitButtonText}>Enviar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Comments List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner message="Carregando comentários..." />
        </View>
      ) : error ? (
        <ErrorMessage
          message={error}
          onRetry={loadComments}
          retryText="Tentar Novamente"
        />
      ) : comments.length === 0 ? (
        renderEmptyComments()
      ) : (
        <View style={styles.commentsListContainer}>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              author={commentAuthors[comment.author_id] || null}
              isLoadingAuthor={loadingAuthors.has(comment.author_id)}
              onDelete={handleDeleteComment}
              canDelete={user?.id === comment.author_id}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  addCommentContainer: {
    marginBottom: 20,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    marginBottom: 12,
    minHeight: 80,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    paddingVertical: 20,
  },
  commentItem: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentDate: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  commentText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  editedText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  commentsListContainer: {
    marginTop: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
});