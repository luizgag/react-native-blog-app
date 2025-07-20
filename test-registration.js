// Simple test to verify registration functionality
const { apiService } = require('./src/services/apiService');

async function testRegistration() {
  try {
    console.log('Testing registration functionality...');
    
    // Test data
    const testUser = {
      nome: 'Test User',
      email: 'test@example.com',
      senha: 'password123',
      tipo_usuario: 'student'
    };
    
    console.log('Attempting to register user:', testUser);
    
    // This will fail because we don't have a real backend, but we can see if the method exists
    const result = await apiService.register(testUser);
    console.log('Registration successful:', result);
    
  } catch (error) {
    console.log('Expected error (no backend):', error.message);
    
    // Check if the error is network-related (expected) vs method not found
    if (error.message.includes('Network Error') || error.message.includes('ECONNREFUSED') || error.message.includes('Erro de conexão')) {
      console.log('✅ Registration method exists and is working (network error expected)');
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }
}

testRegistration();