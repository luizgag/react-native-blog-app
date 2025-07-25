import { NavigationProp, RouteProp } from '@react-navigation/native';
import { MainStackParamList } from './MainNavigator';

// Navigation helper types
export type MainNavigationProp = NavigationProp<MainStackParamList>;
export type MainRouteProp<T extends keyof MainStackParamList> = RouteProp<MainStackParamList, T>;

// Navigation helper functions
export const navigationHelpers = {
  // Navigate to post detail
  navigateToPostDetail: (navigation: MainNavigationProp, postId: number) => {
    navigation.navigate('PostDetail', { postId });
  },

  // Navigate to create post
  navigateToCreatePost: (navigation: MainNavigationProp) => {
    navigation.navigate('CreatePost');
  },

  // Navigate to edit post
  navigateToEditPost: (navigation: MainNavigationProp, postId: number) => {
    navigation.navigate('EditPost', { postId });
  },

  // Navigate to admin dashboard
  navigateToAdmin: (navigation: MainNavigationProp) => {
    navigation.navigate('Admin');
  },

  // Navigate to teacher management
  navigateToTeacherList: (navigation: MainNavigationProp) => {
    navigation.navigate('TeacherList');
  },

  // Navigate to create teacher
  navigateToCreateTeacher: (navigation: MainNavigationProp) => {
    navigation.navigate('CreateTeacher');
  },

  // Navigate to edit teacher
  navigateToEditTeacher: (navigation: MainNavigationProp, teacherId: number) => {
    navigation.navigate('EditTeacher', { teacherId });
  },

  // Navigate to student management
  navigateToStudentList: (navigation: MainNavigationProp) => {
    navigation.navigate('StudentList');
  },

  // Navigate to create student
  navigateToCreateStudent: (navigation: MainNavigationProp) => {
    navigation.navigate('CreateStudent');
  },

  // Navigate to edit student
  navigateToEditStudent: (navigation: MainNavigationProp, studentId: number) => {
    navigation.navigate('EditStudent', { studentId });
  },

  // Go back
  goBack: (navigation: MainNavigationProp) => {
    navigation.goBack();
  },
};

// Route configuration for role-based access
export const routeConfig = {
  // Routes accessible to all authenticated users
  publicRoutes: ['Home', 'PostDetail'] as const,
  
  // Routes accessible only to teachers
  teacherOnlyRoutes: [
    'CreatePost',
    'EditPost',
    'Admin',
    'TeacherList',
    'CreateTeacher',
    'EditTeacher',
    'StudentList',
    'CreateStudent',
    'EditStudent',
  ] as const,
  
  // Check if a route is accessible to the current user
  isRouteAccessible: (routeName: keyof MainStackParamList, userRole: 'professor' | 'aluno'): boolean => {
    if (routeConfig.publicRoutes.includes(routeName as any)) {
      return true;
    }
    
    if (routeConfig.teacherOnlyRoutes.includes(routeName as any)) {
      return userRole === 'professor';
    }
    
    return false;
  },
};

// Screen options helper
export const getScreenOptions = (userRole: 'professor' | 'aluno') => ({
  headerStyle: {
    backgroundColor: '#2196F3',
  },
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: 'bold',
  },
  // Add role-specific options if needed
  ...(userRole === 'professor' && {
    headerRight: () => null, // Can add teacher-specific header buttons
  }),
});