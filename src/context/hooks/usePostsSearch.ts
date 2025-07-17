import { usePosts } from '../PostsContext';
import { useCallback, useEffect } from 'react';

/**
 * Hook that provides search functionality for posts
 * Includes debounced search and search state management
 */
export const usePostsSearch = (debounceMs: number = 300) => {
  const { searchResults, searchQuery, isSearching, error, actions } = usePosts();
  const { searchPosts, setSearchQuery, clearError } = actions;

  // Debounced search effect
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      return;
    }

    const timeoutId = setTimeout(() => {
      searchPosts(searchQuery).catch(() => {
        // Error is handled by the context
      });
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, debounceMs, searchPosts]);

  const handleSearchQueryChange = useCallback((query: string) => {
    setSearchQuery(query);
    if (error) {
      clearError();
    }
  }, [setSearchQuery, clearError, error]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    if (error) {
      clearError();
    }
  }, [setSearchQuery, clearError, error]);

  return {
    searchResults,
    searchQuery,
    isSearching,
    error,
    handleSearchQueryChange,
    clearSearch,
  };
};