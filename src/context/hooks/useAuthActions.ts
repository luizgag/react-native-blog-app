import { useAuth } from '../AuthContext';

/**
 * Hook that provides only authentication actions
 * Useful when components only need to trigger auth actions without subscribing to state changes
 */
export const useAuthActions = () => {
  const { actions } = useAuth();
  return actions;
};