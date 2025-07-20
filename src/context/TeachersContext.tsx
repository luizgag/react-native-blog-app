import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  TeachersContextValue,
  TeachersContextState,
  TeachersAction
} from '../types/context';
import { Teacher, PaginatedResponse } from '../types';
import { enhancedApiService } from '../services/apiService';
import { PaginationState } from '../types/utils';

// Initial state
const initialState: TeachersContextState = {
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
  currentTeacher: null,
};

// Teachers reducer
const teachersReducer = (state: TeachersContextState, action: TeachersAction): TeachersContextState => {
  switch (action.type) {
    case 'FETCH_TEACHERS_START':
      return {
        ...state,
        loading: 'loading',
        error: null,
      };

    case 'FETCH_TEACHERS_SUCCESS':
      return {
        ...state,
        data: action.payload.data,
        pagination: action.payload.pagination,
        loading: 'success',
        error: null,
      };

    case 'FETCH_TEACHERS_FAILURE':
      return {
        ...state,
        loading: 'error',
        error: action.payload,
      };

    case 'FETCH_TEACHER_SUCCESS':
      return {
        ...state,
        currentTeacher: action.payload,
        error: null,
      };

    case 'CREATE_TEACHER_SUCCESS':
      return {
        ...state,
        data: state.data ? [action.payload, ...state.data] : [action.payload],
        pagination: {
          ...state.pagination,
          totalItems: state.pagination.totalItems + 1,
        },
        error: null,
      };

    case 'UPDATE_TEACHER_SUCCESS':
      return {
        ...state,
        data: state.data
          ? state.data.map(teacher =>
            teacher.id === action.payload.id ? action.payload : teacher
          )
          : null,
        currentTeacher: state.currentTeacher?.id === action.payload.id
          ? action.payload
          : state.currentTeacher,
        error: null,
      };

    case 'DELETE_TEACHER_SUCCESS':
      return {
        ...state,
        data: state.data
          ? state.data.filter(teacher => teacher.id !== action.payload)
          : null,
        currentTeacher: state.currentTeacher?.id === action.payload
          ? null
          : state.currentTeacher,
        pagination: {
          ...state.pagination,
          totalItems: Math.max(0, state.pagination.totalItems - 1),
        },
        error: null,
      };

    case 'CLEAR_CURRENT_TEACHER':
      return {
        ...state,
        currentTeacher: null,
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
const TeachersContext = createContext<TeachersContextValue | undefined>(undefined);

// Teachers provider component
interface TeachersProviderProps {
  children: ReactNode;
}

export const TeachersProvider: React.FC<TeachersProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(teachersReducer, initialState);

  const fetchTeachers = async (page: number = 1): Promise<void> => {
    dispatch({ type: 'FETCH_TEACHERS_START' });

    try {
      const response: PaginatedResponse<Teacher> = await enhancedApiService.getTeachers(page);

      const pagination: PaginationState = {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalItems: response.totalItems,
        itemsPerPage: Math.ceil(response.totalItems / response.totalPages) || 10,
        hasNextPage: response.currentPage < response.totalPages,
        hasPreviousPage: response.currentPage > 1,
      };

      dispatch({
        type: 'FETCH_TEACHERS_SUCCESS',
        payload: {
          data: response.data,
          pagination
        }
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch teachers. Please try again.';
      dispatch({ type: 'FETCH_TEACHERS_FAILURE', payload: errorMessage });
      throw error; // Re-throw to allow components to handle
    }
  };

  const fetchTeacher = async (id: number): Promise<void> => {
    try {
      // Since there's no specific getTeacher endpoint, we'll find from the current list
      // or fetch the list if not available
      if (!state.data) {
        await fetchTeachers();
      }

      const teacher = state.data?.find(t => t.id === id);
      if (teacher) {
        dispatch({ type: 'FETCH_TEACHER_SUCCESS', payload: teacher });
      } else {
        throw new Error('Teacher not found');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch teacher. Please try again.';
      dispatch({ type: 'FETCH_TEACHERS_FAILURE', payload: errorMessage });
      throw error; // Re-throw to allow components to handle
    }
  };

  const createTeacher = async (teacher: {
    name: string;
    email: string;
    password: string;
    department?: string
  }): Promise<void> => {
    try {
      const newTeacher = await enhancedApiService.createTeacher(teacher);
      dispatch({ type: 'CREATE_TEACHER_SUCCESS', payload: newTeacher });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create teacher. Please try again.';
      dispatch({ type: 'FETCH_TEACHERS_FAILURE', payload: errorMessage });
      throw error; // Re-throw to allow components to handle
    }
  };

  const updateTeacher = async (id: number, teacher: {
    name?: string;
    email?: string;
    department?: string
  }): Promise<void> => {
    try {
      const updatedTeacher = await enhancedApiService.updateTeacher(id, teacher);
      dispatch({ type: 'UPDATE_TEACHER_SUCCESS', payload: updatedTeacher });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update teacher. Please try again.';
      dispatch({ type: 'FETCH_TEACHERS_FAILURE', payload: errorMessage });
      throw error; // Re-throw to allow components to handle
    }
  };

  const deleteTeacher = async (id: number): Promise<void> => {
    try {
      await enhancedApiService.deleteTeacher(id);
      dispatch({ type: 'DELETE_TEACHER_SUCCESS', payload: id });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete teacher. Please try again.';
      dispatch({ type: 'FETCH_TEACHERS_FAILURE', payload: errorMessage });
      throw error; // Re-throw to allow components to handle
    }
  };

  const clearCurrentTeacher = (): void => {
    dispatch({ type: 'CLEAR_CURRENT_TEACHER' });
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: TeachersContextValue = {
    ...state,
    actions: {
      fetchTeachers,
      fetchTeacher,
      createTeacher,
      updateTeacher,
      deleteTeacher,
      clearCurrentTeacher,
      clearError,
    },
  };

  return (
    <TeachersContext.Provider value={contextValue}>
      {children}
    </TeachersContext.Provider>
  );
};

// Custom hook to use teachers context
export const useTeachers = (): TeachersContextValue => {
  const context = useContext(TeachersContext);
  if (context === undefined) {
    throw new Error('useTeachers must be used within a TeachersProvider');
  }
  return context;
};

// Export context for testing purposes
export { TeachersContext };