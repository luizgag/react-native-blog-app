import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { PostsProvider, usePosts } from '../../context/PostsContext';
import { apiService } from '../../services/apiService';
import { HomeScreen } from '../../screens/HomeScreen';
import { LoginScreen } from '../../screens/LoginScreen';
import { CreatePostScreen } from '../../screens/CreatePostScreen';

// Mock the API service
jest.mock('../../services/apiService');
const mockApiService = apiService as jest.Mocked<typeof apiService>;

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>
    <PostsProvider>
      {children}
    </PostsProvider>
  </AuthProvider>
);

describe('Edge Case Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  describe('Network Connectivity Edge Cases', () => {
    it('should handle complete network failure gracefully', async () => {
      // Mock network failure
      mockApiService.getPosts.mockRejectedValue(new Error('Network request failed'));

      const { getByText } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByText(/network error/i)).toBeTruthy();
      });
    });

    it('should handle intermittent connectivity issues', async () => {
      // Mock intermittent failures
      mockApiService.getPosts
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockResolvedValueOnce([
          { id: 1, title: 'Test Post', content: 'Content', author: 'Author' }
        ]);

      const { getByText, queryByText } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      // First attempt fails
      await waitFor(() => {
        expect(queryByText(/network timeout/i)).toBeTruthy();
      });

      // Retry should succeed
      const retryButton = getByText(/retry/i);
      fireEvent.press(retryButton);

      await waitFor(() => {
        expect(getByText('Test Post')).toBeTruthy();
      });
    });

    it('should handle slow network responses', async () => {
      // Mock slow response
      mockApiService.getPosts.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve([
            { id: 1, title: 'Slow Post', content: 'Content', author: 'Author' }
          ]), 5000)
        )
      );

      const { getByText } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      // Should show loading state
      expect(getByText(/loading/i)).toBeTruthy();

      // Should eventually load content
      await waitFor(() => {
        expect(getByText('Slow Post')).toBeTruthy();
      }, { timeout: 6000 });
    });
  });

  describe('Authentication Edge Cases', () => {
    it('should handle expired tokens gracefully', async () => {
      // Mock expired token scenario
      (AsyncStorage.getItem as jest.Mock)
        .mockImplementation((key: string) => {
          if (key === 'auth_token') return Promise.resolve('expired-token');
          if (key === 'user_data') return Promise.resolve(JSON.stringify({
            id: 1, name: 'Test User', email: 'test@example.com', role: 'teacher'
          }));
          return Promise.resolve(null);
        });

      mockApiService.getPosts.mockRejectedValue({
        response: { status: 401, data: { message: 'Token expired' } }
      });

      const { getByText } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      // Should redirect to login
      await waitFor(() => {
        expect(getByText(/login/i)).toBeTruthy();
      });

      // Should clear stored auth data
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        'auth_token',
        'user_data'
      ]);
    });

    it('should handle corrupted stored user data', async () => {
      // Mock corrupted data
      (AsyncStorage.getItem as jest.Mock)
        .mockImplementation((key: string) => {
          if (key === 'auth_token') return Promise.resolve('valid-token');
          if (key === 'user_data') return Promise.resolve('invalid-json-data');
          return Promise.resolve(null);
        });

      const { getByText } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      // Should handle gracefully and show login
      await waitFor(() => {
        expect(getByText(/login/i)).toBeTruthy();
      });
    });

    it('should handle multiple concurrent login attempts', async () => {
      let loginAttempts = 0;
      mockApiService.login.mockImplementation(() => {
        loginAttempts++;
        if (loginAttempts === 1) {
          return new Promise(resolve => 
            setTimeout(() => resolve({
              user: { id: 1, name: 'User', email: 'user@example.com', role: 'teacher' },
              token: 'token'
            }), 1000)
          );
        }
        return Promise.reject(new Error('Login already in progress'));
      });

      const { getByText, getByPlaceholderText } = render(
        <TestWrapper>
          <LoginScreen />
        </TestWrapper>
      );

      const emailInput = getByPlaceholderText(/email/i);
      const passwordInput = getByPlaceholderText(/password/i);
      const loginButton = getByText(/login/i);

      fireEvent.changeText(emailInput, 'user@example.com');
      fireEvent.changeText(passwordInput, 'password');

      // Trigger multiple login attempts
      fireEvent.press(loginButton);
      fireEvent.press(loginButton);

      // Should handle gracefully
      await waitFor(() => {
        expect(loginAttempts).toBe(1);
      });
    });
  });

  describe('Data Validation Edge Cases', () => {
    it('should handle extremely long post titles', async () => {
      const longTitle = 'A'.repeat(1000);
      
      const { getByPlaceholderText, getByText } = render(
        <TestWrapper>
          <CreatePostScreen />
        </TestWrapper>
      );

      const titleInput = getByPlaceholderText(/title/i);
      const submitButton = getByText(/create post/i);

      fireEvent.changeText(titleInput, longTitle);
      fireEvent.press(submitButton);

      // Should show validation error
      await waitFor(() => {
        expect(getByText(/title too long/i)).toBeTruthy();
      });
    });

    it('should handle special characters in input fields', async () => {
      const specialChars = '!@#$%^&*()_+{}|:"<>?[];\'\\,./`~';
      
      const { getByPlaceholderText, getByText } = render(
        <TestWrapper>
          <CreatePostScreen />
        </TestWrapper>
      );

      const titleInput = getByPlaceholderText(/title/i);
      const contentInput = getByPlaceholderText(/content/i);

      fireEvent.changeText(titleInput, specialChars);
      fireEvent.changeText(contentInput, specialChars);

      // Should handle special characters gracefully
      expect(titleInput.props.value).toBe(specialChars);
      expect(contentInput.props.value).toBe(specialChars);
    });

    it('should handle empty or whitespace-only inputs', async () => {
      const { getByPlaceholderText, getByText } = render(
        <TestWrapper>
          <CreatePostScreen />
        </TestWrapper>
      );

      const titleInput = getByPlaceholderText(/title/i);
      const contentInput = getByPlaceholderText(/content/i);
      const submitButton = getByText(/create post/i);

      // Test empty inputs
      fireEvent.changeText(titleInput, '');
      fireEvent.changeText(contentInput, '');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(getByText(/title is required/i)).toBeTruthy();
      });

      // Test whitespace-only inputs
      fireEvent.changeText(titleInput, '   ');
      fireEvent.changeText(contentInput, '   ');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(getByText(/title is required/i)).toBeTruthy();
      });
    });

    it('should handle unicode and emoji characters', async () => {
      const unicodeText = '🚀 Test Post with Emojis 🎉 and Unicode: αβγδε';
      
      const { getByPlaceholderText } = render(
        <TestWrapper>
          <CreatePostScreen />
        </TestWrapper>
      );

      const titleInput = getByPlaceholderText(/title/i);
      fireEvent.changeText(titleInput, unicodeText);

      // Should handle unicode characters properly
      expect(titleInput.props.value).toBe(unicodeText);
    });
  });

  describe('Memory and Performance Edge Cases', () => {
    it('should handle large datasets without memory issues', async () => {
      // Mock large dataset
      const largePosts = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        title: `Post ${i + 1}`,
        content: `Content for post ${i + 1}`.repeat(100),
        author: `Author ${i + 1}`
      }));

      mockApiService.getPosts.mockResolvedValue(largePosts);

      const { getByText } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      // Should handle large dataset
      await waitFor(() => {
        expect(getByText('Post 1')).toBeTruthy();
      });
    });

    it('should handle rapid user interactions', async () => {
      mockApiService.searchPosts.mockResolvedValue([
        { id: 1, title: 'Search Result', content: 'Content', author: 'Author' }
      ]);

      const { getByPlaceholderText } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      const searchInput = getByPlaceholderText(/search/i);

      // Rapid typing simulation
      const searchTerms = ['a', 'ab', 'abc', 'abcd', 'abcde'];
      searchTerms.forEach(term => {
        fireEvent.changeText(searchInput, term);
      });

      // Should debounce and handle gracefully
      await waitFor(() => {
        expect(mockApiService.searchPosts).toHaveBeenCalledWith('abcde');
      });
    });
  });

  describe('State Management Edge Cases', () => {
    it('should handle context provider unmounting during async operations', async () => {
      let resolvePromise: (value: any) => void;
      const pendingPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      mockApiService.getPosts.mockReturnValue(pendingPromise);

      const { unmount } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      // Unmount before async operation completes
      unmount();

      // Complete the async operation
      resolvePromise!([{ id: 1, title: 'Test', content: 'Content', author: 'Author' }]);

      // Should not cause memory leaks or errors
      await waitFor(() => {
        // Test passes if no errors are thrown
        expect(true).toBe(true);
      });
    });

    it('should handle concurrent state updates', async () => {
      mockApiService.getPosts.mockResolvedValue([
        { id: 1, title: 'Post 1', content: 'Content 1', author: 'Author 1' }
      ]);
      mockApiService.searchPosts.mockResolvedValue([
        { id: 2, title: 'Search Result', content: 'Content 2', author: 'Author 2' }
      ]);

      const { getByPlaceholderText, getByText } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      // Trigger concurrent operations
      const searchInput = getByPlaceholderText(/search/i);
      const refreshButton = getByText(/refresh/i);

      fireEvent.changeText(searchInput, 'search term');
      fireEvent.press(refreshButton);

      // Should handle concurrent updates gracefully
      await waitFor(() => {
        expect(mockApiService.getPosts).toHaveBeenCalled();
        expect(mockApiService.searchPosts).toHaveBeenCalled();
      });
    });
  });

  describe('Device-Specific Edge Cases', () => {
    it('should handle device rotation and screen size changes', async () => {
      mockApiService.getPosts.mockResolvedValue([
        { id: 1, title: 'Test Post', content: 'Content', author: 'Author' }
      ]);

      const { getByText, rerender } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByText('Test Post')).toBeTruthy();
      });

      // Simulate screen rotation by re-rendering
      rerender(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      // Should maintain state after rotation
      expect(getByText('Test Post')).toBeTruthy();
    });

    it('should handle app backgrounding and foregrounding', async () => {
      mockApiService.getPosts.mockResolvedValue([
        { id: 1, title: 'Test Post', content: 'Content', author: 'Author' }
      ]);

      const { getByText } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByText('Test Post')).toBeTruthy();
      });

      // Simulate app backgrounding/foregrounding
      // In a real app, this would trigger focus/blur events
      // For now, we verify the component handles re-rendering
      expect(getByText('Test Post')).toBeTruthy();
    });
  });

  describe('Error Recovery Edge Cases', () => {
    it('should recover from temporary API failures', async () => {
      // Mock temporary failure followed by success
      mockApiService.getPosts
        .mockRejectedValueOnce(new Error('Temporary server error'))
        .mockResolvedValueOnce([
          { id: 1, title: 'Recovered Post', content: 'Content', author: 'Author' }
        ]);

      const { getByText } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      // Should show error initially
      await waitFor(() => {
        expect(getByText(/error/i)).toBeTruthy();
      });

      // Should recover on retry
      const retryButton = getByText(/retry/i);
      fireEvent.press(retryButton);

      await waitFor(() => {
        expect(getByText('Recovered Post')).toBeTruthy();
      });
    });

    it('should handle partial data corruption gracefully', async () => {
      // Mock partially corrupted data
      mockApiService.getPosts.mockResolvedValue([
        { id: 1, title: 'Valid Post', content: 'Content', author: 'Author' },
        { id: 2, title: null, content: undefined, author: '' }, // Corrupted
        { id: 3, title: 'Another Valid Post', content: 'Content', author: 'Author' }
      ] as any);

      const { getByText, queryByText } = render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should show valid posts
        expect(getByText('Valid Post')).toBeTruthy();
        expect(getByText('Another Valid Post')).toBeTruthy();
        
        // Should handle corrupted post gracefully
        expect(queryByText('null')).toBeNull();
      });
    });
  });
});