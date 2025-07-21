const axios = require('axios');

// Test different base URLs for Android emulator compatibility
const testUrls = [
  'http://localhost:3001/api',
  'http://10.0.2.2:3001/api',
  'http://127.0.0.1:3001/api'
];

async function testNetworkConnectivity() {
  console.log('Testing network connectivity...\n');

  for (const baseUrl of testUrls) {
    console.log(`Testing: ${baseUrl}`);
    
    try {
      // Test basic connectivity with timeout
      const response = await axios.get(`${baseUrl}/posts`, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ SUCCESS: ${baseUrl}`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
      
    } catch (error) {
      console.log(`❌ FAILED: ${baseUrl}`);
      
      if (error.code === 'ECONNREFUSED') {
        console.log('   Error: Connection refused - server may not be running');
      } else if (error.code === 'ENOTFOUND') {
        console.log('   Error: Host not found - DNS resolution failed');
      } else if (error.code === 'ETIMEDOUT') {
        console.log('   Error: Connection timeout');
      } else if (error.response) {
        console.log(`   Error: HTTP ${error.response.status} - ${error.response.statusText}`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
    }
    
    console.log('');
  }
}

// Test retry logic
async function testRetryLogic() {
  console.log('Testing retry logic...\n');
  
  const maxAttempts = 3;
  let attempt = 0;
  
  const retryOperation = async () => {
    attempt++;
    console.log(`Attempt ${attempt}/${maxAttempts}`);
    
    if (attempt < 3) {
      throw new Error('Simulated network error');
    }
    
    return 'Success!';
  };
  
  try {
    const result = await withRetry(retryOperation, {
      maxAttempts,
      delay: 1000,
      backoffMultiplier: 2
    });
    console.log(`✅ Retry logic test passed: ${result}`);
  } catch (error) {
    console.log(`❌ Retry logic test failed: ${error.message}`);
  }
}

async function withRetry(operation, options = {}) {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoffMultiplier = 2
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
      currentDelay *= backoffMultiplier;
    }
  }

  throw lastError;
}

// Run tests
async function runTests() {
  try {
    await testNetworkConnectivity();
    await testRetryLogic();
  } catch (error) {
    console.error('Test execution failed:', error);
  }
}

runTests();