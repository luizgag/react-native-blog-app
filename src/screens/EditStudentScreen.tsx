import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../navigation';
import { useStudents } from '../context/StudentsContext';
import { FormInput } from '../components/FormInput';
import { ActionButton } from '../components/ActionButton';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

type EditStudentScreenNavigationProp = StackNavigationProp<MainStackParamList, 'EditStudent'>;
type EditStudentScreenRouteProp = RouteProp<MainStackParamList, 'EditStudent'>;

interface Props {
  navigation: EditStudentScreenNavigationProp;
  route: EditStudentScreenRouteProp;
}

interface FormData {
  name: string;
  email: string;
  studentId: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  studentId?: string;
}

export const EditStudentScreen: React.FC<Props> = ({ navigation, route }) => {
  const { studentId } = route.params;
  const { data: students, currentStudent, actions: studentsActions, error: studentsError, loading } = useStudents();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    studentId: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load student data on component mount
  useEffect(() => {
    loadStudentData();
  }, [studentId]);

  // Update form data when student data is loaded
  useEffect(() => {
    if (currentStudent && currentStudent.id === studentId) {
      setFormData({
        name: currentStudent.name,
        email: currentStudent.email,
        studentId: currentStudent.studentId || '',
      });
      setIsLoading(false);
    }
  }, [currentStudent, studentId]);

  const loadStudentData = async () => {
    try {
      setIsLoading(true);
      await studentsActions.fetchStudent(studentId);
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to load student data. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    } else if (formData.email.trim().length > 255) {
      newErrors.email = 'Email must be less than 255 characters';
    }

    // Student ID validation (optional)
    if (formData.studentId.trim() && formData.studentId.trim().length > 50) {
      newErrors.studentId = 'Student ID must be less than 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await studentsActions.updateStudent(studentId, {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        studentId: formData.studentId.trim() || undefined,
      });

      // Show success message
      Alert.alert(
        'Success',
        'Student updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      // Error is handled by the context, but we can show additional feedback
      Alert.alert(
        'Error',
        'Failed to update student. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!currentStudent) {
      navigation.goBack();
      return;
    }

    const hasChanges = 
      formData.name !== currentStudent.name ||
      formData.email !== currentStudent.email ||
      formData.studentId !== (currentStudent.studentId || '');
    
    if (hasChanges) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  // Show loading state while fetching student data
  if (isLoading || loading === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <Text style={styles.loadingText}>Loading student data...</Text>
      </View>
    );
  }

  // Show error if student not found
  if (!currentStudent || currentStudent.id !== studentId) {
    return (
      <View style={styles.errorContainer}>
        <ErrorMessage 
          message="Student not found or failed to load data."
          onRetry={loadStudentData}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Edit Student</Text>
          <Text style={styles.subtitle}>
            Update student information and settings
          </Text>
        </View>

        {studentsError && (
          <ErrorMessage message={studentsError} />
        )}

        <View style={styles.form}>
          <FormInput
            label="Full Name"
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            error={errors.name}
            required
            placeholder="Enter student's full name..."
            maxLength={100}
            accessibilityLabel="Student full name"
            accessibilityHint="Enter the student's full name"
          />

          <FormInput
            label="Email Address"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            error={errors.email}
            required
            placeholder="Enter email address..."
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={255}
            accessibilityLabel="Student email address"
            accessibilityHint="Enter the student's email address for login"
          />

          <FormInput
            label="Student ID (Optional)"
            value={formData.studentId}
            onChangeText={(value) => handleInputChange('studentId', value)}
            error={errors.studentId}
            placeholder="Enter student ID..."
            maxLength={50}
            accessibilityLabel="Student ID"
            accessibilityHint="Enter the student's unique identifier"
          />

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Account Information</Text>
            <Text style={styles.infoText}>
              • Student ID: {currentStudent.id}
            </Text>
            {currentStudent.createdAt && (
              <Text style={styles.infoText}>
                • Joined: {new Date(currentStudent.createdAt).toLocaleDateString()}
              </Text>
            )}
            <Text style={styles.infoText}>
              • Role: Student (Read-Only Access)
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <ActionButton
            title="Cancel"
            variant="outline"
            onPress={handleCancel}
            style={styles.cancelButton}
            accessibilityLabel="Cancel student editing"
            accessibilityHint="Discard changes and go back"
          />
          
          <ActionButton
            title="Update Student"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitButton}
            accessibilityLabel="Update student account"
            accessibilityHint="Save changes to the student account"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },

  form: {
    marginBottom: 32,
  },
  infoBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});