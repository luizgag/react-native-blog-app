// Type validation - this file ensures all types compile correctly
import {
    Post,
    User,
    Teacher,
    Student,
    AuthUser,
    PaginatedResponse,
    LoginRequest,
    AuthResponse,
    CreatePostRequest,
    UpdatePostRequest,
    CreateTeacherRequest,
    UpdateTeacherRequest,
    CreateStudentRequest,
    UpdateStudentRequest,
    AppState,
    RootStackParamList,
    LoginFormData,
    PostFormData,
    TeacherFormData,
    StudentFormData,
    FormField,
    ValidationResult,
    FormState,
    LoadingState,
    AsyncState,
    SearchState,
    PaginationState,
    ModalState,
    ToastType,
    ToastMessage,
    CrudOperations,
    ErrorInfo,
    NetworkState,
    AppConfig,
    ThemeColors,
    Theme,
    AuthContextState,
    AuthContextActions,
    AuthContextValue,
    PostsContextState,
    PostsContextActions,
    PostsContextValue,
    TeachersContextState,
    TeachersContextActions,
    TeachersContextValue,
    StudentsContextState,
    StudentsContextActions,
    StudentsContextValue,
    AppContextState,
    AppContextActions,
    AppContextValue,
    AuthAction,
    PostsAction,
    TeachersAction,
    StudentsAction,
    AppAction,
    ApiService,
    ApiError,
    ApiResponse,
} from './index';

// Test type instantiation to ensure all types are valid
const testPost: Post = {
    id: 1,
    title: 'Test Post',
    content: 'Test content',
    author: 'Test Author',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

const testUser: User = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'student',
    createdAt: new Date().toISOString(),
};

const testTeacher: Teacher = {
    id: 1,
    name: 'Test Teacher',
    email: 'teacher@example.com',
    role: 'teacher',
    department: 'Computer Science',
    createdAt: new Date().toISOString(),
};

const testStudent: Student = {
    id: 1,
    name: 'Test Student',
    email: 'student@example.com',
    role: 'student',
    studentId: 'STU001',
    createdAt: new Date().toISOString(),
};

const testAuthUser: AuthUser = {
    id: 1,
    name: 'Test Auth User',
    email: 'auth@example.com',
    role: 'teacher',
    token: 'test-token',
};

const testPaginatedResponse: PaginatedResponse<Post> = {
    data: [testPost],
    currentPage: 1,
    totalPages: 1,
    totalItems: 1,
};

const testLoginRequest: LoginRequest = {
    email: 'test@example.com',
    password: 'password123',
};

const testAuthResponse: AuthResponse = {
    user: testAuthUser,
    token: 'test-token',
};

const testCreatePostRequest: CreatePostRequest = {
    title: 'New Post',
    content: 'New content',
    author: 'Author',
};

const testUpdatePostRequest: UpdatePostRequest = {
    title: 'Updated Post',
    content: 'Updated content',
};

const testFormField: FormField<string> = {
    value: 'test',
    error: undefined,
    touched: false,
};

const testValidationResult: ValidationResult = {
    isValid: true,
    errors: {},
};

const testLoadingState: LoadingState = 'idle';

const testAsyncState: AsyncState<Post[]> = {
    data: [testPost],
    loading: 'success',
    error: null,
};

const testToastMessage: ToastMessage = {
    id: '1',
    type: 'success',
    message: 'Success message',
    duration: 3000,
    autoHide: true,
};

const testAuthAction: AuthAction = {
    type: 'LOGIN_SUCCESS',
    payload: testAuthUser,
};

const testPostsAction: PostsAction = {
    type: 'FETCH_POSTS_SUCCESS',
    payload: [testPost],
};

// Export a validation function to ensure this file is used
export const validateTypes = (): boolean => {
    // This function exists to ensure all type definitions are valid
    // If this compiles without errors, all types are correctly defined
    return true;
};

// Type guards for runtime type checking
export const isPost = (obj: any): obj is Post => {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.id === 'number' &&
        typeof obj.title === 'string' &&
        typeof obj.content === 'string' &&
        typeof obj.author === 'string'
    );
};

export const isUser = (obj: any): obj is User => {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.id === 'number' &&
        typeof obj.name === 'string' &&
        typeof obj.email === 'string' &&
        (obj.role === 'teacher' || obj.role === 'student')
    );
};

export const isTeacher = (obj: any): obj is Teacher => {
    return isUser(obj) && obj.role === 'teacher';
};

export const isStudent = (obj: any): obj is Student => {
    return isUser(obj) && obj.role === 'student';
};

export const isAuthUser = (obj: any): obj is AuthUser => {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.id === 'number' &&
        typeof obj.name === 'string' &&
        typeof obj.email === 'string' &&
        (obj.role === 'teacher' || obj.role === 'student') &&
        typeof obj.token === 'string'
    );
};