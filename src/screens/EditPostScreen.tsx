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
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { MainStackParamList } from '../navigation';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostsContext';
import { useToast } from '../context/AppContext';
import { ProtectedRoute } from '../navigation/ProtectedRoute';
import { FormInput } from '../components/FormInput';
import { ActionButton } from '../components/ActionButton';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { formValidationSchemas } from '../utils/validation';

type EditPostScreenNavigationProp = StackNavigationProp<MainStackParamList, 'EditPost'>;
type EditPostScreenRouteProp = RouteProp<MainStackParamList, 'EditPost'>;

interface Props {
  navigation: EditPostScreenNavigationProp;
  route: EditPostScreenRouteProp;
}

interface FormData {
  title: string;
  content: string;
}

interface FormErrors {
  title?: string;
  content?: string;
}

const EditPostContent: React.FC<Props> = ({ navigation, route }) => {
  const { postId } = route.params;
  const { user } = useAuth();
  const { 
    currentPost, 
    isLoading, 
    error: postsError, 
    actions: { fetchPost, updatePost, clearCurrentPost }
  } = usePosts();
  const { showSuccess, showError, showInfo } = useToast();
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
  });
  
  const [originalData, setOriginalData] = useState<FormData>({
    title: '',
    content: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch post data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const loadPost = async () => {
        try {
          await fetchPost(postId);
        } catch (error) {
          // Error is handled by the context
        }
      };

      loadPost();

      return () => {
        // Cleanup when screen loses focus
        clearCurrentPost();
      };
    }, [postId, fetchPost, clearCurrentPost])
  );

  // Reset initialization when postId changes
  useEffect(() => {
    setIsInitialized(false);
  }, [postId]);

  // Initialize form data when post is loaded
  useEffect(() => {
    if (currentPost && currentPost.id === postId && !isInitialized) {
      const initialData = {
        title: currentPost.title,
        content: currentPost.content,
      };
      
      setFormData(initialData);
      setOriginalData(initialData);
      setIsInitialized(true);
    }
  }, [currentPost, postId, isInitialized]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Título deve ter pelo menos 3 caracteres';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Título deve ter menos de 200 caracteres';
    }

    // Content validation
    if (!formData.content.trim()) {
      newErrors.content = 'Conteúdo é obrigatório';
    } else if (formData.content.trim().length < 10) {
      newErrors.content = 'Conteúdo deve ter pelo menos 10 caracteres';
    } else if (formData.content.trim().length > 10000) {
      newErrors.content = 'Conteúdo deve ter menos de 10.000 caracteres';
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

  const hasChanges = (): boolean => {
    return (
      formData.title.trim() !== originalData.title.trim() ||
      formData.content.trim() !== originalData.content.trim()
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!hasChanges()) {
      showInfo('Nenhuma alteração foi feita no post.', 'Sem Alterações');
      return;
    }

    setIsSubmitting(true);

    try {
      await updatePost(postId, {
        title: formData.title.trim(),
        content: formData.content.trim(),
      });

      // Show success message
      showSuccess('Post atualizado com sucesso!', 'Sucesso');
      navigation.goBack();
    } catch (error: any) {
      // Error is handled by the context, but we can show additional feedback
      showError('Falha ao atualizar post. Tente novamente.', 'Erro');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      Alert.alert(
        'Descartar Alterações',
        'Tem certeza de que deseja descartar suas alterações?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Descartar',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <ErrorMessage message="Você deve estar logado para editar posts." />
      </View>
    );
  }

  if (isLoading && !isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
        <Text style={styles.loadingText}>Carregando post...</Text>
      </View>
    );
  }

  if (postsError && !currentPost) {
    return (
      <View style={styles.container}>
        <ErrorMessage 
          message={postsError} 
          onRetry={() => fetchPost(postId)}
        />
      </View>
    );
  }

  if (!currentPost && !isLoading) {
    return (
      <View style={styles.container}>
        <ErrorMessage message="Post não encontrado." />
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
          <Text style={styles.title}>Editar Post</Text>
          <Text style={styles.subtitle}>
            Atualize o conteúdo e informações do seu post
          </Text>
        </View>

        {postsError && (
          <View style={styles.errorMessage}>
            <ErrorMessage message={postsError} />
          </View>
        )}

        <View style={styles.form}>
          <FormInput
            label="Título"
            value={formData.title}
            onChangeText={(value) => handleInputChange('title', value)}
            error={errors.title}
            required
            placeholder="Digite o título do post..."
            maxLength={200}
            validationRules={formValidationSchemas.createPost.title}
            realTimeValidation={true}
            showValidationIcon={true}
            accessibilityLabel="Título do post"
            accessibilityHint="Digite um título descritivo para seu post"
          />

          <FormInput
            label="Conteúdo"
            value={formData.content}
            onChangeText={(value) => handleInputChange('content', value)}
            error={errors.content}
            required
            multiline
            placeholder="Escreva o conteúdo do seu post aqui..."
            maxLength={10000}
            validationRules={formValidationSchemas.createPost.content}
            realTimeValidation={true}
            showValidationIcon={false}
            accessibilityLabel="Conteúdo do post"
            accessibilityHint="Digite o conteúdo principal do seu post"
            style={styles.contentInput}
          />

          <Text style={styles.characterCount}>
            {formData.content.length}/10.000 caracteres
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <ActionButton
            title="Cancelar"
            variant="outline"
            onPress={handleCancel}
            style={styles.cancelButton}
            accessibilityLabel="Cancelar edição do post"
            accessibilityHint="Descartar alterações e voltar"
          />
          
          <ActionButton
            title="Atualizar Post"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting || !hasChanges()}
            style={styles.submitButton}
            accessibilityLabel="Atualizar post"
            accessibilityHint="Salvar alterações no post"
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
    color: '#6B7280',
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
  errorMessage: {
    marginBottom: 16,
  },
  form: {
    marginBottom: 32,
  },
  contentInput: {
    minHeight: 200,
  },
  characterCount: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 4,
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

export const EditPostScreen: React.FC<Props> = (props) => {
  return (
    <ProtectedRoute 
      requiredRole="professor"
      fallbackMessage="Apenas professores podem editar posts."
    >
      <EditPostContent {...props} />
    </ProtectedRoute>
  );
};