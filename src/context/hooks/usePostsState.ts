import { usePosts } from '../PostsContext';

/**
 * Hook that provides only posts state
 * Useful when components only need to read posts state without triggering actions
 */
export const usePostsState = () => {
  const { posts, currentPost, searchResults, searchQuery, isLoading, isSearching, error } = usePosts();
  return { posts, currentPost, searchResults, searchQuery, isLoading, isSearching, error };
};