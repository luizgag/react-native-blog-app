import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RegistrationScreen } from '../RegistrationScreen';
import { AuthProvider } from '../../context/AuthContext';
import { AppProvider } from '../../context/AppContext';
import { apiService } from '../../services/apiService';

// Mock the API service
jest.mock('../../services/apiService', () => ({
  apiService: {
    register: jest.fn(),
  },
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;

const Stack = createStackNavigator();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AppProvider>
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Register" component={() => <>{children}</>} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  </AppProvider>
);

describe('RegistrationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders registration form correctly', () => {
    const { getByText, getByPlaceholderText } = render(
      <TestWrapper>
        <RegistrationScreen />
      </TestWrapper>
    );

    expect(getByText('Criar Conta')).toBeTruthy();
    expect(getByText('Cadastre-se para acessar a plataforma de blog')).toBeTruthy();
    expect(getByPlaceholderText('Digite seu nome completo')).toBeTruthy();
    expect(getByPlaceholderText('Digite seu email')).toBeTruthy();
    expect(getByPlaceholderText('Crie uma senha')).toBeTruthy();
    expect(getByPlaceholderText('Confirme sua senha')).toBeTruthy();
    expect(getByText('Estudante')).toBeTruthy();
    expect(getByText('Professor')).toBeTruthy();
  });

  it('validates required fields', async () => {
    const { getByText } = render(
      <TestWrapper>
        <RegistrationScreen />
      </TestWrapper>
    );

    const createButton = getByText('Criar Conta');
    fireEvent.press(createButton);

    await waitFor(() => {
      expect(getByText('Nome é obrigatório')).toBeTruthy();
      expect(getByText('Email é obrigatório')).toBeTruthy();
      expect(getByText('Senha é obrigatória')).toBeTruthy();
      expect(getByText('Por favor, confirme sua senha')).toBeTruthy();
    });
  });

  it('validates email format', async () => {
    const { getByPlaceholderText, getByText } = render(
      <TestWrapper>
        <RegistrationScreen />
      </TestWrapper>
    );

    const emailInput = getByPlaceholderText('Digite seu email');
    fireEvent.changeText(emailInput, 'invalid-email');

    const createButton = getByText('Criar Conta');
    fireEvent.press(createButton);

    await waitFor(() => {
      expect(getByText('Por favor, insira um email válido')).toBeTruthy();
    });
  });

  it('validates password confirmation', async () => {
    const { getByPlaceholderText, getByText } = render(
      <TestWrapper>
        <RegistrationScreen />
      </TestWrapper>
    );

    const passwordInput = getByPlaceholderText('Crie uma senha');
    const confirmPasswordInput = getByPlaceholderText('Confirme sua senha');

    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmPasswordInput, 'different123');

    const createButton = getByText('Criar Conta');
    fireEvent.press(createButton);

    await waitFor(() => {
      expect(getByText('Senhas não coincidem')).toBeTruthy();
    });
  });

  it('calls register API with correct data', async () => {
    mockApiService.register.mockResolvedValue({
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'student',
        token: 'mock-token',
      },
      token: 'mock-token',
    });

    const { getByPlaceholderText, getByText } = render(
      <TestWrapper>
        <RegistrationScreen />
      </TestWrapper>
    );

    // Fill form
    fireEvent.changeText(getByPlaceholderText('Digite seu nome completo'), 'Test User');
    fireEvent.changeText(getByPlaceholderText('Digite seu email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Crie uma senha'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirme sua senha'), 'password123');

    // Select teacher role
    fireEvent.press(getByText('Professor'));

    // Submit form
    const createButton = getByText('Criar Conta');
    fireEvent.press(createButton);

    await waitFor(() => {
      expect(mockApiService.register).toHaveBeenCalledWith({
        nome: 'Test User',
        email: 'test@example.com',
        senha: 'password123',
        tipo_usuario: 'teacher',
      });
    });
  });

  it('handles registration errors', async () => {
    mockApiService.register.mockRejectedValue(new Error('Email já está em uso'));

    const { getByPlaceholderText, getByText } = render(
      <TestWrapper>
        <RegistrationScreen />
      </TestWrapper>
    );

    // Fill form with valid data
    fireEvent.changeText(getByPlaceholderText('Digite seu nome completo'), 'Test User');
    fireEvent.changeText(getByPlaceholderText('Digite seu email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Crie uma senha'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirme sua senha'), 'password123');

    // Submit form
    const createButton = getByText('Criar Conta');
    fireEvent.press(createButton);

    await waitFor(() => {
      expect(getByText('Email já está em uso')).toBeTruthy();
    });
  });
});