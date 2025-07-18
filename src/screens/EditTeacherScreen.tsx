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
import { useTeachers } from '../context/TeachersContext';
import { FormInput } from '../components/FormInput';
import { ActionButton } from '../components/ActionButton';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

type EditTeacherScreenNavigationProp = StackNavigationProp<MainStackParamList, 'EditTeacher'>;
type EditTeacherScreenRouteProp = RouteProp<MainStackParamList, 'EditTeacher'>;

interface Props {
  navigation: EditTeacherScreenNavigationProp;
  route: EditTeacherScreenRouteProp;
}

interface FormData {
  name: string;
  email: string;
  department: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  department?: string;
}

export const EditTeacherScreen: React.FC<Props> = ({ navigation, route }) => {
  const { teacherId } = route.params;
  const { data: teachers, currentTeacher, actions: teachersActions, error: teachersError, loading } = useTeachers();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    department: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load teacher data on component mount
  useEffect(() => {
    loadTeacherData();
  }, [teacherId]);

  // Update form data when teacher data is loaded
  useEffect(() => {
    if (currentTeacher && currentTeacher.id === teacherId) {
      setFormData({
        name: currentTeacher.name,
        email: currentTeacher.email,
        department: currentTeacher.department || '',
      });
      setIsLoading(false);
    }
  }, [currentTeacher, teacherId]);

  const loadTeacherData = async () => {
    try {
      setIsLoading(true);
      await teachersActions.fetchTeacher(teacherId);
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to load teacher data. Please try again.',
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

    // Department validation (optional)
    if (formData.department.trim() && formData.department.trim().length > 100) {
      newErrors.department = 'Department must be less than 100 characters';
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
      await teachersActions.updateTeacher(teacherId, {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        department: formData.department.trim() || undefined,
      });

      // Show success message
      Alert.alert(
        'Success',
        'Teacher updated successfully!',
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
        'Failed to update teacher. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!currentTeacher) {
      navigation.goBack();
      return;
    }

    const hasChanges = 
      formData.name !== currentTeacher.name ||
      formData.email !== currentTeacher.email ||
      formData.department !== (currentTeacher.department || '');
    
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

  // Show loading state while fetching teacher data
  if (isLoading || loading === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <Text style={styles.loadingText}>Loading teacher data...</Text>
      </View>
    );
  }

  // Show error if teacher not found
  if (!currentTeacher || currentTeacher.id !== teacherId) {
    return (
      <View style={styles.errorContainer}>
        <ErrorMessage 
          message="Teacher not found or failed to load data."
          onRetry={loadTeacherData}
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
          <Text style={styles.title}>Edit Teacher</Text>
          <Text style={styles.subtitle}>
            Update teacher information and settings
          </Text>
        </View>

        {teachersError && (
          <ErrorMessage message={teachersError} />
        )}

        <View style={styles.form}>
          <FormInput
            label="Full Name"
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            error={errors.name}
            required
            placeholder="Enter teacher's full name..."
            maxLength={100}
            accessibilityLabel="Teacher full name"
            accessibilityHint="Enter the teacher's full name"
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
            accessibilityLabel="Teacher email address"
            accessibilityHint="Enter the teacher's email address for login"
          />

          <FormInput
            label="Department (Optional)"
            value={formData.department}
            onChangeText={(value) => handleInputChange('department', value)}
            error={errors.department}
            placeholder="Enter department name..."
            maxLength={100}
            accessibilityLabel="Teacher department"
            accessibilityHint="Enter the teacher's department or subject area"
          />

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Account Information</Text>
            <Text style={styles.infoText}>
              • Teacher ID: {currentTeacher.id}
            </Text>
            {currentTeacher.createdAt && (
              <Text style={styles.infoText}>
                • Joined: {new Date(currentTeacher.createdAt).toLocaleDateString()}
              </Text>
            )}
            <Text style={styles.infoText}>
              • Role: Teacher (Administrative Access)
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <ActionButton
            title="Cancel"
            variant="outline"
            onPress={handleCancel}
            style={styles.cancelButton}
            accessibilityLabel="Cancel teacher editing"
            accessibilityHint="Discard changes and go back"
          />
          
          <ActionButton
            title="Update Teacher"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitButton}
            accessibilityLabel="Update teacher account"
            accessibilityHint="Save changes to the teacher account"
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
    borderLeftColor: '#2196F3',
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