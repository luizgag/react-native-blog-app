// Core data types for the blog app

export interface Post {
  id?: number;
  title: string;
  content: string;
  author: string;
  author_id?: number;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  materia?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'teacher' | 'student';
  createdAt?: string;
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
  senha: string;
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
  materia?: string;
}

export interface Comment {
  id: number;
  post_id: number;
  author_id: number;
  comentario: string;
  created_at: string;
  updated_at?: string;
}

export interface Like {
  id: number;
  user_id: number;
  post_id: number;
  created_at: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  confirmacao_senha: string;
  tipo_usuario: 'professor' | 'aluno';
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
    items: User[];
    currentPage: number;
    totalPages: number;
    isLoading: boolean;
    error: string | null;
  };
  students: {
    items: User[];
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
  password: string;  // Keep as password for form, will be transformed to senha in API call
}

export interface PostFormData {
  title: string;
  content: string;
  materia?: string;
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