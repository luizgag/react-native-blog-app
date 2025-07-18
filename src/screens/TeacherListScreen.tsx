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
import { useTeachers } from '../context/TeachersContext';
import { MainNavigationProp, navigationHelpers } from '../navigation/navigationHelpers';
import { ActionButton } from '../components/ActionButton';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { Teacher } from '../types';

interface TeacherItemProps {
  teacher: Teacher;
  onEdit: (teacherId: number) => void;
  onDelete: (teacherId: number) => void;
}

const TeacherItem: React.FC<TeacherItemProps> = ({ teacher, onEdit, onDelete }) => {
  return (
    <View style={styles.teacherItem}>
      <View style={styles.teacherHeader}>
        <View style={styles.teacherInfo}>
          <Text style={styles.teacherName}>{teacher.name}</Text>
          <Text style={styles.teacherEmail}>{teacher.email}</Text>
          {teacher.department && (
            <Text style={styles.teacherDepartment}>
              Department: {teacher.department}
            </Text>
          )}
        </View>
        <View style={styles.teacherBadge}>
          <Icon name="school" size={16} color="#2196F3" />
          <Text style={styles.badgeText}>Teacher</Text>
        </View>
      </View>
      
      {teacher.createdAt && (
        <Text style={styles.teacherDate}>
          Joined: {new Date(teacher.createdAt).toLocaleDateString()}
        </Text>
      )}
      
      <View style={styles.teacherActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => onEdit(teacher.id)}
          accessibilityLabel={`Edit teacher: ${teacher.name}`}
          accessibilityHint="Tap to edit this teacher's information"
          accessibilityRole="button"
        >
          <Icon name="edit" size={20} color="#007AFF" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => onDelete(teacher.id)}
          accessibilityLabel={`Delete teacher: ${teacher.name}`}
          accessibilityHint="Tap to delete this teacher"
          accessibilityRole="button"
        >
          <Icon name="delete" size={20} color="#E53E3E" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const TeacherListContent: React.FC = () => {
  const navigation = useNavigation<MainNavigationProp>();
  const { data: teachers, loading, error, pagination, actions } = useTeachers();
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    visible: boolean;
    teacherId: number | null;
    teacherName: string;
  }>({
    visible: false,
    teacherId: null,
    teacherName: '',
  });

  // Fetch teachers on component mount
  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      await actions.fetchTeachers(1);
    } catch (error) {
      // Error is handled by context
      console.error('Failed to load teachers:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await actions.fetchTeachers(1);
    } catch (error) {
      // Error is handled by context
      console.error('Failed to refresh teachers:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || !pagination.hasNextPage) return;
    
    setLoadingMore(true);
    try {
      await actions.fetchTeachers(pagination.currentPage + 1);
    } catch (error) {
      // Error is handled by context
      console.error('Failed to load more teachers:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCreateTeacher = () => {
    navigationHelpers.navigateToCreateTeacher(navigation);
  };

  const handleEditTeacher = (teacherId: number) => {
    navigationHelpers.navigateToEditTeacher(navigation, teacherId);
  };

  const handleDeleteTeacher = (teacherId: number) => {
    const teacher = teachers?.find(t => t.id === teacherId);
    if (teacher) {
      setDeleteDialog({
        visible: true,
        teacherId,
        teacherName: teacher.name,
      });
    }
  };

  const confirmDeleteTeacher = async () => {
    if (deleteDialog.teacherId) {
      try {
        await actions.deleteTeacher(deleteDialog.teacherId);
        Alert.alert(
          'Success',
          'Teacher deleted successfully',
          [{ text: 'OK' }]
        );
      } catch (error) {
        Alert.alert(
          'Error',
          'Failed to delete teacher. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
    setDeleteDialog({ visible: false, teacherId: null, teacherName: '' });
  };

  const cancelDeleteTeacher = () => {
    setDeleteDialog({ visible: false, teacherId: null, teacherName: '' });
  };

  const renderTeacherItem = ({ item }: { item: Teacher }) => (
    <TeacherItem
      teacher={item}
      onEdit={handleEditTeacher}
      onDelete={handleDeleteTeacher}
    />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <LoadingSpinner size="small" />
        <Text style={styles.footerText}>Loading more teachers...</Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="school" size={64} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No Teachers Yet</Text>
      <Text style={styles.emptyStateMessage}>
        Add your first teacher to get started with user management
      </Text>
      <ActionButton
        title="Add First Teacher"
        onPress={handleCreateTeacher}
        style={styles.emptyStateButton}
      />
    </View>
  );

  if (loading === 'loading' && !teachers) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <Text style={styles.loadingText}>Loading teachers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Teacher Management</Text>
        <Text style={styles.subtitle}>
          Manage teacher accounts ({pagination.totalItems} total)
        </Text>
      </View>

      {error && (
        <ErrorMessage
          message={error}
          onRetry={loadTeachers}
        />
      )}

      <View style={styles.createButtonContainer}>
        <ActionButton
          title="Add New Teacher"
          onPress={handleCreateTeacher}
          icon={<Icon name="add" size={20} color="#FFFFFF" />}
          fullWidth
        />
      </View>

      <FlatList
        data={teachers || []}
        renderItem={renderTeacherItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.listContainer,
          (!teachers || teachers.length === 0) && styles.emptyListContainer,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#2196F3']}
            tintColor="#2196F3"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        accessibilityLabel="Teachers list"
        accessibilityHint="Swipe down to refresh teachers"
      />

      {pagination.totalPages > 1 && (
        <View style={styles.paginationInfo}>
          <Text style={styles.paginationText}>
            Page {pagination.currentPage} of {pagination.totalPages}
          </Text>
        </View>
      )}

      <ConfirmDialog
        visible={deleteDialog.visible}
        title="Delete Teacher"
        message={`Are you sure you want to delete "${deleteDialog.teacherName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteTeacher}
        onCancel={cancelDeleteTeacher}
        destructive
      />
    </View>
  );
};

export const TeacherListScreen: React.FC = () => {
  return (
    <ProtectedRoute 
      requiredRole="teacher"
      fallbackMessage="Only teachers can access teacher management."
    >
      <TeacherListContent />
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
  teacherItem: {
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
  teacherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  teacherEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  teacherDepartment: {
    fontSize: 14,
    color: '#2196F3',
    fontStyle: 'italic',
  },
  teacherBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
  },
  teacherDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
  },
  teacherActions: {
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
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  paginationInfo: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    alignItems: 'center',
  },
  paginationText: {
    fontSize: 14,
    color: '#666',
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