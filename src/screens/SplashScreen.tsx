import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { AuthStackParamList } from '../navigation/AuthNavigator';

type SplashScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Splash'>;

export const SplashScreen: React.FC = () => {
  const { isLoading, error, isAuthenticated, actions } = useAuth();
  const navigation = useNavigation<SplashScreenNavigationProp>();

  useEffect(() => {
    // Navigate to login screen after auth check completes
    if (!isLoading && !isAuthenticated && !error) {
      // Add a small delay for better UX
      const timer = setTimeout(() => {
        navigation.replace('Login');
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, error, navigation]);

  const handleRetry = () => {
    actions.checkAuthStatus();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* App Logo/Icon */}
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>📝</Text>
          </View>
          <Text style={styles.appName}>Blog App</Text>
          <Text style={styles.tagline}>Plataforma Educacional de Blog</Text>
        </View>

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <LoadingSpinner
              size="large"
              message="Verificando autenticação..."
            />
          </View>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <View style={styles.errorContainer}>
            <ErrorMessage
              message="Falha ao verificar status de autenticação. Tente novamente."
              onRetry={handleRetry}
              retryText="Tentar Novamente"
              type="error"
            />
          </View>
        )}

        {/* App Info */}
        {!error && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Bem-vindo à plataforma educacional de blog
            </Text>
            <Text style={styles.infoSubtext}>
              Professores podem criar e gerenciar conteúdo
            </Text>
            <Text style={styles.infoSubtext}>
              Alunos podem ler e explorar posts
            </Text>
          </View>
        )}
      </View>

      {/* Version Info */}
      <View style={styles.footer}>
        <Text style={styles.versionText}>Versão 1.0.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    maxWidth: 400,
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoText: {
    fontSize: 32,
    color: '#FFFFFF',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingContainer: {
    marginVertical: 20,
  },
  errorContainer: {
    marginVertical: 20,
    width: '100%',
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  infoSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 20,
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});