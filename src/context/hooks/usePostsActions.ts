import { usePosts } from '../PostsContext';

/**
 * Hook that provides only posts actions
 * Useful when components only need to trigger posts actions without subscribing to state changes
 */
export const usePostsActions = () => {
  const { actions } = usePosts();
  return actions;
};