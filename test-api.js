// Simple test to verify API service configuration
const axios = require('axios');

async function testAPI() {
  const baseURL = 'http://localhost:3001'; // Working URL
  
  console.log(`Testing API connection to ${baseURL}...`);
  
  // First test endpoints that don't require authentication
  await testPublicEndpoints(baseURL);
  
  // Then test authentication and protected endpoints
  await testAuthenticatedEndpoints(baseURL);
}

async function testPublicEndpoints(baseURL) {
  console.log('\n🔍 Testing public endpoints...');
  
  // Test registration endpoint with different data formats
  const registrationAttempts = [
    {
      nome: 'Test User',
      email: `test${Date.now()}@example.com`,
      senha: 'password123',
      tipo_usuario: 'aluno'
    },
    {
      name: 'Test User 2',
      email: `test2${Date.now()}@example.com`,
      password: 'password123',
      userType: 'student'
    },
    {
      nome: 'Test User 3',
      email: `test3${Date.now()}@example.com`,
      senha: 'password123',
      tipo_usuario: 'professor'
    }
  ];

  for (let i = 0; i < registrationAttempts.length; i++) {
    try {
      console.log(`Testing registration attempt ${i + 1}...`);
      const response = await axios.post(`${baseURL}/api/register`, registrationAttempts[i], {
        timeout: 3000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ Registration attempt ${i + 1}: ${response.status}`);
      console.log('Registration response:', response.data);
      
      // Try to login with the registered user
      const loginData = {
        email: registrationAttempts[i].email,
        senha: registrationAttempts[i].senha || registrationAttempts[i].password
      };
      
      try {
        const loginResponse = await axios.post(`${baseURL}/api/login`, loginData, {
          timeout: 3000,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`✅ Login with registered user: ${loginResponse.status}`);
        return loginResponse.data.accessToken;
      } catch (loginError) {
        console.log(`⚠️  Login with registered user failed: ${loginError.response?.status}`);
      }
      
    } catch (error) {
      if (error.response) {
        console.log(`⚠️  Registration attempt ${i + 1}: ${error.response.status} - ${error.response.data?.error || error.response.statusText}`);
        console.log('Registration error data:', error.response.data);
      } else {
        console.log(`❌ Registration attempt ${i + 1}: ${error.message}`);
      }
    }
  }
  
  // Test login endpoint
  console.log('\nTesting login endpoint...');
  try {
    const response = await axios.post(`${baseURL}/api/login`, {
      email: 'admin@example.com', // Try with a default admin account
      senha: 'admin123'
    }, {
      timeout: 3000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Login endpoint: ${response.status}`);
    console.log('Login response:', response.data);
    return response.data.accessToken;
  } catch (error) {
    if (error.response) {
      console.log(`⚠️  Login endpoint: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`);
      console.log('Login error data:', error.response.data);
    } else {
      console.log(`❌ Login endpoint: ${error.message}`);
    }
  }
  
  return null;
}

async function testAuthenticatedEndpoints(baseURL) {
  console.log('\n🔍 Testing authenticated endpoints...');
  
  // Try to get a token first
  let token = null;
  try {
    const loginResponse = await axios.post(`${baseURL}/api/login`, {
      email: 'admin@example.com',
      senha: 'admin123'
    });
    token = loginResponse.data.accessToken;
    console.log('✅ Got access token for testing');
  } catch (error) {
    console.log('⚠️  Could not get access token, testing without authentication');
  }
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers.accesstoken = token; // Use the correct header name
  }
  
  const endpoints = [
    { method: 'GET', path: '/api/posts', description: 'Get all posts' },
    { method: 'GET', path: '/api/posts/1', description: 'Get single post' },
    { method: 'GET', path: '/api/posts/search/test', description: 'Search posts' },
    { method: 'GET', path: '/api/posts/comentarios/1', description: 'Get comments for post 1' },
    { method: 'GET', path: '/api/posts/like/1', description: 'Get likes for post 1' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios({
        method: endpoint.method,
        url: `${baseURL}${endpoint.path}`,
        timeout: 3000,
        headers
      });
      
      console.log(`✅ ${endpoint.description}: ${response.status}`);
      if (endpoint.path === '/api/posts' && response.data) {
        console.log(`   Found ${Array.isArray(response.data) ? response.data.length : 'unknown'} posts`);
      }
    } catch (error) {
      if (error.response) {
        console.log(`⚠️  ${endpoint.description}: ${error.response.status} - ${error.response.data?.error || error.response.statusText}`);
      } else {
        console.log(`❌ ${endpoint.description}: ${error.message}`);
      }
    }
  }
  
  // Test POST endpoints if we have a token
  if (token) {
    console.log('\n🔍 Testing POST endpoints...');
    
    // Test create post
    try {
      const response = await axios.post(`${baseURL}/api/posts`, {
        title: 'Test Post',
        content: 'This is a test post content',
        materia: 'Test Subject'
      }, {
        timeout: 3000,
        headers
      });
      
      console.log(`✅ Create post: ${response.status}`);
      console.log('Created post:', response.data);
      
      const postId = response.data.id;
      
      // Test create comment
      if (postId) {
        try {
          const commentResponse = await axios.post(`${baseURL}/api/posts/comentarios`, {
            postId: postId,
            comentario: 'This is a test comment'
          }, {
            timeout: 3000,
            headers
          });
          
          console.log(`✅ Create comment: ${commentResponse.status}`);
        } catch (error) {
          if (error.response) {
            console.log(`⚠️  Create comment: ${error.response.status} - ${error.response.data?.error || error.response.statusText}`);
          } else {
            console.log(`❌ Create comment: ${error.message}`);
          }
        }
        
        // Test toggle like
        try {
          const likeResponse = await axios.post(`${baseURL}/api/posts/like`, {
            postId: postId
          }, {
            timeout: 3000,
            headers
          });
          
          console.log(`✅ Toggle like: ${likeResponse.status}`);
        } catch (error) {
          if (error.response) {
            console.log(`⚠️  Toggle like: ${error.response.status} - ${error.response.data?.error || error.response.statusText}`);
          } else {
            console.log(`❌ Toggle like: ${error.message}`);
          }
        }
      }
      
    } catch (error) {
      if (error.response) {
        console.log(`⚠️  Create post: ${error.response.status} - ${error.response.data?.error || error.response.statusText}`);
      } else {
        console.log(`❌ Create post: ${error.message}`);
      }
    }
  }
}

testAPI();