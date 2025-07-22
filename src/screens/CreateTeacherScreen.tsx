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

    // Department validation (optional)
    if (formData.department.trim() && formData.department.trim().length > 100) {
      newErrors.department = 'Departamento deve ter menos de 100 caracteres';
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
      showSuccess('Professor criado com sucesso!', 'Sucesso');
      navigation.goBack();
    } catch (error: any) {
      // Error is handled by the context, but we can show additional feedback
      showError('Falha ao criar professor. Tente novamente.', 'Erro');
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
          <Text style={styles.title}>Adicionar Novo Professor</Text>
          <Text style={styles.subtitle}>
            Crie uma nova conta de professor com privilégios administrativos
          </Text>
        </View>

        {teachersError && (
          <ErrorMessage message={teachersError} />
        )}

        <View style={styles.form}>
          <FormInput
            label="Nome Completo"
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            error={errors.name}
            required
            placeholder="Digite o nome completo do professor..."
            maxLength={100}
            validationRules={formValidationSchemas.createTeacher.name}
            realTimeValidation={true}
            showValidationIcon={true}
            accessibilityLabel="Nome completo do professor"
            accessibilityHint="Digite o nome completo do professor"
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
            validationRules={formValidationSchemas.createTeacher.email}
            realTimeValidation={true}
            showValidationIcon={true}
            accessibilityLabel="Endereço de email do professor"
            accessibilityHint="Digite o endereço de email do professor para login"
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
            validationRules={formValidationSchemas.createTeacher.password}
            realTimeValidation={true}
            showValidationIcon={true}
            accessibilityLabel="Senha do professor"
            accessibilityHint="Digite uma senha segura para a conta do professor"
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
            accessibilityLabel="Confirmar senha do professor"
            accessibilityHint="Digite novamente a senha para confirmar"
          />

          <FormInput
            label="Departamento (Opcional)"
            value={formData.department}
            onChangeText={(value) => handleInputChange('department', value)}
            error={errors.department}
            placeholder="Digite o nome do departamento..."
            maxLength={100}
            validationRules={formValidationSchemas.createTeacher.department}
            realTimeValidation={true}
            showValidationIcon={true}
            accessibilityLabel="Departamento do professor"
            accessibilityHint="Digite o departamento ou área de assunto do professor"
          />
        </View>

        <View style={styles.buttonContainer}>
          <ActionButton
            title="Cancelar"
            variant="outline"
            onPress={handleCancel}
            style={styles.cancelButton}
            accessibilityLabel="Cancelar criação do professor"
            accessibilityHint="Descartar alterações e voltar"
          />
          
          <ActionButton
            title="Criar Professor"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitButton}
            accessibilityLabel="Criar conta do professor"
            accessibilityHint="Salvar e criar a nova conta do professor"
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