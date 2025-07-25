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
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export const CreateStudentScreen: React.FC<Props> = ({ navigation }) => {
  const { actions: studentsActions, error: studentsError } = useStudents();
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Nome deve ter menos de 100 caracteres';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Por favor, insira um endereço de email válido';
    } else if (formData.email.trim().length > 255) {
      newErrors.email = 'Email deve ter menos de 255 caracteres';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
    } else if (formData.password.length > 128) {
      newErrors.password = 'A senha deve ter menos de 128 caracteres';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Por favor, confirme sua senha';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
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
        nome: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        senha: formData.password,
      });

      // Show success message
      showSuccess('Aluno criado com sucesso!', 'Sucesso');
      navigation.goBack();
    } catch (error: any) {
      // Error is handled by the context, but we can show additional feedback
      showError('Falha ao criar aluno. Tente novamente.', 'Erro');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    const hasChanges = Object.values(formData).some(value => value.trim() !== '');
    
    if (hasChanges) {
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
          <Text style={styles.title}>Adicionar Novo Aluno</Text>
          <Text style={styles.subtitle}>
            Crie uma nova conta de aluno com acesso somente leitura
          </Text>
        </View>

        {studentsError && (
          <ErrorMessage message={studentsError} />
        )}

        <View style={styles.form}>
          <FormInput
            label="Nome Completo"
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            error={errors.name}
            required
            placeholder="Digite o nome completo do aluno..."
            maxLength={100}
            validationRules={formValidationSchemas.createStudent.name}
            realTimeValidation={true}
            showValidationIcon={true}
            accessibilityLabel="Nome completo do aluno"
            accessibilityHint="Digite o nome completo do aluno"
          />

          <FormInput
            label="Endereço de Email"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            error={errors.email}
            required
            placeholder="Digite o endereço de email..."
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={255}
            validationRules={formValidationSchemas.createStudent.email}
            realTimeValidation={true}
            showValidationIcon={true}
            accessibilityLabel="Endereço de email do aluno"
            accessibilityHint="Digite o endereço de email do aluno para login"
          />

          <FormInput
            label="Senha"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            error={errors.password}
            required
            placeholder="Digite a senha..."
            secureTextEntry
            showPasswordToggle
            maxLength={128}
            validationRules={formValidationSchemas.createStudent.password}
            realTimeValidation={true}
            showValidationIcon={true}
            accessibilityLabel="Senha do aluno"
            accessibilityHint="Digite uma senha segura para a conta do aluno"
          />

          <FormInput
            label="Confirmar Senha"
            value={formData.confirmPassword}
            onChangeText={(value) => handleInputChange('confirmPassword', value)}
            error={errors.confirmPassword}
            required
            placeholder="Confirme a senha..."
            secureTextEntry
            showPasswordToggle
            maxLength={128}
            validationRules={[validationRules.passwordMatch(formData.password)]}
            realTimeValidation={true}
            showValidationIcon={true}
            accessibilityLabel="Confirmar senha do aluno"
            accessibilityHint="Digite novamente a senha para confirmar"
          />


        </View>

        <View style={styles.buttonContainer}>
          <ActionButton
            title="Cancelar"
            variant="outline"
            onPress={handleCancel}
            style={styles.cancelButton}
            accessibilityLabel="Cancelar criação do aluno"
            accessibilityHint="Descartar alterações e voltar"
          />
          
          <ActionButton
            title="Criar Aluno"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitButton}
            accessibilityLabel="Criar conta do aluno"
            accessibilityHint="Salvar e criar a nova conta do aluno"
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