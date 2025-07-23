// API Integration Test Utility
// This file contains functions to test the API integration

import { apiService } from '../services/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ApiTestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export class ApiIntegrationTester {
  private testResults: { [key: string]: ApiTestResult } = {};

  async runAllTests(): Promise<{ [key: string]: ApiTestResult }> {
    console.log('🧪 Starting API Integration Tests...');
    
    // Test 1: Login
    await this.testLogin();
    
    // Test 2: Get Posts (requires authentication)
    if (this.testResults.login?.success) {
      await this.testGetPosts();
      await this.testCreatePost();
      await this.testSearchPosts();
    }
    
    console.log('✅ API Integration Tests Complete');
    return this.testResults;
  }

  private async testLogin(): Promise<void> {
    try {
      console.log('🔐 Testing Login...');
      
      // Test with dummy credentials - replace with actual test credentials
      const result = await apiService.login({
        email: 'test@example.com',
        senha: 'test123'
      });

      this.testResults.login = {
        success: true,
        message: 'Login successful',
        data: {
          hasToken: !!result.token,
          userEmail: result.user.email,
          userRole: result.user.role
        }
      };

      console.log('✅ Login test passed');
    } catch (error: any) {
      this.testResults.login = {
        success: false,
        message: 'Login failed',
        error: error.message
      };
      console.log('❌ Login test failed:', error.message);
    }
  }

  private async testGetPosts(): Promise<void> {
    try {
      console.log('📝 Testing Get Posts...');
      
      const posts = await apiService.getPosts();

      this.testResults.getPosts = {
        success: true,
        message: `Retrieved ${posts.length} posts`,
        data: {
          postsCount: posts.length,
          firstPost: posts[0] || null
        }
      };

      console.log('✅ Get Posts test passed');
    } catch (error: any) {
      this.testResults.getPosts = {
        success: false,
        message: 'Failed to get posts',
        error: error.message
      };
      console.log('❌ Get Posts test failed:', error.message);
    }
  }

  private async testCreatePost(): Promise<void> {
    try {
      console.log('➕ Testing Create Post...');
      
      const newPost = await apiService.createPost({
        title: 'Test Post from React Native',
        content: 'This is a test post created from the React Native app to verify API integration.',
      });

      this.testResults.createPost = {
        success: true,
        message: 'Post created successfully',
        data: {
          postId: newPost.id,
          title: newPost.title
        }
      };

      console.log('✅ Create Post test passed');
    } catch (error: any) {
      this.testResults.createPost = {
        success: false,
        message: 'Failed to create post',
        error: error.message
      };
      console.log('❌ Create Post test failed:', error.message);
    }
  }

  private async testSearchPosts(): Promise<void> {
    try {
      console.log('🔍 Testing Search Posts...');
      
      const searchResults = await apiService.searchPosts('test');

      this.testResults.searchPosts = {
        success: true,
        message: `Found ${searchResults.length} posts matching 'test'`,
        data: {
          resultsCount: searchResults.length
        }
      };

      console.log('✅ Search Posts test passed');
    } catch (error: any) {
      this.testResults.searchPosts = {
        success: false,
        message: 'Failed to search posts',
        error: error.message
      };
      console.log('❌ Search Posts test failed:', error.message);
    }
  }

  async testTokenValidation(): Promise<ApiTestResult> {
    try {
      console.log('🔑 Testing Token Validation...');
      
      const token = await AsyncStorage.getItem('@blog_app_auth_token');
      
      if (!token) {
        return {
          success: false,
          message: 'No token found in storage',
          error: 'Token not found'
        };
      }

      // Try to make an authenticated request
      await apiService.getPosts();

      return {
        success: true,
        message: 'Token is valid and working',
        data: { hasToken: true }
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Token validation failed',
        error: error.message
      };
    }
  }

  getTestSummary(): string {
    const results = Object.entries(this.testResults);
    const passed = results.filter(([_, result]) => result.success).length;
    const total = results.length;
    
    let summary = `\n📊 API Integration Test Summary\n`;
    summary += `Passed: ${passed}/${total}\n\n`;
    
    results.forEach(([testName, result]) => {
      const status = result.success ? '✅' : '❌';
      summary += `${status} ${testName}: ${result.message}\n`;
      if (!result.success && result.error) {
        summary += `   Error: ${result.error}\n`;
      }
    });
    
    return summary;
  }
}

// Export singleton instance
export const apiTester = new ApiIntegrationTester();

// Quick test function for development
export const quickApiTest = async () => {
  const results = await apiTester.runAllTests();
  console.log(apiTester.getTestSummary());
  return results;
};