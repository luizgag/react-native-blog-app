const axios = require('axios');

// Test configuration
const API_CONFIG = {
  BASE_URL: 'http://localhost:3001/api',
  FALLBACK_URLS: [
    'http://localhost:3001/api',
    'http://10.0.2.2:3001/api',
    'http://127.0.0.1:3001/api'
  ],
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  RETRY_BACKOFF_MULTIPLIER: 2,
  CONNECTION_TIMEOUT: 5000,
};

// Portuguese error translation
function translatePortugueseError(message) {
  const translations = {
    'Token de acesso não fornecido': 'Access token not provided',
    'Token inválido': 'Invalid token',
    'Token expirado': 'Token expired',
    'Credenciais inválidas': 'Invalid credentials',
    'E-mail ou senha incorretos': 'Incorrect email or password',
    'E-mail já cadastrado': 'Email already registered',
    'Usuário não encontrado': 'User not found',
    'Post não encontrado': 'Post not found',
    'Comentário não encontrado': 'Comment not found',
    'Acesso negado': 'Access denied',
    'Dados inválidos': 'Invalid data',
    'Campo obrigatório': 'Required field',
    'Formato inválido': 'Invalid format',
    'Erro interno do servidor': 'Internal server error',
    'Serviço indisponível': 'Service unavailable',
  };

  if (translations[message]) {
    return translations[message];
  }

  for (const [portuguese, english] of Object.entries(translations)) {
    if (message.includes(portuguese)) {
      return english;
    }
  }

  return message;
}

// Enhanced error handling
function handleError(error) {
  if (error.response) {
    const responseData = error.response.data || {};
    const serverMessage = responseData.message || responseData.error || 'Server error occurred';
    
    return {
      message: translatePortugueseError(serverMessage),
      status: error.response.status,
      code: responseData.code || `HTTP_${error.response.status}`,
    };
  } else if (error.request) {
    if (error.code === 'ECONNREFUSED') {
      return {
        message: 'Unable to connect to server. Please check if the server is running.',
        code: 'CONNECTION_REFUSED',
      };
    } else if (error.code === 'ENOTFOUND') {
      return {
        message: 'Server not found. Please check your network connection.',
        code: 'HOST_NOT_FOUND',
      };
    } else if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
      return {
        message: 'Request timed out. Please check your internet connection and try again.',
        code: 'TIMEOUT_ERROR',
      };
    } else if (error.code === 'ECONNABORTED') {
      return {
        message: 'Request was cancelled. Please try again.',
        code: 'REQUEST_CANCELLED',
      };
    } else {
      return {
        message: 'Network error - please check your connection and try again.',
        code: 'NETWORK_ERROR',
      };
    }
  } else {
    return {
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    };
  }
}

// Test connectivity with fallback URLs
async function testConnectivityWithFallback() {
  console.log('🔍 Testing connectivity with fallback URLs...\n');
  
  for (const baseUrl of API_CONFIG.FALLBACK_URLS) {
    console.log(`Testing: ${baseUrl}`);
    
    try {
      const response = await axios.get(`${baseUrl}/posts`, {
        timeout: API_CONFIG.CONNECTION_TIMEOUT,
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log(`✅ SUCCESS: ${baseUrl}`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Working base URL found!`);
      return baseUrl;
      
    } catch (error) {
      const apiError = handleError(error);
      console.log(`❌ FAILED: ${baseUrl}`);
      console.log(`   Error: ${apiError.message} (${apiError.code})`);
    }
    
    console.log('');
  }
  
  console.log('⚠️ All URLs failed connectivity test');
  return null;
}

// Test retry logic with exponential backoff
async function testRetryLogic() {
  console.log('🔄 Testing retry logic with exponential backoff...\n');
  
  let attempt = 0;
  const maxAttempts = API_CONFIG.RETRY_ATTEMPTS;
  
  const retryOperation = async () => {
    attempt++;
    console.log(`Attempt ${attempt}/${maxAttempts}`);
    
    if (attempt < maxAttempts) {
      const error = new Error('Simulated network error');
      error.code = 'NETWORK_ERROR';
      throw error;
    }
    
    return 'Success after retries!';
  };
  
  try {
    const result = await withRetry(retryOperation, {
      maxAttempts,
      delay: API_CONFIG.RETRY_DELAY,
      backoffMultiplier: API_CONFIG.RETRY_BACKOFF_MULTIPLIER
    });
    console.log(`✅ Retry logic test passed: ${result}\n`);
  } catch (error) {
    console.log(`❌ Retry logic test failed: ${error.message}\n`);
  }
}

// Enhanced retry function with exponential backoff
async function withRetry(operation, options = {}) {
  const {
    maxAttempts = API_CONFIG.RETRY_ATTEMPTS,
    delay = API_CONFIG.RETRY_DELAY,
    backoffMultiplier = API_CONFIG.RETRY_BACKOFF_MULTIPLIER
  } = options;

  let lastError;
  let currentDelay = delay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts) {
        throw lastError;
      }

      console.log(`   Retrying in ${currentDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, currentDelay));
      
      // Exponential backoff with jitter
      const jitter = Math.random() * 0.1 * currentDelay;
      currentDelay = Math.min(currentDelay * backoffMultiplier + jitter, 30000);
    }
  }

  throw lastError;
}

// Test timeout handling
async function testTimeoutHandling() {
  console.log('⏱️ Testing timeout handling...\n');
  
  try {
    await axios.get('http://httpstat.us/200?sleep=15000', {
      timeout: 2000
    });
    console.log('❌ Timeout test failed - should have timed out');
  } catch (error) {
    const apiError = handleError(error);
    console.log(`✅ Timeout handled correctly: ${apiError.message} (${apiError.code})`);
  }
  console.log('');
}

// Test Portuguese error translation
async function testPortugueseErrorTranslation() {
  console.log('🌐 Testing Portuguese error translation...\n');
  
  const testMessages = [
    'Token de acesso não fornecido',
    'Credenciais inválidas',
    'E-mail ou senha incorretos',
    'Post não encontrado',
    'Some unknown error message'
  ];
  
  testMessages.forEach(message => {
    const translated = translatePortugueseError(message);
    console.log(`"${message}" → "${translated}"`);
  });
  
  console.log('');
}

// Test authentication with working endpoint
async function testAuthentication(workingBaseUrl) {
  if (!workingBaseUrl) {
    console.log('⚠️ Skipping authentication test - no working base URL found\n');
    return;
  }
  
  console.log('🔐 Testing authentication flow...\n');
  
  try {
    // Test login with invalid credentials
    await axios.post(`${workingBaseUrl}/login`, {
      email: 'test@example.com',
      senha: 'wrongpassword'
    }, {
      timeout: API_CONFIG.TIMEOUT,
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('❌ Authentication test failed - should have returned error');
  } catch (error) {
    const apiError = handleError(error);
    console.log(`✅ Authentication error handled: ${apiError.message} (${apiError.code})`);
  }
  
  console.log('');
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Enhanced Network Configuration Tests\n');
  console.log('='.repeat(60) + '\n');
  
  try {
    // Test connectivity and get working URL
    const workingBaseUrl = await testConnectivityWithFallback();
    
    // Test retry logic
    await testRetryLogic();
    
    // Test timeout handling
    await testTimeoutHandling();
    
    // Test Portuguese error translation
    await testPortugueseErrorTranslation();
    
    // Test authentication if we have a working URL
    await testAuthentication(workingBaseUrl);
    
    console.log('='.repeat(60));
    console.log('✅ All network configuration tests completed!');
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
  }
}

runAllTests();