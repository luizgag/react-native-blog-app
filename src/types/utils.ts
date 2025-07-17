// Utility types for form handling and API responses

// Generic form field type for validation
export interface FormField<T> {
  value: T;
  error?: string;
  touched: boolean;
}

// Form validation result
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Generic form state
export interface FormState<T> {
  data: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Loading states for async operations
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Generic async operation state
export interface AsyncState<T> {
  data: T | null;
  loading: LoadingState;
  error: string | null;
}

// Search state
export interface SearchState {
  query: string;
  results: any[];
  isSearching: boolean;
  hasSearched: boolean;
}

// Pagination state
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Modal state
export interface ModalState {
  isVisible: boolean;
  title?: string;
  message?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

// Toast/notification types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  autoHide?: boolean;
}

// Generic CRUD operations
export interface CrudOperations<T, CreateT = Partial<T>, UpdateT = Partial<T>> {
  create: (data: CreateT) => Promise<T>;
  read: (id: number) => Promise<T>;
  update: (id: number, data: UpdateT) => Promise<T>;
  delete: (id: number) => Promise<void>;
  list: (page?: number) => Promise<T[]>;
}

// Error handling types
export interface ErrorInfo {
  message: string;
  code?: string | number;
  field?: string;
  timestamp?: Date;
}

// Network status
export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
}

// App configuration
export interface AppConfig {
  apiBaseUrl: string;
  apiTimeout: number;
  enableLogging: boolean;
  version: string;
}

// Theme types (for future theming support)
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  error: string;
  success: string;
  warning: string;
}

export interface Theme {
  colors: ThemeColors;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    fontSize: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
    fontWeight: {
      normal: string;
      bold: string;
    };
  };
}