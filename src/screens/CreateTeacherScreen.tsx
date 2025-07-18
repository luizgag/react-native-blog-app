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
import { useTeachers } from '../context/TeachersContext';
import { useToast } from '../context/AppContext';
import { FormInput } from '../components/FormInput';
import { ActionButton } from '../components/ActionButton';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { formValidationSchemas, validationRules } from '../utils/validation';

type CreateTeacherScreenNavigationProp = StackNavigationProp<MainStackParamList, 'CreateTeacher'>;

interface Props {
  navigation: CreateTeacherScreenNavigationProp;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  department: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  department?: string;
}

export const CreateTeacherScreen: React.FC<Props> = ({ navigation }) => {
  const { actions: teachersActions, error: teachersError } = useTeachers();
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
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
      await teachersActions.createTeacher({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        department: formData.department.trim() || undefined,
      });

      // Show success message
      showSuccess('Teacher created successfully!', 'Success');
      navigation.goBack();
    } catch (error: any) {
      // Error is handled by the context, but we can show additional feedback
      showError('Failed to create teacher. Please try again.', 'Error');
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
          <Text style={styles.title}>Add New Teacher</Text>
          <Text style={styles.subtitle}>
            Create a new teacher account with administrative privileges
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
            validationRules={formValidationSchemas.createTeacher.name}
            realTimeValidation={true}
            showValidationIcon={true}
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
            validationRules={formValidationSchemas.createTeacher.email}
            realTimeValidation={true}
            showValidationIcon={true}
            accessibilityLabel="Teacher email address"
            accessibilityHint="Enter the teacher's email address for login"
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
            validationRules={formValidationSchemas.createTeacher.password}
            realTimeValidation={true}
            showValidationIcon={true}
            accessibilityLabel="Teacher password"
            accessibilityHint="Enter a secure password for the teacher account"
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
            accessibilityLabel="Confirm teacher password"
            accessibilityHint="Re-enter the password to confirm"
          />

          <FormInput
            label="Department (Optional)"
            value={formData.department}
            onChangeText={(value) => handleInputChange('department', value)}
            error={errors.department}
            placeholder="Enter department name..."
            maxLength={100}
            validationRules={formValidationSchemas.createTeacher.department}
            realTimeValidation={true}
            showValidationIcon={true}
            accessibilityLabel="Teacher department"
            accessibilityHint="Enter the teacher's department or subject area"
          />
        </View>

        <View style={styles.buttonContainer}>
          <ActionButton
            title="Cancel"
            variant="outline"
            onPress={handleCancel}
            style={styles.cancelButton}
            accessibilityLabel="Cancel teacher creation"
            accessibilityHint="Discard changes and go back"
          />
          
          <ActionButton
            title="Create Teacher"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitButton}
            accessibilityLabel="Create teacher account"
            accessibilityHint="Save and create the new teacher account"
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