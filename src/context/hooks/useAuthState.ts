import { useAuth } from '../AuthContext';

/**
 * Hook that provides only authentication state
 * Useful when components only need to read auth state without triggering actions
 */
export const useAuthState = () => {
  const { user, isAuthenticated, isLoading, error } = useAuth();
  return { user, isAuthenticated, isLoading, error };
};