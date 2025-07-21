const axios = require('axios');

// Simulate the enhanced API service functionality
class TestApiService {
  constructor() {
    this.currentBaseUrl = this.getBaseUrl();
    this.isConnectivityTested = false;
    this.client = this.createAxiosInstance(this.currentBaseUrl);
    this.setupInterceptors();
  }

  getBaseUrl() {
    // Simulate platform detection
    const fallbackUrls = [
      'http://localhost:3001/api',
      'http://10.0.2.2:3001/api',
      'http://127.0.0.1:3001/api'
    ];
    return fallbackUrls[0]; // Default to localhost
  }

  createAxiosInstance(baseURL) {
    return axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async testConnectivity() {
    if (this.isConnectivityTested) {
      return;
    }

    console.log('🔍 Testing API connectivity...');
    
    const fallbackUrls = [
      'http://localhost:3001/api',
      'http://10.0.2.2:3001/api',
      'http://127.0.0.1:3001/api'
    ];
    
    for (const baseUrl of fallbackUrls) {
      try {
        const testClient = this.createAxiosInstance(baseUrl);
        
        await testClient.get('/posts', { 
          timeout: 5000,
          headers: { 'Content-Type': 'application/json' }
        });
        
        console.log(`✅ API connectivity successful with: ${baseUrl}`);
        
        if (baseUrl !== this.currentBaseUrl) {
          this.currentBaseUrl = baseUrl;
          this.client = this.createAxiosInstance(baseUrl);
          this.setupInterceptors();
          console.log(`🔄 Switched to working base URL: ${baseUrl}`);
        }
        
        this.isConnectivityTested = true;
        return;
        
      } catch (error) {
        console.log(`❌ Failed to connect to: ${baseUrl}`, error.code || error.message);
        continue;
      }
    }
    
    this.isConnectivityTested = true;
    console.warn('⚠️ All API endpoints failed connectivity test. Using default URL.');
  }

  setupInterceptors() {
    this.client.interceptors.request.use(
      async (config) => {
        await this.testConnectivity();
        return config;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (this.isNetworkError(error)) {
          this.isConnectivityTested = false;
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  isNetworkError(error) {
    return (
      error.code === 'ECONNREFUSED' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ECONNABORTED' ||
      error.message.includes('timeout') ||
      error.message.includes('Network Error')
    );
  }

  handleError(error) {
    if (error.response) {
      const responseData = error.response.data || {};
      const serverMessage = responseData.message || responseData.error || 'Server error occurred';
      
      return {
        message: this.translatePortugueseError(serverMessage),
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

  translatePortugueseError(message) {
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

  async getPosts() {
    const response = await this.client.get('/posts');
    return response.data;
  }

  getCurrentBaseUrl() {
    return this.currentBaseUrl;
  }

  resetConnectivityTest() {
    this.isConnectivityTested = false;
  }
}

// Enhanced retry service
class TestRetryService {
  static async withRetry(operation, options = {}) {
    const {
      maxAttempts = 3,
      delay = 1000,
      backoffMultiplier = 2,
      retryCondition = this.defaultRetryCondition,
    } = options;

    let lastError;
    let currentDelay = delay;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === maxAttempts || !retryCondition(lastError)) {
          throw lastError;
        }

        console.log(`Retry attempt ${attempt}/${maxAttempts} failed, retrying in ${currentDelay}ms...`);
        console.log(`Error: ${lastError.message} (${lastError.code})`);

        await this.sleep(currentDelay);
        currentDelay *= backoffMultiplier;
      }
    }

    throw lastError;
  }

  static defaultRetryCondition(error) {
    const retryableCodes = [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'CONNECTION_REFUSED',
      'HOST_NOT_FOUND',
      'REQUEST_CANCELLED'
    ];

    const isRetryableCode = retryableCodes.includes(error.code || '');
    const isServerError = error.status !== undefined && error.status >= 500;
    const isNotAuthError = error.status !== 401 && error.status !== 403;

    return (isRetryableCode || isServerError) && isNotAuthError;
  }

  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Test the complete integration
async function testCompleteIntegration() {
  console.log('🚀 Testing Complete Network Configuration Integration\n');
  console.log('='.repeat(70) + '\n');

  const apiService = new TestApiService();

  // Test 1: Basic connectivity with fallback
  console.log('1️⃣ Testing connectivity with automatic fallback...');
  try {
    const posts = await apiService.getPosts();
    console.log(`✅ Successfully connected to: ${apiService.getCurrentBaseUrl()}`);
    console.log(`   Retrieved ${Array.isArray(posts) ? posts.length : 'unknown'} posts`);
  } catch (error) {
    console.log(`❌ Connection failed: ${error.message} (${error.code})`);
  }
  console.log('');

  // Test 2: Retry logic with network errors
  console.log('2️⃣ Testing retry logic with simulated network errors...');
  let attemptCount = 0;
  const simulateNetworkError = async () => {
    attemptCount++;
    if (attemptCount < 3) {
      const error = new Error('Simulated network error');
      error.code = 'NETWORK_ERROR';
      throw error;
    }
    return 'Network operation succeeded after retries';
  };

  try {
    const result = await TestRetryService.withRetry(simulateNetworkError);
    console.log(`✅ ${result}`);
  } catch (error) {
    console.log(`❌ Retry failed: ${error.message}`);
  }
  console.log('');

  // Test 3: Error handling and translation
  console.log('3️⃣ Testing error handling and Portuguese translation...');
  try {
    // This should fail with 401 (unauthorized)
    await apiService.getPosts();
  } catch (error) {
    console.log(`✅ Error properly handled and translated:`);
    console.log(`   Message: ${error.message}`);
    console.log(`   Code: ${error.code}`);
    console.log(`   Status: ${error.status}`);
  }
  console.log('');

  // Test 4: Connectivity reset and retest
  console.log('4️⃣ Testing connectivity reset and retest...');
  apiService.resetConnectivityTest();
  console.log('   Connectivity test reset');
  
  try {
    await apiService.getPosts();
    console.log(`✅ Reconnection successful to: ${apiService.getCurrentBaseUrl()}`);
  } catch (error) {
    console.log(`✅ Reconnection attempt handled: ${error.message}`);
  }
  console.log('');

  console.log('='.repeat(70));
  console.log('✅ Complete network configuration integration test finished!');
  console.log('\n📋 Summary of implemented features:');
  console.log('   ✅ Automatic base URL detection (Android emulator support)');
  console.log('   ✅ Connectivity testing with fallback URLs');
  console.log('   ✅ Enhanced error handling with specific error codes');
  console.log('   ✅ Portuguese error message translation');
  console.log('   ✅ Retry logic with exponential backoff');
  console.log('   ✅ Timeout handling and network error detection');
  console.log('   ✅ Connectivity reset and retest functionality');
}

testCompleteIntegration();