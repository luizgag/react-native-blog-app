import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/AppContext';
import { FormInput } from '../components/FormInput';
import { ActionButton } from '../components/ActionButton';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoginFormData, CreateTeacherRequest, CreateStudentRequest } from '../types';
import { formValidationSchemas } from '../utils/validation';
import { enhancedApiService } from '../services';

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'teacher' | 'student';
  department?: string;
  studentId?: string;
}

export const LoginScreen: React.FC = () => {
  const { isLoading, error, actions } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  
  const [loginData, setLoginData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  
  const [signupData, setSignupData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    department: '',
    studentId: '',
  });
  
  const [loginErrors, setLoginErrors] = useState<Partial<LoginFormData>>({});
  const [signupErrors, setSignupErrors] = useState<Partial<SignupFormData>>({});

  // Clear error when component mounts or when user starts typing
  useEffect(() => {
    if (error) {
      actions.clearError();
    }
  }, []);

  const validateLoginForm = (): boolean => {
    const errors: Partial<LoginFormData> = {};

    // Email validation
    if (!loginData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!loginData.password) {
      errors.password = 'Password is required';
    } else if (loginData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSignupForm = (): boolean => {
    const errors: Partial<SignupFormData> = {};

    // Name validation
    if (!signupData.name.trim()) {
      errors.name = 'Name is required';
    } else if (signupData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!signupData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!signupData.password) {
      errors.password = 'Password is required';
    } else if (signupData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!signupData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (signupData.password !== signupData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }



    setSignupErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLoginInputChange = (field: keyof LoginFormData, value: string) => {
    setLoginData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error when user starts typing
    if (loginErrors[field]) {
      setLoginErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }

    // Clear global error when user starts typing
    if (error) {
      actions.clearError();
    }
  };

  const handleSignupInputChange = (field: keyof SignupFormData, value: string) => {
    setSignupData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error when user starts typing
    if (signupErrors[field]) {
      setSignupErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleLogin = async () => {
    if (!validateLoginForm()) {
      return;
    }

    try {
      await actions.login(loginData.email.trim(), loginData.password);
      // Navigation will be handled by the auth state change
    } catch (loginError: any) {
      // Error is already handled by the auth context
      // We could show additional UI feedback here if needed
      console.log('Login failed:', loginError.message);
    }
  };

  const handleSignup = async () => {
    if (!validateSignupForm()) {
      return;
    }

    setSignupLoading(true);
    
    try {
      if (signupData.role === 'teacher') {
        const teacherData: CreateTeacherRequest = {
          name: signupData.name.trim(),
          email: signupData.email.trim(),
          password: signupData.password,
          department: signupData.department?.trim(),
        };
        await enhancedApiService.createTeacher(teacherData);
      } else {
        const studentData: CreateStudentRequest = {
          name: signupData.name.trim(),
          email: signupData.email.trim(),
          password: signupData.password,
          studentId: signupData.studentId?.trim(),
        };
        await enhancedApiService.createStudent(studentData);
      }

      showSuccess('Account created successfully! You can now sign in.');
      setIsSignupMode(false);
      
      // Clear signup form
      setSignupData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
        department: '',
        studentId: '',
      });
      setSignupErrors({});
      
    } catch (signupError: any) {
      showError(signupError.message || 'Failed to create account. Please try again.');
    } finally {
      setSignupLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignupMode(!isSignupMode);
    // Clear errors when switching modes
    setLoginErrors({});
    setSignupErrors({});
    if (error) {
      actions.clearError();
    }
  };

  const handleRetryLogin = () => {
    actions.clearError();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {isSignupMode ? 'Create Account' : 'Welcome Back'}
            </Text>
            <Text style={styles.subtitle}>
              {isSignupMode 
                ? 'Sign up to join the blog platform' 
                : 'Sign in to access your blog dashboard'
              }
            </Text>
          </View>

          <View style={styles.form}>
            {isSignupMode ? (
              // Signup Form
              <>
                <FormInput
                  label="Full Name"
                  value={signupData.name}
                  onChangeText={(value) => handleSignupInputChange('name', value)}
                  error={signupErrors.name}
                  required
                  placeholder="Enter your full name"
                  autoCapitalize="words"
                  accessibilityLabel="Name input"
                  accessibilityHint="Enter your full name for account creation"
                />

                <FormInput
                  label="Email"
                  value={signupData.email}
                  onChangeText={(value) => handleSignupInputChange('email', value)}
                  error={signupErrors.email}
                  required
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="Enter your email"
                  accessibilityLabel="Email input"
                  accessibilityHint="Enter your email address for account creation"
                />

                <FormInput
                  label="Password"
                  value={signupData.password}
                  onChangeText={(value) => handleSignupInputChange('password', value)}
                  error={signupErrors.password}
                  required
                  secureTextEntry
                  showPasswordToggle
                  placeholder="Create a password"
                  accessibilityLabel="Password input"
                  accessibilityHint="Create a password for your account"
                />

                <FormInput
                  label="Confirm Password"
                  value={signupData.confirmPassword}
                  onChangeText={(value) => handleSignupInputChange('confirmPassword', value)}
                  error={signupErrors.confirmPassword}
                  required
                  secureTextEntry
                  showPasswordToggle
                  placeholder="Confirm your password"
                  accessibilityLabel="Confirm password input"
                  accessibilityHint="Re-enter your password to confirm"
                />

                {/* Role Selection */}
                <View style={styles.roleContainer}>
                  <Text style={styles.roleLabel}>Account Type</Text>
                  <View style={styles.roleButtons}>
                    <TouchableOpacity
                      style={[
                        styles.roleButton,
                        signupData.role === 'student' && styles.roleButtonActive
                      ]}
                      onPress={() => handleSignupInputChange('role', 'student')}
                      accessibilityLabel="Select student account"
                      accessibilityRole="button"
                    >
                      <Text style={[
                        styles.roleButtonText,
                        signupData.role === 'student' && styles.roleButtonTextActive
                      ]}>
                        Student
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.roleButton,
                        signupData.role === 'teacher' && styles.roleButtonActive
                      ]}
                      onPress={() => handleSignupInputChange('role', 'teacher')}
                      accessibilityLabel="Select teacher account"
                      accessibilityRole="button"
                    >
                      <Text style={[
                        styles.roleButtonText,
                        signupData.role === 'teacher' && styles.roleButtonTextActive
                      ]}>
                        Teacher
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>



                <ActionButton
                  title="Create Account"
                  onPress={handleSignup}
                  loading={signupLoading}
                  disabled={signupLoading}
                  fullWidth
                  variant="primary"
                  size="large"
                  style={styles.actionButton}
                />
              </>
            ) : (
              // Login Form
              <>
                <FormInput
                  label="Email"
                  value={loginData.email}
                  onChangeText={(value) => handleLoginInputChange('email', value)}
                  error={loginErrors.email}
                  required
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="Enter your email"
                  accessibilityLabel="Email input"
                  accessibilityHint="Enter your email address to sign in"
                />

                <FormInput
                  label="Password"
                  value={loginData.password}
                  onChangeText={(value) => handleLoginInputChange('password', value)}
                  error={loginErrors.password}
                  required
                  secureTextEntry
                  showPasswordToggle
                  placeholder="Enter your password"
                  accessibilityLabel="Password input"
                  accessibilityHint="Enter your password to sign in"
                />

                {error && (
                  <ErrorMessage
                    message={error}
                    onRetry={handleRetryLogin}
                    retryText="Clear Error"
                  />
                )}

                <ActionButton
                  title="Sign In"
                  onPress={handleLogin}
                  loading={isLoading}
                  disabled={isLoading}
                  fullWidth
                  variant="primary"
                  size="large"
                  style={styles.actionButton}
                />
              </>
            )}
          </View>

          {/* Toggle between login and signup */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              {isSignupMode 
                ? 'Already have an account?' 
                : "Don't have an account?"
              }
            </Text>
            <TouchableOpacity onPress={toggleMode} style={styles.toggleButton}>
              <Text style={styles.toggleButtonText}>
                {isSignupMode ? 'Sign In' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    marginBottom: 32,
  },
  actionButton: {
    marginTop: 24,
  },
  roleContainer: {
    marginBottom: 16,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  roleButtonActive: {
    borderColor: '#2196F3',
    backgroundColor: '#EBF8FF',
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  roleButtonTextActive: {
    color: '#2196F3',
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  toggleText: {
    fontSize: 14,
    color: '#6B7280',
  },
  toggleButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 20,
  },
});