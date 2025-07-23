import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import {
  PostsContextValue,
  PostsContextState,
  PostsAction
} from '../types/context';
import { Post, CreatePostRequest, UpdatePostRequest } from '../types';
import { enhancedApiService } from '../services';

// Initial state
const initialState: PostsContextState = {
  posts: [],
  currentPost: null,
  searchResults: [],
  searchQuery: '',
  isLoading: false,
  isSearching: false,
  error: null,
};

// Posts reducer
const postsReducer = (state: PostsContextState, action: PostsAction): PostsContextState => {
  switch (action.type) {
    case 'FETCH_POSTS_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'FETCH_POSTS_SUCCESS':
      return {
        ...state,
        posts: action.payload,
        isLoading: false,
        error: null,
      };

    case 'FETCH_POSTS_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case 'FETCH_POST_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'FETCH_POST_SUCCESS':
      return {
        ...state,
        currentPost: action.payload,
        isLoading: false,
        error: null,
      };

    case 'FETCH_POST_FAILURE':
      return {
        ...state,
        currentPost: null,
        isLoading: false,
        error: action.payload,
      };

    case 'SEARCH_POSTS_START':
      return {
        ...state,
        isSearching: true,
        error: null,
      };

    case 'SEARCH_POSTS_SUCCESS':
      return {
        ...state,
        searchResults: action.payload,
        isSearching: false,
        error: null,
      };

    case 'SEARCH_POSTS_FAILURE':
      return {
        ...state,
        searchResults: [],
        isSearching: false,
        error: action.payload,
      };

    case 'CREATE_POST_SUCCESS':
      return {
        ...state,
        posts: [action.payload, ...state.posts],
        error: null,
      };

    case 'UPDATE_POST_SUCCESS':
      return {
        ...state,
        posts: state.posts.map(post =>
          post.id === action.payload.id ? action.payload : post
        ),
        currentPost: state.currentPost?.id === action.payload.id ? action.payload : state.currentPost,
        error: null,
      };

    case 'DELETE_POST_SUCCESS':
      return {
        ...state,
        posts: state.posts.filter(post => post.id !== action.payload),
        currentPost: state.currentPost?.id === action.payload ? null : state.currentPost,
        error: null,
      };

    case 'CLEAR_CURRENT_POST':
      return {
        ...state,
        currentPost: null,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
      };

    default:
      return state;
  }
};

// Create context
const PostsContext = createContext<PostsContextValue | undefined>(undefined);

// Posts provider component
interface PostsProviderProps {
  children: ReactNode;
}

export const PostsProvider: React.FC<PostsProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(postsReducer, initialState);

  const fetchPosts = useCallback(async (): Promise<void> => {
    dispatch({ type: 'FETCH_POSTS_START' });

    try {
      const posts = await enhancedApiService.getPosts();
      dispatch({ type: 'FETCH_POSTS_SUCCESS', payload: posts });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch posts. Please try again.';
      dispatch({ type: 'FETCH_POSTS_FAILURE', payload: errorMessage });
      throw error; // Re-throw to allow components to handle
    }
  }, []);

  const fetchPost = useCallback(async (id: number): Promise<void> => {
    dispatch({ type: 'FETCH_POST_START' });

    try {
      const post = await enhancedApiService.getPost(id);
      dispatch({ type: 'FETCH_POST_SUCCESS', payload: post });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch post. Please try again.';
      dispatch({ type: 'FETCH_POST_FAILURE', payload: errorMessage });
      throw error; // Re-throw to allow components to handle
    }
  }, []);

  const searchPosts = useCallback(async (query: string): Promise<void> => {
    dispatch({ type: 'SEARCH_POSTS_START' });

    try {
      const results = await enhancedApiService.searchPosts(query);
      dispatch({ type: 'SEARCH_POSTS_SUCCESS', payload: results });
    } catch (error: any) {
      const errorMessage = error.message || 'Search failed. Please try again.';
      dispatch({ type: 'SEARCH_POSTS_FAILURE', payload: errorMessage });
      throw error; // Re-throw to allow components to handle
    }
  }, []);

  const createPost = useCallback(async (post: CreatePostRequest): Promise<void> => {
    try {
      const newPost = await enhancedApiService.createPost(post);
      dispatch({ type: 'CREATE_POST_SUCCESS', payload: newPost });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create post. Please try again.';
      dispatch({ type: 'FETCH_POSTS_FAILURE', payload: errorMessage });
      throw error; // Re-throw to allow components to handle
    }
  }, []);

  const updatePost = useCallback(async (id: number, post: UpdatePostRequest): Promise<void> => {
    try {
      // Find the current post to provide as fallback data
      const currentPost = state.posts.find(p => p.id === id) || state.currentPost || undefined;
      const updatedPost = await enhancedApiService.updatePost(id, post, currentPost);
      dispatch({ type: 'UPDATE_POST_SUCCESS', payload: updatedPost });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update post. Please try again.';
      dispatch({ type: 'FETCH_POSTS_FAILURE', payload: errorMessage });
      throw error; // Re-throw to allow components to handle
    }
  }, [state.posts, state.currentPost]);

  const deletePost = useCallback(async (id: number): Promise<void> => {
    try {
      await enhancedApiService.deletePost(id);
      dispatch({ type: 'DELETE_POST_SUCCESS', payload: id });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete post. Please try again.';
      dispatch({ type: 'FETCH_POSTS_FAILURE', payload: errorMessage });
      throw error; // Re-throw to allow components to handle
    }
  }, []);

  const clearCurrentPost = useCallback((): void => {
    dispatch({ type: 'CLEAR_CURRENT_POST' });
  }, []);

  const clearError = useCallback((): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const setSearchQuery = useCallback((query: string): void => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, []);

  const contextValue: PostsContextValue = {
    ...state,
    actions: {
      fetchPosts,
      fetchPost,
      searchPosts,
      createPost,
      updatePost,
      deletePost,
      clearCurrentPost,
      clearError,
      setSearchQuery,
    },
  };

  return (
    <PostsContext.Provider value={contextValue}>
      {children}
    </PostsContext.Provider>
  );
};

// Custom hook to use posts context
export const usePosts = (): PostsContextValue => {
  const context = useContext(PostsContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostsProvider');
  }
  return context;
};

// Export context for testing purposes
export { PostsContext };