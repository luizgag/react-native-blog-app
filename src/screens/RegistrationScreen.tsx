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
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/AppContext';
import { FormInput } from '../components/FormInput';
import { ActionButton } from '../components/ActionButton';
import { ErrorMessage } from '../components/ErrorMessage';
import { AuthStackParamList } from '../navigation/AuthNavigator';

type RegistrationScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

interface RegistrationFormData {
  nome: string;
  email: string;
  senha: string;
  confirmPassword: string;
  tipo_usuario: 'teacher' | 'student';
}

export const RegistrationScreen: React.FC = () => {
  const navigation = useNavigation<RegistrationScreenNavigationProp>();
  const { showSuccess, showError } = useToast();
  const { isLoading, error, actions } = useAuth();
  
  const [formData, setFormData] = useState<RegistrationFormData>({
    nome: '',
    email: '',
    senha: '',
    confirmPassword: '',
    tipo_usuario: 'student',
  });
  
  const [errors, setErrors] = useState<Partial<RegistrationFormData>>({});

  // Clear error when component mounts or when user starts typing
  useEffect(() => {
    if (error) {
      actions.clearError();
    }
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<RegistrationFormData> = {};

    // Nome validation
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Por favor, insira um email válido';
    }

    // Senha validation
    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Por favor, confirme sua senha';
    } else if (formData.senha !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof RegistrationFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }

    // Clear global error when user starts typing
    if (error) {
      actions.clearError();
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      await actions.register(
        formData.nome.trim(),
        formData.email.trim(),
        formData.senha,
        formData.tipo_usuario
      );
      
      showSuccess('Conta criada com sucesso! Você será redirecionado automaticamente.');
      
      // Navigation will be handled by the auth state change
      // The register method automatically logs the user in
      
    } catch (registerError: any) {
      const errorMessage = registerError.message || 'Falha ao criar conta. Tente novamente.';
      showError(errorMessage);
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  const handleRetryRegister = () => {
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
            <Text style={styles.title}>Criar Conta</Text>
            <Text style={styles.subtitle}>
              Cadastre-se para acessar a plataforma de blog
            </Text>
          </View>

          <View style={styles.form}>
            <FormInput
              label="Nome Completo"
              value={formData.nome}
              onChangeText={(value) => handleInputChange('nome', value)}
              error={errors.nome}
              required
              placeholder="Digite seu nome completo"
              autoCapitalize="words"
              accessibilityLabel="Campo de nome"
              accessibilityHint="Digite seu nome completo para criar a conta"
            />

            <FormInput
              label="Email"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              error={errors.email}
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
              value={formData.senha}
              onChangeText={(value) => handleInputChange('senha', value)}
              error={errors.senha}
              required
              secureTextEntry
              showPasswordToggle
              placeholder="Crie uma senha"
              accessibilityLabel="Campo de senha"
              accessibilityHint="Crie uma senha para sua conta"
            />

            <FormInput
              label="Confirmar Senha"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              error={errors.confirmPassword}
              required
              secureTextEntry
              showPasswordToggle
              placeholder="Confirme sua senha"
              accessibilityLabel="Campo de confirmação de senha"
              accessibilityHint="Digite novamente sua senha para confirmar"
            />

            {/* Role Selection */}
            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>Tipo de Usuário</Text>
              <View style={styles.roleButtons}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    formData.tipo_usuario === 'student' && styles.roleButtonActive
                  ]}
                  onPress={() => handleInputChange('tipo_usuario', 'student')}
                  accessibilityLabel="Selecionar conta de estudante"
                  accessibilityRole="button"
                >
                  <Text style={[
                    styles.roleButtonText,
                    formData.tipo_usuario === 'student' && styles.roleButtonTextActive
                  ]}>
                    Estudante
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    formData.tipo_usuario === 'teacher' && styles.roleButtonActive
                  ]}
                  onPress={() => handleInputChange('tipo_usuario', 'teacher')}
                  accessibilityLabel="Selecionar conta de professor"
                  accessibilityRole="button"
                >
                  <Text style={[
                    styles.roleButtonText,
                    formData.tipo_usuario === 'teacher' && styles.roleButtonTextActive
                  ]}>
                    Professor
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {error && (
              <ErrorMessage
                message={error}
                onRetry={handleRetryRegister}
                retryText="Limpar Erro"
              />
            )}

            <ActionButton
              title="Criar Conta"
              onPress={handleRegister}
              loading={isLoading}
              disabled={isLoading}
              fullWidth
              variant="primary"
              size="large"
              style={styles.actionButton}
            />
          </View>

          {/* Back to login */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              Já tem uma conta?
            </Text>
            <TouchableOpacity onPress={handleBackToLogin} style={styles.toggleButton}>
              <Text style={styles.toggleButtonText}>
                Fazer Login
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
});