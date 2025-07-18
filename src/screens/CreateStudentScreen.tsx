import React, { useState } from 'react';
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
import { MainStackParamList } from '../navigation';
import { useStudents } from '../context/StudentsContext';
import { useToast } from '../context/AppContext';
import { FormInput } from '../components/FormInput';
import { ActionButton } from '../components/ActionButton';
import { ErrorMessage } from '../components/ErrorMessage';
import { formValidationSchemas, validationRules } from '../utils/validation';

type CreateStudentScreenNavigationProp = StackNavigationProp<MainStackParamList, 'CreateStudent'>;

interface Props {
  navigation: CreateStudentScreenNavigationProp;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  studentId: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  studentId?: string;
}

export const CreateStudentScreen: React.FC<Props> = ({ navigation }) => {
  const { actions: studentsActions, error: studentsError } = useStudents();
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    } else if (formData.password.length > 128) {
      newErrors.password = 'Password must be less than 128 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      await studentsActions.createStudent({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        studentId: formData.studentId.trim() || undefined,
      });

      // Show success message
      showSuccess('Student created successfully!', 'Success');
      navigation.goBack();
    } catch (error: any) {
      // Error is handled by the context, but we can show additional feedback
      showError('Failed to create student. Please try again.', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    const hasChanges = Object.values(formData).some(value => value.trim() !== '');
    
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
          <Text style={styles.title}>Add New Student</Text>
          <Text style={styles.subtitle}>
            Create a new student account with read-only access
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
            validationRules={formValidationSchemas.createStudent.name}
            realTimeValidation={true}
            showValidationIcon={true}
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
            validationRules={formValidationSchemas.createStudent.email}
            realTimeValidation={true}
            showValidationIcon={true}
            accessibilityLabel="Student email address"
            accessibilityHint="Enter the student's email address for login"
          />

          <FormInput
            label="Password"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            error={errors.password}
            required
            placeholder="Enter password..."
            secureTextEntry
            showPasswordToggle
            maxLength={128}
            validationRules={formValidationSchemas.createStudent.password}
            realTimeValidation={true}
            showValidationIcon={true}
            accessibilityLabel="Student password"
            accessibilityHint="Enter a secure password for the student account"
          />

          <FormInput
            label="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(value) => handleInputChange('confirmPassword', value)}
            error={errors.confirmPassword}
            required
            placeholder="Confirm password..."
            secureTextEntry
            showPasswordToggle
            maxLength={128}
            validationRules={[validationRules.passwordMatch(formData.password)]}
            realTimeValidation={true}
            showValidationIcon={true}
            accessibilityLabel="Confirm student password"
            accessibilityHint="Re-enter the password to confirm"
          />

          <FormInput
            label="Student ID (Optional)"
            value={formData.studentId}
            onChangeText={(value) => handleInputChange('studentId', value)}
            error={errors.studentId}
            placeholder="Enter student ID..."
            maxLength={50}
            validationRules={formValidationSchemas.createStudent.studentId}
            realTimeValidation={true}
            showValidationIcon={true}
            accessibilityLabel="Student ID"
            accessibilityHint="Enter the student's unique identifier"
          />
        </View>

        <View style={styles.buttonContainer}>
          <ActionButton
            title="Cancel"
            variant="outline"
            onPress={handleCancel}
            style={styles.cancelButton}
            accessibilityLabel="Cancel student creation"
            accessibilityHint="Discard changes and go back"
          />
          
          <ActionButton
            title="Create Student"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitButton}
            accessibilityLabel="Create student account"
            accessibilityHint="Save and create the new student account"
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