// Core data types for the blog app

export interface Post {
  id?: number;
  title: string;
  content: string;
  author_id: number; 
  author?: string; 
}

export interface User {
  id: number;
  nome: string;
  email: string;
  tipo_usuario: 'aluno' | 'professor';
  createdAt?: string;
}

export interface AuthUser {
  id: number;
  nome: string;
  email: string;
  tipo_usuario: 'aluno' | 'professor';
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
  author_id: number;
}

export interface UpdatePostRequest {
  title: string;
  content: string;
}

export interface Comment {
  id?: number;
  post_id: number;
  user_id: number;      // Alinhado com o banco de dados
  comentario: string;   // Alinhado com o banco de dados
  resposta_id?: number;
  created_at?: string;
  author?: string;      // Optional for display purposes
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
}

export interface TeacherFormData {
  nome: string;
  email: string;
  senha?: string;
  department?: string;
}

export interface StudentFormData {
  nome: string;
  email: string;
  senha?: string;
  studentId?: string;
}

// Re-export utility types
export * from './utils';

// Re-export context types
export * from './context';

// Re-export API types
export * from './api';