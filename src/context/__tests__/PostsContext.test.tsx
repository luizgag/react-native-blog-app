import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { PostsProvider, usePosts } from '../PostsContext';
import { apiService } from '../../services/ApiService';
import { Post } from '../../types';

// Mock API service
jest.mock('../../services/apiService', () => ({
  apiService: {
    getPosts: jest.fn(),
    getPost: jest.fn(),
    searchPosts: jest.fn(),
    createPost: jest.fn(),
    updatePost: jest.fn(),
    deletePost: jest.fn(),
  },
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('PostsContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <PostsProvider>{children}</PostsProvider>
  );

  const mockPosts: Post[] = [
    {
      id: 1,
      title: 'Test Post 1',
      content: 'Content of test post 1',
      author: 'Test Author 1',
      createdAt: '2023-01-01T00:00:00Z',
    },
    {
      id: 2,
      title: 'Test Post 2',
      content: 'Content of test post 2',
      author: 'Test Author 2',
      createdAt: '2023-01-02T00:00:00Z',
    },
  ];

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => usePosts(), { wrapper });

    expect(result.current.posts).toEqual([]);
    expect(result.current.currentPost).toBe(null);
    expect(result.current.searchResults).toEqual([]);
    expect(result.current.searchQuery).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSearching).toBe(false);
    expect(result.current.error).toBe(null);
  });

  describe('fetchPosts', () => {
    it('should fetch posts successfully', async () => {
      mockApiService.getPosts.mockResolvedValue(mockPosts);

      const { result } = renderHook(() => usePosts(), { wrapper });

      await act(async () => {
        await result.current.actions.fetchPosts();
      });

      expect(result.current.posts).toEqual(mockPosts);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(mockApiService.getPosts).toHaveBeenCalledTimes(1);
    });

    it('should handle fetch posts failure', async () => {
      const mockError = new Error('Failed to fetch posts');
      mockApiService.getPosts.mockRejectedValue(mockError);

      const { result } = renderHook(() => usePosts(), { wrapper });

      await act(async () => {
        try {
          await result.current.actions.fetchPosts();
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.posts).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Failed to fetch posts');
    });
  });

  describe('fetchPost', () => {
    it('should fetch single post successfully', async () => {
      const mockPost = mockPosts[0];
      mockApiService.getPost.mockResolvedValue(mockPost);

      const { result } = renderHook(() => usePosts(), { wrapper });

      await act(async () => {
        await result.current.actions.fetchPost(1);
      });

      expect(result.current.currentPost).toEqual(mockPost);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(mockApiService.getPost).toHaveBeenCalledWith(1);
    });

    it('should handle fetch post failure', async () => {
      const mockError = new Error('Post not found');
      mockApiService.getPost.mockRejectedValue(mockError);

      const { result } = renderHook(() => usePosts(), { wrapper });

      await act(async () => {
        try {
          await result.current.actions.fetchPost(999);
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.currentPost).toBe(null);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Post not found');
    });
  });

  describe('searchPosts', () => {
    it('should search posts successfully', async () => {
      const searchResults = [mockPosts[0]];
      mockApiService.searchPosts.mockResolvedValue(searchResults);

      const { result } = renderHook(() => usePosts(), { wrapper });

      await act(async () => {
        await result.current.actions.searchPosts('test');
      });

      expect(result.current.searchResults).toEqual(searchResults);
      expect(result.current.isSearching).toBe(false);
      expect(result.current.error).toBe(null);
      expect(mockApiService.searchPosts).toHaveBeenCalledWith('test');
    });

    it('should handle search failure', async () => {
      const mockError = new Error('Search failed');
      mockApiService.searchPosts.mockRejectedValue(mockError);

      const { result } = renderHook(() => usePosts(), { wrapper });

      await act(async () => {
        try {
          await result.current.actions.searchPosts('test');
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.searchResults).toEqual([]);
      expect(result.current.isSearching).toBe(false);
      expect(result.current.error).toBe('Search failed');
    });
  });

  describe('createPost', () => {
    it('should create post successfully', async () => {
      const newPostData = {
        title: 'New Post',
        content: 'New post content',
        author: 'New Author',
      };
      const createdPost: Post = {
        id: 3,
        ...newPostData,
        createdAt: '2023-01-03T00:00:00Z',
      };

      mockApiService.createPost.mockResolvedValue(createdPost);

      const { result } = renderHook(() => usePosts(), { wrapper });

      // Set initial posts
      await act(async () => {
        mockApiService.getPosts.mockResolvedValue(mockPosts);
        await result.current.actions.fetchPosts();
      });

      await act(async () => {
        await result.current.actions.createPost(newPostData);
      });

      expect(result.current.posts).toEqual([createdPost, ...mockPosts]);
      expect(result.current.error).toBe(null);
      expect(mockApiService.createPost).toHaveBeenCalledWith(newPostData);
    });

    it('should handle create post failure', async () => {
      const mockError = new Error('Failed to create post');
      mockApiService.createPost.mockRejectedValue(mockError);

      const { result } = renderHook(() => usePosts(), { wrapper });

      await act(async () => {
        try {
          await result.current.actions.createPost({
            title: 'Test',
            content: 'Test',
            author: 'Test',
          });
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Failed to create post');
    });
  });

  describe('updatePost', () => {
    it('should update post successfully', async () => {
      const updatedPost: Post = {
        ...mockPosts[0],
        title: 'Updated Title',
      };

      mockApiService.updatePost.mockResolvedValue(updatedPost);

      const { result } = renderHook(() => usePosts(), { wrapper });

      // Set initial posts
      await act(async () => {
        mockApiService.getPosts.mockResolvedValue(mockPosts);
        await result.current.actions.fetchPosts();
      });

      await act(async () => {
        await result.current.actions.updatePost(1, { title: 'Updated Title' });
      });

      expect(result.current.posts[1]).toEqual(updatedPost); // Updated post should be at index 1
      expect(result.current.error).toBe(null);
      expect(mockApiService.updatePost).toHaveBeenCalledWith(1, { title: 'Updated Title' });
    });

    it('should update current post if it matches', async () => {
      const updatedPost: Post = {
        ...mockPosts[0],
        title: 'Updated Title',
      };

      mockApiService.updatePost.mockResolvedValue(updatedPost);

      const { result } = renderHook(() => usePosts(), { wrapper });

      // Set current post
      await act(async () => {
        mockApiService.getPost.mockResolvedValue(mockPosts[0]);
        await result.current.actions.fetchPost(1);
      });

      await act(async () => {
        await result.current.actions.updatePost(1, { title: 'Updated Title' });
      });

      expect(result.current.currentPost).toEqual(updatedPost);
    });
  });

  describe('deletePost', () => {
    it('should delete post successfully', async () => {
      mockApiService.deletePost.mockResolvedValue();

      const { result } = renderHook(() => usePosts(), { wrapper });

      // Set initial posts
      await act(async () => {
        mockApiService.getPosts.mockResolvedValue(mockPosts);
        await result.current.actions.fetchPosts();
      });

      await act(async () => {
        await result.current.actions.deletePost(1);
      });

      expect(result.current.posts).toEqual([mockPosts[1]]); // Only second post should remain
      expect(result.current.error).toBe(null);
      expect(mockApiService.deletePost).toHaveBeenCalledWith(1);
    });

    it('should clear current post if it matches deleted post', async () => {
      mockApiService.deletePost.mockResolvedValue();

      const { result } = renderHook(() => usePosts(), { wrapper });

      // Set current post
      await act(async () => {
        mockApiService.getPost.mockResolvedValue(mockPosts[0]);
        await result.current.actions.fetchPost(1);
      });

      await act(async () => {
        await result.current.actions.deletePost(1);
      });

      expect(result.current.currentPost).toBe(null);
    });
  });

  describe('utility actions', () => {
    it('should clear current post', () => {
      const { result } = renderHook(() => usePosts(), { wrapper });

      act(() => {
        result.current.actions.clearCurrentPost();
      });

      expect(result.current.currentPost).toBe(null);
    });

    it('should clear error', async () => {
      const mockError = new Error('Test error');
      mockApiService.getPosts.mockRejectedValue(mockError);

      const { result } = renderHook(() => usePosts(), { wrapper });

      // Trigger error
      await act(async () => {
        try {
          await result.current.actions.fetchPosts();
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Test error');

      // Clear error
      act(() => {
        result.current.actions.clearError();
      });

      expect(result.current.error).toBe(null);
    });

    it('should set search query', () => {
      const { result } = renderHook(() => usePosts(), { wrapper });

      act(() => {
        result.current.actions.setSearchQuery('test query');
      });

      expect(result.current.searchQuery).toBe('test query');
    });
  });

  it('should throw error when used outside provider', () => {
    expect(() => {
      renderHook(() => usePosts());
    }).toThrow('usePosts must be used within a PostsProvider');
  });
});