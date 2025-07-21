// Simple test to verify API service configuration
const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing API connection...');
    
    // Test basic connection
    const response = await axios.get('http://10.0.2.2:3001/api/posts', {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API connection successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
  } catch (error) {
    console.log('❌ API connection failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else if (error.request) {
      console.log('Network error - no response received');
      console.log('Error:', error.message);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testAPI();