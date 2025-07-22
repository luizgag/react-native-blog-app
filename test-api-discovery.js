/**
 * API Discovery Test - Check what endpoints are available
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

const testEndpoint = async (method, endpoint, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: 5000
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return {
      status: response.status,
      data: response.data,
      success: true
    };
  } catch (error) {
    return {
      status: error.response?.status || 'ERROR',
      data: error.response?.data || error.message,
      success: false,
      error: error.message
    };
  }
};

const runDiscovery = async () => {
  console.log('🔍 API Discovery Test');
  console.log('='.repeat(50));
  
  const endpoints = [
    { method: 'GET', path: '/posts', desc: 'Get posts (should require auth)' },
    { method: 'POST', path: '/register', desc: 'Register user', data: {
      nome: 'Discovery Test',
      email: 'discovery@test.com',
      senha: 'test123',
      tipo_usuario: 'professor'
    }},
    { method: 'POST', path: '/login', desc: 'Login user', data: {
      email: 'discovery@test.com',
      senha: 'test123'
    }},
    { method: 'GET', path: '/', desc: 'Root endpoint' },
    { method: 'GET', path: '/health', desc: 'Health check' },
    { method: 'GET', path: '/status', desc: 'Status check' },
  ];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint.method, endpoint.path, endpoint.data);
    const statusColor = result.success ? '✅' : '❌';
    const statusText = result.success ? 'SUCCESS' : 'FAILED';
    
    console.log(`${statusColor} ${endpoint.method} ${endpoint.path} - ${statusText} (${result.status})`);
    console.log(`   Description: ${endpoint.desc}`);
    
    if (result.data && typeof result.data === 'object') {
      console.log(`   Response: ${JSON.stringify(result.data).substring(0, 100)}...`);
    } else if (result.data) {
      console.log(`   Response: ${result.data.toString().substring(0, 100)}...`);
    }
    
    if (!result.success && result.error) {
      console.log(`   Error: ${result.error}`);
    }
    
    console.log('');
  }
  
  // Test with a token if we can get one
  console.log('🔑 Testing with authentication...');
  const loginResult = await testEndpoint('POST', '/login', {
    email: 'admin@example.com',
    senha: 'admin123'
  });
  
  if (loginResult.success && loginResult.data.accessToken) {
    console.log('✅ Got access token, testing authenticated endpoints...');
    const token = loginResult.data.accessToken;
    
    const authEndpoints = [
      { method: 'GET', path: '/posts', desc: 'Get posts with auth' },
      { method: 'GET', path: '/users/1', desc: 'Get user by ID' },
    ];
    
    for (const endpoint of authEndpoints) {
      const result = await testEndpoint(endpoint.method, endpoint.path, null, {
        'accesstoken': token
      });
      
      const statusColor = result.success ? '✅' : '❌';
      const statusText = result.success ? 'SUCCESS' : 'FAILED';
      
      console.log(`${statusColor} ${endpoint.method} ${endpoint.path} - ${statusText} (${result.status})`);
      if (result.data && typeof result.data === 'object') {
        console.log(`   Response: ${JSON.stringify(result.data).substring(0, 100)}...`);
      }
      console.log('');
    }
  } else {
    console.log('❌ Could not get access token for authenticated tests');
    console.log(`   Login result: ${JSON.stringify(loginResult.data)}`);
  }
};

runDiscovery().catch(console.error);