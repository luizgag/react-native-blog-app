import { useAuth } from '../AuthContext';

/**
 * Hook for role-based access control
 * Provides utilities to check user permissions and roles
 */
export const useAuthGuard = () => {
  const { user, isAuthenticated } = useAuth();

  const isTeacher = isAuthenticated && user?.role === 'teacher';
  const isStudent = isAuthenticated && user?.role === 'student';
  
  const canCreatePosts = isTeacher;
  const canEditPosts = isTeacher;
  const canDeletePosts = isTeacher;
  const canManageUsers = isTeacher;
  const canAccessAdmin = isTeacher;

  const hasRole = (role: 'teacher' | 'student'): boolean => {
    return isAuthenticated && user?.role === role;
  };

  const requireAuth = (): boolean => {
    return isAuthenticated;
  };

  const requireTeacher = (): boolean => {
    return isTeacher;
  };

  return {
    isTeacher,
    isStudent,
    canCreatePosts,
    canEditPosts,
    canDeletePosts,
    canManageUsers,
    canAccessAdmin,
    hasRole,
    requireAuth,
    requireTeacher,
  };
};