// Test to verify the exact endpoint structure expected by the backend
const axios = require('axios');

async function testEndpointStructure() {
  const baseURL = 'http://localhost:3001';
  
  console.log('🔍 Testing endpoint structure...\n');
  
  // Test different endpoint variations to understand the structure
  const endpointTests = [
    // Posts endpoints
    { path: '/api/posts', description: 'Posts endpoint' },
    { path: '/posts', description: 'Posts without /api prefix' },
    { path: '/api/posts/1', description: 'Single post endpoint' },
    { path: '/api/posts/search/test', description: 'Search posts endpoint' },
    
    // Comments endpoints
    { path: '/api/posts/comentarios/1', description: 'Comments endpoint' },
    { path: '/api/comentarios/1', description: 'Comments alternative endpoint' },
    
    // Likes endpoints
    { path: '/api/posts/like/1', description: 'Likes endpoint' },
    { path: '/api/like/1', description: 'Likes alternative endpoint' },
    
    // Auth endpoints
    { path: '/api/login', description: 'Login endpoint' },
    { path: '/login', description: 'Login without /api prefix' },
    { path: '/api/register', description: 'Register endpoint' },
    { path: '/register', description: 'Register without /api prefix' },
  ];
  
  for (const test of endpointTests) {
    try {
      const response = await axios.get(`${baseURL}${test.path}`, {
        timeout: 2000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ ${test.description}: ${response.status} - ${response.statusText}`);
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.error || error.response.statusText;
        
        if (status === 401) {
          console.log(`🔐 ${test.description}: ${status} - Authentication required (${message})`);
        } else if (status === 404) {
          console.log(`❌ ${test.description}: ${status} - Not found`);
        } else if (status === 405) {
          console.log(`⚠️  ${test.description}: ${status} - Method not allowed (endpoint exists but wrong method)`);
        } else {
          console.log(`⚠️  ${test.description}: ${status} - ${message}`);
        }
      } else if (error.code === 'ECONNREFUSED') {
        console.log(`❌ ${test.description}: Connection refused`);
      } else {
        console.log(`❌ ${test.description}: ${error.message}`);
      }
    }
  }
  
  console.log('\n🔍 Testing POST endpoints...\n');
  
  // Test POST endpoints with minimal data
  const postTests = [
    {
      path: '/api/login',
      data: { email: 'test@test.com', senha: 'test' },
      description: 'Login POST'
    },
    {
      path: '/api/register',
      data: { nome: 'Test', email: 'test@test.com', senha: 'test', tipo_usuario: 'aluno' },
      description: 'Register POST'
    },
    {
      path: '/api/posts',
      data: { title: 'Test', content: 'Test content' },
      description: 'Create post POST'
    }
  ];
  
  for (const test of postTests) {
    try {
      const response = await axios.post(`${baseURL}${test.path}`, test.data, {
        timeout: 2000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ ${test.description}: ${response.status} - ${response.statusText}`);
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.error || error.response.statusText;
        
        if (status === 401) {
          console.log(`🔐 ${test.description}: ${status} - Authentication required (${message})`);
        } else if (status === 400) {
          console.log(`⚠️  ${test.description}: ${status} - Bad request (${message})`);
        } else if (status === 404) {
          console.log(`❌ ${test.description}: ${status} - Not found`);
        } else {
          console.log(`⚠️  ${test.description}: ${status} - ${message}`);
        }
      } else {
        console.log(`❌ ${test.description}: ${error.message}`);
      }
    }
  }
}

testEndpointStructure();