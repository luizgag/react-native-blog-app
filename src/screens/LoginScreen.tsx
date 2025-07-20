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
import { FormInput } from '../components/FormInput';
import { ActionButton } from '../components/ActionButton';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoginFormData } from '../types';
import { AuthStackParamList } from '../navigation/AuthNavigator';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { isLoading, error, actions } = useAuth();
  
  const [loginData, setLoginData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  
  const [loginErrors, setLoginErrors] = useState<Partial<LoginFormData>>({});

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
      errors.email = 'Por favor, insira um email válido';
    }

    // Password validation
    if (!loginData.password) {
      errors.password = 'Senha é obrigatória';
    } else if (loginData.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setLoginErrors(errors);
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

  const handleNavigateToRegister = () => {
    // Navigate to the registration screen
    navigation.navigate('Register');
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
            <Text style={styles.title}>Bem-vindo de Volta</Text>
            <Text style={styles.subtitle}>
              Faça login para acessar sua plataforma de blog
            </Text>
          </View>

          <View style={styles.form}>
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
              accessibilityHint="Digite seu endereço de email para fazer login"
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
              accessibilityHint="Digite sua senha para fazer login"
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
          </View>

          {/* Navigate to registration */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              Não tem uma conta?
            </Text>
            <TouchableOpacity onPress={handleNavigateToRegister} style={styles.toggleButton}>
              <Text style={styles.toggleButtonText}>
                Criar Conta
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