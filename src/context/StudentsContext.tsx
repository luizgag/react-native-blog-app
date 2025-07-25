import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  StudentsContextValue,
  StudentsContextState,
  StudentsAction
} from '../types/context';
import { User, PaginatedResponse } from '../types';
import { enhancedApiService } from '../services';
import { PaginationState } from '../types/utils';

// Initial state
const initialState: StudentsContextState = {
  data: null,
  loading: 'idle',
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  currentStudent: null,
};

// Students reducer
const studentsReducer = (state: StudentsContextState, action: StudentsAction): StudentsContextState => {
  switch (action.type) {
    case 'FETCH_STUDENTS_START':
      return {
        ...state,
        loading: 'loading',
        error: null,
      };

    case 'FETCH_STUDENTS_SUCCESS':
      return {
        ...state,
        data: action.payload.data,
        pagination: action.payload.pagination,
        loading: 'success',
        error: null,
      };

    case 'FETCH_STUDENTS_FAILURE':
      return {
        ...state,
        loading: 'error',
        error: action.payload,
      };

    case 'FETCH_STUDENT_SUCCESS':
      return {
        ...state,
        currentStudent: action.payload,
        error: null,
      };

    case 'CREATE_STUDENT_SUCCESS':
      return {
        ...state,
        data: state.data ? [action.payload, ...state.data] : [action.payload],
        pagination: {
          ...state.pagination,
          totalItems: state.pagination.totalItems + 1,
        },
        error: null,
      };

    case 'UPDATE_STUDENT_SUCCESS':
      return {
        ...state,
        data: state.data
          ? state.data.map(user =>
            user.id === action.payload.id ? action.payload : user
          )
          : null,
        currentStudent: state.currentStudent?.id === action.payload.id
          ? action.payload
          : state.currentStudent,
        error: null,
      };

    case 'DELETE_STUDENT_SUCCESS':
      return {
        ...state,
        data: state.data
          ? state.data.filter(user => user.id !== action.payload)
          : null,
        currentStudent: state.currentStudent?.id === action.payload
          ? null
          : state.currentStudent,
        pagination: {
          ...state.pagination,
          totalItems: Math.max(0, state.pagination.totalItems - 1),
        },
        error: null,
      };

    case 'CLEAR_CURRENT_STUDENT':
      return {
        ...state,
        currentStudent: null,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const StudentsContext = createContext<StudentsContextValue | undefined>(undefined);

// Students provider component
interface StudentsProviderProps {
  children: ReactNode;
}

export const StudentsProvider: React.FC<StudentsProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(studentsReducer, initialState);

  const fetchStudents = async (page: number = 1): Promise<void> => {
    dispatch({ type: 'FETCH_STUDENTS_START' });

    try {
      const response: PaginatedResponse<User> = await enhancedApiService.getStudents(page);

      const pagination: PaginationState = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalItems: response.totalItems,
        itemsPerPage: Math.ceil(response.totalItems / response.totalPages) || 10,
        hasNextPage: response.currentPage < response.totalPages,
        hasPreviousPage: response.currentPage > 1,
      };

      dispatch({
        type: 'FETCH_STUDENTS_SUCCESS',
        payload: {
          data: response.data,
          pagination
        }
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch students. Please try again.';
      dispatch({ type: 'FETCH_STUDENTS_FAILURE', payload: errorMessage });
      throw error; // Re-throw to allow components to handle
    }
  };

  const fetchStudent = async (id: number): Promise<void> => {
    try {
      // Since there's no specific getStudent endpoint, we'll find from the current list
      // or fetch the list if not available
      if (!state.data) {
        await fetchStudents();
      }

      const student = state.data?.find(s => s.id === id);
      if (student) {
        dispatch({ type: 'FETCH_STUDENT_SUCCESS', payload: student });
      } else {
        throw new Error('Student not found');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch student. Please try again.';
      dispatch({ type: 'FETCH_STUDENTS_FAILURE', payload: errorMessage });
      throw error; // Re-throw to allow components to handle
    }
  };

  const createStudent = async (student: {
    nome: string;
    email: string;
    senha: string;
    studentId?: string
  }): Promise<void> => {
    try {
      const studentData = {
        nome: student.nome,
        email: student.email,
        senha: student.senha,
        confirmacao_senha: student.senha, // Use the same password for confirmation
        tipo_usuario: 'aluno' as const
      };
      const newStudent = await enhancedApiService.createStudent(studentData);
      dispatch({ type: 'CREATE_STUDENT_SUCCESS', payload: newStudent });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create student. Please try again.';
      dispatch({ type: 'FETCH_STUDENTS_FAILURE', payload: errorMessage });
      throw error; // Re-throw to allow components to handle
    }
  };

  const updateStudent = async (id: number, student: {
    nome?: string;
    email?: string;
    studentId?: string
  }): Promise<void> => {
    try {
      const updatedStudent = await enhancedApiService.updateStudent(id, student);
      dispatch({ type: 'UPDATE_STUDENT_SUCCESS', payload: updatedStudent });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update student. Please try again.';
      dispatch({ type: 'FETCH_STUDENTS_FAILURE', payload: errorMessage });
      throw error; // Re-throw to allow components to handle
    }
  };

  const deleteStudent = async (id: number): Promise<void> => {
    try {
      await enhancedApiService.deleteStudent(id);
      dispatch({ type: 'DELETE_STUDENT_SUCCESS', payload: id });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete student. Please try again.';
      dispatch({ type: 'FETCH_STUDENTS_FAILURE', payload: errorMessage });
      throw error; // Re-throw to allow components to handle
    }
  };

  const clearCurrentStudent = (): void => {
    dispatch({ type: 'CLEAR_CURRENT_STUDENT' });
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: StudentsContextValue = {
    ...state,
    actions: {
      fetchStudents,
      fetchStudent,
      createStudent,
      updateStudent,
      deleteStudent,
      clearCurrentStudent,
      clearError,
    },
  };

  return (
    <StudentsContext.Provider value={contextValue}>
      {children}
    </StudentsContext.Provider>
  );
};

// Custom hook to use students context
export const useStudents = (): StudentsContextValue => {
  const context = useContext(StudentsContext);
  if (context === undefined) {
    throw new Error('useStudents must be used within a StudentsProvider');
  }
  return context;
};

// Export context for testing purposes
export { StudentsContext };