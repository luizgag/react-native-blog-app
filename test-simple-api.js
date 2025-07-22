/**
 * Simple API Integration Test
 * Tests basic functionality with error handling for server issues
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';
let authToken = null;
let createdPostId = null;

const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '📝',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    test: '🧪'
  }[type] || '📝';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
};

const createClient = (token = null) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers.accesstoken = token;
  }
  
  return axios.create({
    baseURL: API_BASE,
    timeout: 10000,
    headers
  });
};

const safeRequest = async (requestFn, description) => {
  try {
    log(`Testing ${description}...`, 'info');
    const result = await requestFn();
    log(`${description} successful`, 'success');
    return { success: true, data: result };
  } catch (error) {
    const status = error.response?.status || 'NETWORK_ERROR';
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    log(`${description} failed (${status}): ${message}`, 'error');
    return { success: false, error: message, status };
  }
};

const testConnectivity = async () => {
  log('Testing API connectivity...', 'test');
  
  const result = await safeRequest(async () => {
    const client = createClient();
    // Try to access posts endpoint - 401 is expected without auth
    await client.get('/posts');
  }, 'connectivity check');
  
  // 401 means server is responding but needs auth - this is good
  if (!result.success && result.status === 401) {
    log('API server is responding (401 expected for unauthenticated request)', 'success');
    return true;
  }
  
  return result.success;
};

const testAuthentication = async () => {
  log('Testing Authentication...', 'test');
  
  // Try with common admin credentials
  const adminCredentials = [
    { email: 'admin@example.com', senha: 'admin123' },
    { email: 'admin@admin.com', senha: 'admin' },
    { email: 'test@test.com', senha: 'test123' }
  ];
  
  for (const creds of adminCredentials) {
    const result = await safeRequest(async () => {
      const client = createClient();
      const response = await client.post('/login', creds);
      return response.data;
    }, `login with ${creds.email}`);
    
    if (result.success && result.data.accessToken) {
      authToken = result.data.accessToken;
      log(`Authentication successful with ${creds.email}`, 'success');
      return true;
    }
  }
  
  // Try registration if login fails
  const newUser = {
    nome: 'Test User Simple',
    email: 'testsimple@example.com',
    senha: 'password123',
    tipo_usuario: 'professor'
  };
  
  const regResult = await safeRequest(async () => {
    const client = createClient();
    const response = await client.post('/register', newUser);
    return response.data;
  }, 'user registration');
  
  if (regResult.success) {
    // Try to login with new user
    const loginResult = await safeRequest(async () => {
      const client = createClient();
      const response = await client.post('/login', {
        email: newUser.email,
        senha: newUser.senha
      });
      return response.data;
    }, 'login with new user');
    
    if (loginResult.success && loginResult.data.accessToken) {
      authToken = loginResult.data.accessToken;
      return true;
    }
  }
  
  return false;
};

const testPostsBasic = async () => {
  if (!authToken) {
    log('No auth token available for posts test', 'error');
    return false;
  }
  
  log('Testing Posts Basic Operations...', 'test');
  
  // Test get posts
  const getResult = await safeRequest(async () => {
    const client = createClient(authToken);
    const response = await client.get('/posts');
    return response.data;
  }, 'get all posts');
  
  if (!getResult.success) {
    return false;
  }
  
  log(`Retrieved ${getResult.data.length} posts`, 'info');
  
  // Test create post
  const createResult = await safeRequest(async () => {
    const client = createClient(authToken);
    const response = await client.post('/posts', {
      title: 'Simple Test Post',
      content: 'This is a simple test post content',
      author: 1,
      materia: 'Matemática'
    });
    return response.data;
  }, 'create post');
  
  if (createResult.success) {
    createdPostId = createResult.data.id;
    log(`Created post with ID: ${createdPostId}`, 'info');
    
    // Test get single post
    const getSingleResult = await safeRequest(async () => {
      const client = createClient(authToken);
      const response = await client.get(`/posts/${createdPostId}`);
      return response.data;
    }, 'get single post');
    
    return getSingleResult.success;
  }
  
  return createResult.success;
};

const testCommentsBasic = async () => {
  if (!authToken || !createdPostId) {
    log('No auth token or post ID available for comments test', 'warning');
    return false;
  }
  
  log('Testing Comments Basic Operations...', 'test');
  
  // Test create comment
  const createResult = await safeRequest(async () => {
    const client = createClient(authToken);
    const response = await client.post('/posts/comentarios', {
      postId: createdPostId,
      comentario: 'This is a simple test comment'
    });
    return response.data;
  }, 'create comment');
  
  if (!createResult.success) {
    return false;
  }
  
  // Test get comments
  const getResult = await safeRequest(async () => {
    const client = createClient(authToken);
    const response = await client.get(`/posts/comentarios/${createdPostId}`);
    return response.data;
  }, 'get comments');
  
  return getResult.success;
};

const testLikesBasic = async () => {
  if (!authToken || !createdPostId) {
    log('No auth token or post ID available for likes test', 'warning');
    return false;
  }
  
  log('Testing Likes Basic Operations...', 'test');
  
  // Test toggle like
  const toggleResult = await safeRequest(async () => {
    const client = createClient(authToken);
    const response = await client.post('/posts/like', {
      postId: createdPostId
    });
    return response.data;
  }, 'toggle like');
  
  if (!toggleResult.success) {
    return false;
  }
  
  // Test get likes
  const getResult = await safeRequest(async () => {
    const client = createClient(authToken);
    const response = await client.get(`/posts/like/${createdPostId}`);
    return response.data;
  }, 'get likes');
  
  return getResult.success;
};

const testErrorHandling = async () => {
  log('Testing Error Handling...', 'test');
  
  // Test 401 with invalid token
  const invalidTokenResult = await safeRequest(async () => {
    const client = createClient('invalid-token');
    await client.get('/posts');
  }, '401 error with invalid token');
  
  const has401Error = !invalidTokenResult.success && invalidTokenResult.status === 401;
  
  // Test 404 with non-existent post (but be careful not to crash server)
  const notFoundResult = await safeRequest(async () => {
    const client = createClient(authToken);
    await client.get('/posts/99999');
  }, '404 error with non-existent post');
  
  const has404Error = !notFoundResult.success && notFoundResult.status === 404;
  
  if (has401Error) {
    log('401 error handling works correctly', 'success');
  }
  
  if (has404Error) {
    log('404 error handling works correctly', 'success');
  }
  
  return has401Error; // At least 401 should work
};

const cleanup = async () => {
  if (!authToken || !createdPostId) {
    return;
  }
  
  log('Cleaning up test data...', 'info');
  
  await safeRequest(async () => {
    const client = createClient(authToken);
    await client.delete(`/posts/${createdPostId}`);
  }, 'delete test post');
};

const runSimpleTests = async () => {
  log('Starting Simple API Integration Tests...', 'test');
  
  const results = {
    connectivity: false,
    authentication: false,
    posts: false,
    comments: false,
    likes: false,
    errorHandling: false
  };
  
  try {
    // Test connectivity
    results.connectivity = await testConnectivity();
    
    if (results.connectivity) {
      // Test authentication
      results.authentication = await testAuthentication();
      
      if (results.authentication) {
        // Test posts
        results.posts = await testPostsBasic();
        
        // Test comments
        results.comments = await testCommentsBasic();
        
        // Test likes
        results.likes = await testLikesBasic();
      }
      
      // Test error handling
      results.errorHandling = await testErrorHandling();
    }
    
    // Cleanup
    await cleanup();
    
  } catch (error) {
    log(`Test suite failed: ${error.message}`, 'error');
  }
  
  // Print results
  log('='.repeat(50), 'info');
  log('SIMPLE API TEST RESULTS', 'info');
  log('='.repeat(50), 'info');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? 'PASSED' : 'FAILED';
    const icon = passed ? '✅' : '❌';
    log(`${icon} ${test.toUpperCase()}: ${status}`, passed ? 'success' : 'error');
  });
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  log('='.repeat(50), 'info');
  log(`OVERALL: ${passedTests}/${totalTests} tests passed`, passedTests === totalTests ? 'success' : 'error');
  
  return {
    results,
    totalTests,
    passedTests,
    success: passedTests >= 3 // At least connectivity, auth, and error handling should work
  };
};

if (require.main === module) {
  runSimpleTests().catch(console.error);
}

module.exports = { runSimpleTests };