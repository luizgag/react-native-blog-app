import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/AppContext';
import { FormInput } from '../components/FormInput';
import { ActionButton } from '../components/ActionButton';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoginFormData } from '../types';
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
      errors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
      errors.email = 'Por favor, insira um endereço de email válido';
    }

    // Password validation
    if (!loginData.password) {
      errors.password = 'Senha é obrigatória';
    } else if (loginData.password.length < 6) {
      errors.password = 'A senha deve ter pelo menos 6 caracteres';
    }

    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSignupForm = (): boolean => {
    const errors: Partial<SignupFormData> = {};

    // Name validation
    if (!signupData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    } else if (signupData.name.trim().length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Email validation
    if (!signupData.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email)) {
      errors.email = 'Por favor, insira um endereço de email válido';
    }

    // Password validation
    if (!signupData.password) {
      errors.password = 'Senha é obrigatória';
    } else if (signupData.password.length < 6) {
      errors.password = 'A senha deve ter pelo menos 6 caracteres';
    }

    // Confirm password validation
    if (!signupData.confirmPassword) {
      errors.confirmPassword = 'Por favor, confirme sua senha';
    } else if (signupData.password !== signupData.confirmPassword) {
      errors.confirmPassword = 'As senhas não coincidem';
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
      // Transform data to match API RegisterRequest format (Portuguese field names)
      const registerData = {
        nome: signupData.name.trim(),
        email: signupData.email.trim(),
        senha: signupData.password,
        confirmacao_senha: signupData.confirmPassword,
        tipo_usuario: signupData.role === 'teacher' ? 'professor' as const : 'aluno' as const,
      };

      if (signupData.role === 'teacher') {
        await enhancedApiService.createTeacher(registerData);
      } else {
        await enhancedApiService.createStudent(registerData);
      }

      showSuccess('Conta criada com sucesso! Agora você pode fazer login.');
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
      showError(signupError.message || 'Falha ao criar conta. Tente novamente.');
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
              {isSignupMode ? 'Criar Conta' : 'Bem-vindo de Volta'}
            </Text>
            <Text style={styles.subtitle}>
              {isSignupMode
                ? 'Cadastre-se para participar da plataforma de blog'
                : 'Entre para acessar seu painel do blog'
              }
            </Text>
          </View>

          <View style={styles.form}>
            {isSignupMode ? (
              // Signup Form
              <>
                <FormInput
                  label="Nome Completo"
                  value={signupData.name}
                  onChangeText={(value) => handleSignupInputChange('name', value)}
                  error={signupErrors.name}
                  required
                  placeholder="Digite seu nome completo"
                  autoCapitalize="words"
                  accessibilityLabel="Campo de nome"
                  accessibilityHint="Digite seu nome completo para criar a conta"
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
                  placeholder="Digite seu email"
                  accessibilityLabel="Campo de email"
                  accessibilityHint="Digite seu endereço de email para criar a conta"
                />

                <FormInput
                  label="Senha"
                  value={signupData.password}
                  onChangeText={(value) => handleSignupInputChange('password', value)}
                  error={signupErrors.password}
                  required
                  secureTextEntry
                  showPasswordToggle
                  placeholder="Crie uma senha"
                  accessibilityLabel="Campo de senha"
                  accessibilityHint="Crie uma senha para sua conta"
                />

                <FormInput
                  label="Confirmar Senha"
                  value={signupData.confirmPassword}
                  onChangeText={(value) => handleSignupInputChange('confirmPassword', value)}
                  error={signupErrors.confirmPassword}
                  required
                  secureTextEntry
                  showPasswordToggle
                  placeholder="Confirme sua senha"
                  accessibilityLabel="Campo de confirmação de senha"
                  accessibilityHint="Digite novamente sua senha para confirmar"
                />

                {/* Role Selection */}
                <View style={styles.roleContainer}>
                  <Text style={styles.roleLabel}>Tipo de Conta</Text>
                  <View style={styles.roleButtons}>
                    <TouchableOpacity
                      style={[
                        styles.roleButton,
                        signupData.role === 'student' && styles.roleButtonActive
                      ]}
                      onPress={() => handleSignupInputChange('role', 'student')}
                      accessibilityLabel="Selecionar conta de aluno"
                      accessibilityRole="button"
                    >
                      <Text style={[
                        styles.roleButtonText,
                        signupData.role === 'student' && styles.roleButtonTextActive
                      ]}>
                        Aluno
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.roleButton,
                        signupData.role === 'teacher' && styles.roleButtonActive
                      ]}
                      onPress={() => handleSignupInputChange('role', 'teacher')}
                      accessibilityLabel="Selecionar conta de professor"
                      accessibilityRole="button"
                    >
                      <Text style={[
                        styles.roleButtonText,
                        signupData.role === 'teacher' && styles.roleButtonTextActive
                      ]}>
                        Professor
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>



                <ActionButton
                  title="Criar Conta"
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
                  placeholder="Digite seu email"
                  accessibilityLabel="Campo de email"
                  accessibilityHint="Digite seu endereço de email para entrar"
                />

                <FormInput
                  label="Senha"
                  value={loginData.password}
                  onChangeText={(value) => handleLoginInputChange('password', value)}
                  error={loginErrors.password}
                  required
                  secureTextEntry
                  showPasswordToggle
                  placeholder="Digite sua senha"
                  accessibilityLabel="Campo de senha"
                  accessibilityHint="Digite sua senha para entrar"
                />

                {error && (
                  <ErrorMessage
                    message={error}
                    onRetry={handleRetryLogin}
                    retryText="Limpar Erro"
                  />
                )}

                <ActionButton
                  title="Entrar"
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
                ? 'Já tem uma conta?'
                : "Não tem uma conta?"
              }
            </Text>
            <TouchableOpacity onPress={toggleMode} style={styles.toggleButton}>
              <Text style={styles.toggleButtonText}>
                {isSignupMode ? 'Entrar' : 'Cadastrar'}
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