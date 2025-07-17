import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useTeachers } from '../TeachersContext';
import { Teacher } from '../../types';

/**
 * Example component demonstrating how to use the TeachersContext
 * This shows common patterns for:
 * - Fetching teachers with pagination
 * - Creating new teachers
 * - Updating existing teachers
 * - Deleting teachers
 * - Handling loading states and errors
 */
export const TeachersContextUsageExample: React.FC = () => {
  const {
    data: teachers,
    loading,
    error,
    pagination,
    currentTeacher,
    actions: {
      fetchTeachers,
      fetchTeacher,
      createTeacher,
      updateTeacher,
      deleteTeacher,
      clearCurrentTeacher,
      clearError,
    },
  } = useTeachers();

  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);

  // Fetch teachers on component mount
  useEffect(() => {
    fetchTeachers();
  }, []);

  // Handle teacher selection
  const handleSelectTeacher = async (teacherId: number) => {
    try {
      setSelectedTeacherId(teacherId);
      await fetchTeacher(teacherId);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch teacher details');
    }
  };

  // Handle creating a new teacher
  const handleCreateTeacher = async () => {
    try {
      await createTeacher({
        name: 'New Teacher',
        email: 'new.teacher@example.com',
        password: 'password123',
        department: 'Computer Science',
      });
      Alert.alert('Success', 'Teacher created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create teacher');
    }
  };

  // Handle updating a teacher
  const handleUpdateTeacher = async (teacherId: number) => {
    try {
      await updateTeacher(teacherId, {
        name: 'Updated Teacher Name',
        department: 'Updated Department',
      });
      Alert.alert('Success', 'Teacher updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update teacher');
    }
  };

  // Handle deleting a teacher
  const handleDeleteTeacher = async (teacherId: number) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this teacher?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTeacher(teacherId);
              Alert.alert('Success', 'Teacher deleted successfully');
              if (selectedTeacherId === teacherId) {
                setSelectedTeacherId(null);
                clearCurrentTeacher();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete teacher');
            }
          },
        },
      ]
    );
  };

  // Handle pagination
  const handleLoadNextPage = async () => {
    if (pagination.hasNextPage) {
      try {
        await fetchTeachers(pagination.currentPage + 1);
      } catch (error) {
        Alert.alert('Error', 'Failed to load next page');
      }
    }
  };

  const handleLoadPreviousPage = async () => {
    if (pagination.hasPreviousPage) {
      try {
        await fetchTeachers(pagination.currentPage - 1);
      } catch (error) {
        Alert.alert('Error', 'Failed to load previous page');
      }
    }
  };

  // Render teacher item
  const renderTeacherItem = ({ item }: { item: Teacher }) => (
    <View style={styles.teacherItem}>
      <TouchableOpacity
        style={[
          styles.teacherInfo,
          selectedTeacherId === item.id && styles.selectedTeacher,
        ]}
        onPress={() => handleSelectTeacher(item.id)}
      >
        <Text style={styles.teacherName}>{item.name}</Text>
        <Text style={styles.teacherEmail}>{item.email}</Text>
        {item.department && (
          <Text style={styles.teacherDepartment}>{item.department}</Text>
        )}
      </TouchableOpacity>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.updateButton]}
          onPress={() => handleUpdateTeacher(item.id)}
        >
          <Text style={styles.buttonText}>Update</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => handleDeleteTeacher(item.id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teachers Management</Text>
      
      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.clearErrorButton} onPress={clearError}>
            <Text style={styles.buttonText}>Clear Error</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Create Teacher Button */}
      <TouchableOpacity
        style={[styles.button, styles.createButton]}
        onPress={handleCreateTeacher}
        disabled={loading === 'loading'}
      >
        <Text style={styles.buttonText}>Create New Teacher</Text>
      </TouchableOpacity>

      {/* Loading Indicator */}
      {loading === 'loading' && (
        <Text style={styles.loadingText}>Loading teachers...</Text>
      )}

      {/* Teachers List */}
      {teachers && (
        <FlatList
          data={teachers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTeacherItem}
          style={styles.teachersList}
        />
      )}

      {/* Pagination Controls */}
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.paginationButton,
            !pagination.hasPreviousPage && styles.disabledButton,
          ]}
          onPress={handleLoadPreviousPage}
          disabled={!pagination.hasPreviousPage || loading === 'loading'}
        >
          <Text style={styles.buttonText}>Previous</Text>
        </TouchableOpacity>

        <Text style={styles.paginationInfo}>
          Page {pagination.currentPage} of {pagination.totalPages}
          ({pagination.totalItems} total)
        </Text>

        <TouchableOpacity
          style={[
            styles.button,
            styles.paginationButton,
            !pagination.hasNextPage && styles.disabledButton,
          ]}
          onPress={handleLoadNextPage}
          disabled={!pagination.hasNextPage || loading === 'loading'}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>

      {/* Current Teacher Details */}
      {currentTeacher && (
        <View style={styles.currentTeacherContainer}>
          <Text style={styles.currentTeacherTitle}>Selected Teacher:</Text>
          <Text style={styles.currentTeacherName}>{currentTeacher.name}</Text>
          <Text style={styles.currentTeacherEmail}>{currentTeacher.email}</Text>
          {currentTeacher.department && (
            <Text style={styles.currentTeacherDepartment}>
              Department: {currentTeacher.department}
            </Text>
          )}
          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={() => {
              clearCurrentTeacher();
              setSelectedTeacherId(null);
            }}
          >
            <Text style={styles.buttonText}>Clear Selection</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#c62828',
    marginBottom: 8,
  },
  clearErrorButton: {
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginVertical: 16,
  },
  teachersList: {
    flex: 1,
    marginVertical: 16,
  },
  teacherItem: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  teacherInfo: {
    marginBottom: 12,
  },
  selectedTeacher: {
    backgroundColor: '#e3f2fd',
  },
  teacherName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  teacherEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  teacherDepartment: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    minWidth: 80,
  },
  createButton: {
    backgroundColor: '#4caf50',
    marginBottom: 16,
  },
  updateButton: {
    backgroundColor: '#2196f3',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  clearButton: {
    backgroundColor: '#ff9800',
  },
  paginationButton: {
    backgroundColor: '#9c27b0',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  paginationInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 16,
  },
  currentTeacherContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  currentTeacherTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  currentTeacherName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  currentTeacherEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  currentTeacherDepartment: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
  },
});

export default TeachersContextUsageExample;