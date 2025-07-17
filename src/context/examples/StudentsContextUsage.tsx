import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useStudents } from '../StudentsContext';
import { Student } from '../../types';

/**
 * Example component demonstrating how to use the StudentsContext
 * This shows common patterns for:
 * - Fetching students with pagination
 * - Creating new students
 * - Updating existing students
 * - Deleting students
 * - Handling loading states and errors
 */
export const StudentsContextUsageExample: React.FC = () => {
  const {
    data: students,
    loading,
    error,
    pagination,
    currentStudent,
    actions: {
      fetchStudents,
      fetchStudent,
      createStudent,
      updateStudent,
      deleteStudent,
      clearCurrentStudent,
      clearError,
    },
  } = useStudents();

  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle student selection
  const handleSelectStudent = async (studentId: number) => {
    try {
      setSelectedStudentId(studentId);
      await fetchStudent(studentId);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch student details');
    }
  };

  // Handle creating a new student
  const handleCreateStudent = async () => {
    try {
      await createStudent({
        name: 'New Student',
        email: 'new.student@example.com',
        password: 'password123',
        studentId: `STU${Date.now()}`,
      });
      Alert.alert('Success', 'Student created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create student');
    }
  };

  // Handle updating a student
  const handleUpdateStudent = async (studentId: number) => {
    try {
      await updateStudent(studentId, {
        name: 'Updated Student Name',
        studentId: `STU${studentId}-UPDATED`,
      });
      Alert.alert('Success', 'Student updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update student');
    }
  };

  // Handle deleting a student
  const handleDeleteStudent = async (studentId: number) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this student?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteStudent(studentId);
              Alert.alert('Success', 'Student deleted successfully');
              if (selectedStudentId === studentId) {
                setSelectedStudentId(null);
                clearCurrentStudent();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete student');
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
        await fetchStudents(pagination.currentPage + 1);
      } catch (error) {
        Alert.alert('Error', 'Failed to load next page');
      }
    }
  };

  const handleLoadPreviousPage = async () => {
    if (pagination.hasPreviousPage) {
      try {
        await fetchStudents(pagination.currentPage - 1);
      } catch (error) {
        Alert.alert('Error', 'Failed to load previous page');
      }
    }
  };

  // Render student item
  const renderStudentItem = ({ item }: { item: Student }) => (
    <View style={styles.studentItem}>
      <TouchableOpacity
        style={[
          styles.studentInfo,
          selectedStudentId === item.id && styles.selectedStudent,
        ]}
        onPress={() => handleSelectStudent(item.id)}
      >
        <Text style={styles.studentName}>{item.name}</Text>
        <Text style={styles.studentEmail}>{item.email}</Text>
        {item.studentId && (
          <Text style={styles.studentId}>ID: {item.studentId}</Text>
        )}
      </TouchableOpacity>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.updateButton]}
          onPress={() => handleUpdateStudent(item.id)}
        >
          <Text style={styles.buttonText}>Update</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => handleDeleteStudent(item.id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Students Management</Text>
      
      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.clearErrorButton} onPress={clearError}>
            <Text style={styles.buttonText}>Clear Error</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Create Student Button */}
      <TouchableOpacity
        style={[styles.button, styles.createButton]}
        onPress={handleCreateStudent}
        disabled={loading === 'loading'}
      >
        <Text style={styles.buttonText}>Create New Student</Text>
      </TouchableOpacity>

      {/* Loading Indicator */}
      {loading === 'loading' && (
        <Text style={styles.loadingText}>Loading students...</Text>
      )}

      {/* Students List */}
      {students && (
        <FlatList
          data={students}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderStudentItem}
          style={styles.studentsList}
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

      {/* Current Student Details */}
      {currentStudent && (
        <View style={styles.currentStudentContainer}>
          <Text style={styles.currentStudentTitle}>Selected Student:</Text>
          <Text style={styles.currentStudentName}>{currentStudent.name}</Text>
          <Text style={styles.currentStudentEmail}>{currentStudent.email}</Text>
          {currentStudent.studentId && (
            <Text style={styles.currentStudentId}>
              Student ID: {currentStudent.studentId}
            </Text>
          )}
          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={() => {
              clearCurrentStudent();
              setSelectedStudentId(null);
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
  studentsList: {
    flex: 1,
    marginVertical: 16,
  },
  studentItem: {
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
  studentInfo: {
    marginBottom: 12,
  },
  selectedStudent: {
    backgroundColor: '#e8f5e8',
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  studentEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  studentId: {
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
  currentStudentContainer: {
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
  currentStudentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  currentStudentName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  currentStudentEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  currentStudentId: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
  },
});

export default StudentsContextUsageExample;