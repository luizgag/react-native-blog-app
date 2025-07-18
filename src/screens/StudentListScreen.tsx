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
import { useStudents } from '../context/StudentsContext';
import { MainNavigationProp, navigationHelpers } from '../navigation/navigationHelpers';
import { ActionButton } from '../components/ActionButton';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { Student } from '../types';

interface StudentItemProps {
  student: Student;
  onEdit: (studentId: number) => void;
  onDelete: (studentId: number) => void;
}

const StudentItem: React.FC<StudentItemProps> = ({ student, onEdit, onDelete }) => {
  return (
    <View style={styles.studentItem}>
      <View style={styles.studentHeader}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{student.name}</Text>
          <Text style={styles.studentEmail}>{student.email}</Text>
          {student.studentId && (
            <Text style={styles.studentIdText}>
              Student ID: {student.studentId}
            </Text>
          )}
        </View>
        <View style={styles.studentBadge}>
          <Icon name="person" size={16} color="#4CAF50" />
          <Text style={styles.badgeText}>Student</Text>
        </View>
      </View>
      
      {student.createdAt && (
        <Text style={styles.studentDate}>
          Joined: {new Date(student.createdAt).toLocaleDateString()}
        </Text>
      )}
      
      <View style={styles.studentActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => onEdit(student.id)}
          accessibilityLabel={`Edit student: ${student.name}`}
          accessibilityHint="Tap to edit this student's information"
          accessibilityRole="button"
        >
          <Icon name="edit" size={20} color="#007AFF" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => onDelete(student.id)}
          accessibilityLabel={`Delete student: ${student.name}`}
          accessibilityHint="Tap to delete this student"
          accessibilityRole="button"
        >
          <Icon name="delete" size={20} color="#E53E3E" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const StudentListContent: React.FC = () => {
  const navigation = useNavigation<MainNavigationProp>();
  const { data: students, loading, error, pagination, actions } = useStudents();
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    visible: boolean;
    studentId: number | null;
    studentName: string;
  }>({
    visible: false,
    studentId: null,
    studentName: '',
  });

  // Fetch students on component mount
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      await actions.fetchStudents(1);
    } catch (error) {
      // Error is handled by context
      console.error('Failed to load students:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await actions.fetchStudents(1);
    } catch (error) {
      // Error is handled by context
      console.error('Failed to refresh students:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || !pagination.hasNextPage) return;
    
    setLoadingMore(true);
    try {
      await actions.fetchStudents(pagination.currentPage + 1);
    } catch (error) {
      // Error is handled by context
      console.error('Failed to load more students:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCreateStudent = () => {
    navigationHelpers.navigateToCreateStudent(navigation);
  };

  const handleEditStudent = (studentId: number) => {
    navigationHelpers.navigateToEditStudent(navigation, studentId);
  };

  const handleDeleteStudent = (studentId: number) => {
    const student = students?.find(s => s.id === studentId);
    if (student) {
      setDeleteDialog({
        visible: true,
        studentId,
        studentName: student.name,
      });
    }
  };

  const confirmDeleteStudent = async () => {
    if (deleteDialog.studentId) {
      try {
        await actions.deleteStudent(deleteDialog.studentId);
        Alert.alert(
          'Success',
          'Student deleted successfully',
          [{ text: 'OK' }]
        );
      } catch (error) {
        Alert.alert(
          'Error',
          'Failed to delete student. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
    setDeleteDialog({ visible: false, studentId: null, studentName: '' });
  };

  const cancelDeleteStudent = () => {
    setDeleteDialog({ visible: false, studentId: null, studentName: '' });
  };

  const renderStudentItem = ({ item }: { item: Student }) => (
    <StudentItem
      student={item}
      onEdit={handleEditStudent}
      onDelete={handleDeleteStudent}
    />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <LoadingSpinner size="small" />
        <Text style={styles.footerText}>Loading more students...</Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="people" size={64} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No Students Yet</Text>
      <Text style={styles.emptyStateMessage}>
        Add your first student to get started with student management
      </Text>
      <ActionButton
        title="Add First Student"
        onPress={handleCreateStudent}
        style={styles.emptyStateButton}
      />
    </View>
  );

  if (loading === 'loading' && !students) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <Text style={styles.loadingText}>Loading students...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Student Management</Text>
        <Text style={styles.subtitle}>
          Manage student accounts ({pagination.totalItems} total)
        </Text>
      </View>

      {error && (
        <ErrorMessage
          message={error}
          onRetry={loadStudents}
        />
      )}

      <View style={styles.createButtonContainer}>
        <ActionButton
          title="Add New Student"
          onPress={handleCreateStudent}
          icon={<Icon name="add" size={20} color="#FFFFFF" />}
          fullWidth
        />
      </View>

      <FlatList
        data={students || []}
        renderItem={renderStudentItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.listContainer,
          (!students || students.length === 0) && styles.emptyListContainer,
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
        accessibilityLabel="Students list"
        accessibilityHint="Swipe down to refresh students"
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
        title="Delete Student"
        message={`Are you sure you want to delete "${deleteDialog.studentName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteStudent}
        onCancel={cancelDeleteStudent}
        destructive
      />
    </View>
  );
};

export const StudentListScreen: React.FC = () => {
  return (
    <ProtectedRoute 
      requiredRole="teacher"
      fallbackMessage="Only teachers can access student management."
    >
      <StudentListContent />
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
  studentItem: {
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
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  studentEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  studentIdText: {
    fontSize: 14,
    color: '#4CAF50',
    fontStyle: 'italic',
  },
  studentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  studentDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
  },
  studentActions: {
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