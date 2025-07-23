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
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostsContext';
import { useToast } from '../context/AppContext';
import { FormInput } from '../components/FormInput';
import { ActionButton } from '../components/ActionButton';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { formValidationSchemas } from '../utils/validation';

type CreatePostScreenNavigationProp = StackNavigationProp<MainStackParamList, 'CreatePost'>;

interface Props {
  navigation: CreatePostScreenNavigationProp;
}

interface FormData {
  title: string;
  content: string;
  author: string;
}

interface FormErrors {
  title?: string;
  content?: string;
  author?: string;
}

export const CreatePostScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const { actions: postsActions, error: postsError } = usePosts();
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    author: user?.name || 'Usuário',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Author validation
    if (!formData.author.trim()) {
      newErrors.author = 'Autor é obrigatório';
    } else if (formData.author.trim().length < 2) {
      newErrors.author = 'Nome do autor deve ter pelo menos 2 caracteres';
    } else if (formData.author.trim().length > 100) {
      newErrors.author = 'Nome do autor deve ter menos de 100 caracteres';
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
      await postsActions.createPost({
        title: formData.title.trim(),
        content: formData.content.trim(),
        author: formData.author.trim(),
      });

      // Show success message
      showSuccess('Post criado com sucesso!', 'Sucesso');
      navigation.goBack();
    } catch (error: any) {
      // Error is handled by the context, but we can show additional feedback
      showError('Falha ao criar post. Tente novamente.', 'Erro');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (formData.title.trim() || formData.content.trim()) {
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
        <ErrorMessage message="Você deve estar logado para criar posts." />
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
          <Text style={styles.title}>Criar Novo Post</Text>
          <Text style={styles.subtitle}>
            Compartilhe seu conhecimento e insights com os alunos
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
            label="Autor"
            value={formData.author}
            onChangeText={(value) => handleInputChange('author', value)}
            error={errors.author}
            required
            placeholder="Digite o nome do autor..."
            maxLength={100}
            validationRules={formValidationSchemas.createPost.author}
            realTimeValidation={true}
            showValidationIcon={true}
            accessibilityLabel="Nome do autor"
            accessibilityHint="Digite o nome do autor do post"
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
            accessibilityLabel="Cancelar criação do post"
            accessibilityHint="Descartar alterações e voltar"
          />
          
          <ActionButton
            title="Criar Post"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitButton}
            accessibilityLabel="Criar post"
            accessibilityHint="Salvar e publicar o novo post"
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