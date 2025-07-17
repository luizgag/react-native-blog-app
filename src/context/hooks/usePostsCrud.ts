import { usePosts } from '../PostsContext';
import { useCallback } from 'react';

/**
 * Hook that provides CRUD operations for posts
 * Includes optimistic updates and error handling
 */
export const usePostsCrud = () => {
  const { actions, error, isLoading } = usePosts();
  const { createPost, updatePost, deletePost, clearError } = actions;

  const handleCreatePost = useCallback(async (post: { title: string; content: string; author: string }) => {
    try {
      await createPost(post);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [createPost]);

  const handleUpdatePost = useCallback(async (id: number, post: { title?: string; content?: string; author?: string }) => {
    try {
      await updatePost(id, post);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [updatePost]);

  const handleDeletePost = useCallback(async (id: number) => {
    try {
      await deletePost(id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, [deletePost]);

  const clearPostsError = useCallback(() => {
    if (error) {
      clearError();
    }
  }, [clearError, error]);

  return {
    createPost: handleCreatePost,
    updatePost: handleUpdatePost,
    deletePost: handleDeletePost,
    clearError: clearPostsError,
    error,
    isLoading,
  };
};