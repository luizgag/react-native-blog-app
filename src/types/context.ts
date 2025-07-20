// Context and state management specific types
import { Post, Teacher, Student, AuthUser } from './index';
import { AsyncState, PaginationState, ToastMessage } from './utils';

// Auth Context Types
export interface AuthContextState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextActions {
  login: (email: string, password: string) => Promise<void>;
  register: (nome: string, email: string, senha: string, tipo_usuario: 'teacher' | 'student') => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
}

export interface AuthContextValue extends AuthContextState {
  actions: AuthContextActions;
}

// Posts Context Types
export interface PostsContextState {
  posts: Post[];
  currentPost: Post | null;
  searchResults: Post[];
  searchQuery: string;
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
}

export interface PostsContextActions {
  fetchPosts: () => Promise<void>;
  fetchPost: (id: number) => Promise<void>;
  searchPosts: (query: string) => Promise<void>;
  createPost: (post: { title: string; content: string; author: string }) => Promise<void>;
  updatePost: (id: number, post: { title?: string; content?: string; author?: string }) => Promise<void>;
  deletePost: (id: number) => Promise<void>;
  clearCurrentPost: () => void;
  clearError: () => void;
  setSearchQuery: (query: string) => void;
}

export interface PostsContextValue extends PostsContextState {
  actions: PostsContextActions;
}

// Teachers Context Types
export interface TeachersContextState extends AsyncState<Teacher[]> {
  pagination: PaginationState;
  currentTeacher: Teacher | null;
}

export interface TeachersContextActions {
  fetchTeachers: (page?: number) => Promise<void>;
  fetchTeacher: (id: number) => Promise<void>;
  createTeacher: (teacher: { name: string; email: string; password: string; department?: string }) => Promise<void>;
  updateTeacher: (id: number, teacher: { name?: string; email?: string; department?: string }) => Promise<void>;
  deleteTeacher: (id: number) => Promise<void>;
  clearCurrentTeacher: () => void;
  clearError: () => void;
}

export interface TeachersContextValue extends TeachersContextState {
  actions: TeachersContextActions;
}

// Students Context Types
export interface StudentsContextState extends AsyncState<Student[]> {
  pagination: PaginationState;
  currentStudent: Student | null;
}

export interface StudentsContextActions {
  fetchStudents: (page?: number) => Promise<void>;
  fetchStudent: (id: number) => Promise<void>;
  createStudent: (student: { name: string; email: string; password: string; studentId?: string }) => Promise<void>;
  updateStudent: (id: number, student: { name?: string; email?: string; studentId?: string }) => Promise<void>;
  deleteStudent: (id: number) => Promise<void>;
  clearCurrentStudent: () => void;
  clearError: () => void;
}

export interface StudentsContextValue extends StudentsContextState {
  actions: StudentsContextActions;
}

// Global App Context Types (for app-wide state)
export interface AppContextState {
  isOnline: boolean;
  toasts: ToastMessage[];
  theme: 'light' | 'dark';
}

export interface AppContextActions {
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  hideToast: (id: string) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  toggleTheme: () => void;
}

export interface AppContextValue extends AppContextState {
  actions: AppContextActions;
}

// Action types for reducers
export type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: AuthUser }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: AuthUser }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'CHECK_AUTH_START' }
  | { type: 'CHECK_AUTH_SUCCESS'; payload: AuthUser }
  | { type: 'CHECK_AUTH_FAILURE' };

export type PostsAction =
  | { type: 'FETCH_POSTS_START' }
  | { type: 'FETCH_POSTS_SUCCESS'; payload: Post[] }
  | { type: 'FETCH_POSTS_FAILURE'; payload: string }
  | { type: 'FETCH_POST_START' }
  | { type: 'FETCH_POST_SUCCESS'; payload: Post }
  | { type: 'FETCH_POST_FAILURE'; payload: string }
  | { type: 'SEARCH_POSTS_START' }
  | { type: 'SEARCH_POSTS_SUCCESS'; payload: Post[] }
  | { type: 'SEARCH_POSTS_FAILURE'; payload: string }
  | { type: 'CREATE_POST_SUCCESS'; payload: Post }
  | { type: 'UPDATE_POST_SUCCESS'; payload: Post }
  | { type: 'DELETE_POST_SUCCESS'; payload: number }
  | { type: 'CLEAR_CURRENT_POST' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_SEARCH_QUERY'; payload: string };

export type TeachersAction =
  | { type: 'FETCH_TEACHERS_START' }
  | { type: 'FETCH_TEACHERS_SUCCESS'; payload: { data: Teacher[]; pagination: PaginationState } }
  | { type: 'FETCH_TEACHERS_FAILURE'; payload: string }
  | { type: 'FETCH_TEACHER_SUCCESS'; payload: Teacher }
  | { type: 'CREATE_TEACHER_SUCCESS'; payload: Teacher }
  | { type: 'UPDATE_TEACHER_SUCCESS'; payload: Teacher }
  | { type: 'DELETE_TEACHER_SUCCESS'; payload: number }
  | { type: 'CLEAR_CURRENT_TEACHER' }
  | { type: 'CLEAR_ERROR' };

export type StudentsAction =
  | { type: 'FETCH_STUDENTS_START' }
  | { type: 'FETCH_STUDENTS_SUCCESS'; payload: { data: Student[]; pagination: PaginationState } }
  | { type: 'FETCH_STUDENTS_FAILURE'; payload: string }
  | { type: 'FETCH_STUDENT_SUCCESS'; payload: Student }
  | { type: 'CREATE_STUDENT_SUCCESS'; payload: Student }
  | { type: 'UPDATE_STUDENT_SUCCESS'; payload: Student }
  | { type: 'DELETE_STUDENT_SUCCESS'; payload: number }
  | { type: 'CLEAR_CURRENT_STUDENT' }
  | { type: 'CLEAR_ERROR' };

export type AppAction =
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'SHOW_TOAST'; payload: ToastMessage }
  | { type: 'HIDE_TOAST'; payload: string }
  | { type: 'TOGGLE_THEME' };