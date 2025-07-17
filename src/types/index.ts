// Core data types for the blog app

export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'teacher' | 'student';
  createdAt?: string;
}

export interface Teacher extends User {
  role: 'teacher';
  department?: string;
}

export interface Student extends User {
  role: 'student';
  studentId?: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'teacher' | 'student';
  token: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

// Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  author: string;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  author?: string;
}

export interface CreateTeacherRequest {
  name: string;
  email: string;
  password: string;
  department?: string;
}

export interface UpdateTeacherRequest {
  name?: string;
  email?: string;
  department?: string;
}

export interface CreateStudentRequest {
  name: string;
  email: string;
  password: string;
  studentId?: string;
}

export interface UpdateStudentRequest {
  name?: string;
  email?: string;
  studentId?: string;
}

// State management types
export interface AppState {
  auth: {
    user: AuthUser | null;
    isLoading: boolean;
    error: string | null;
  };
  posts: {
    items: Post[];
    currentPost: Post | null;
    isLoading: boolean;
    error: string | null;
    searchTerm: string;
  };
  teachers: {
    items: Teacher[];
    currentPage: number;
    totalPages: number;
    isLoading: boolean;
    error: string | null;
  };
  students: {
    items: Student[];
    currentPage: number;
    totalPages: number;
    isLoading: boolean;
    error: string | null;
  };
}

// Navigation types
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Home: undefined;
  PostDetail: { postId: number };
  CreatePost: undefined;
  EditPost: { postId: number };
  Admin: undefined;
  TeacherList: undefined;
  CreateTeacher: undefined;
  EditTeacher: { teacherId: number };
  StudentList: undefined;
  CreateStudent: undefined;
  EditStudent: { studentId: number };
};

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface PostFormData {
  title: string;
  content: string;
  author: string;
}

export interface TeacherFormData {
  name: string;
  email: string;
  password?: string;
  department?: string;
}

export interface StudentFormData {
  name: string;
  email: string;
  password?: string;
  studentId?: string;
}

// Re-export utility types
export * from './utils';

// Re-export context types
export * from './context';

// Re-export API types
export * from './api';

// Re-export validation utilities
export * from './validation';