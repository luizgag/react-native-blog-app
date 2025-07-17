import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { TeachersProvider, useTeachers } from '../TeachersContext';
import { apiService } from '../../services/apiService';
import { Teacher, PaginatedResponse } from '../../types';

// Mock the API service
jest.mock('../../services/apiService');
const mockApiService = apiService as jest.Mocked<typeof apiService>;

// Mock data
const mockTeacher: Teacher = {
  id: 1,
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'teacher',
  department: 'Computer Science',
  createdAt: '2023-01-01T00:00:00Z',
};

const mockPaginatedResponse: PaginatedResponse<Teacher> = {
  data: [mockTeacher],
  currentPage: 1,
  totalPages: 1,
  totalItems: 1,
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <TeachersProvider>{children}</TeachersProvider>
);

describe('TeachersContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide initial state', () => {
    const { result } = renderHook(() => useTeachers(), { wrapper });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe('idle');
    expect(result.current.error).toBeNull();
    expect(result.current.currentTeacher).toBeNull();
    expect(result.current.pagination.currentPage).toBe(1);
    expect(result.current.pagination.totalPages).toBe(1);
    expect(result.current.pagination.totalItems).toBe(0);
  });

  it('should fetch teachers successfully', async () => {
    mockApiService.getTeachers.mockResolvedValue(mockPaginatedResponse);

    const { result } = renderHook(() => useTeachers(), { wrapper });

    await act(async () => {
      await result.current.actions.fetchTeachers();
    });

    expect(result.current.data).toEqual([mockTeacher]);
    expect(result.current.loading).toBe('success');
    expect(result.current.error).toBeNull();
    expect(result.current.pagination.totalItems).toBe(1);
    expect(mockApiService.getTeachers).toHaveBeenCalledWith(1);
  });

  it('should handle fetch teachers error', async () => {
    const errorMessage = 'Network error';
    mockApiService.getTeachers.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useTeachers(), { wrapper });

    await act(async () => {
      try {
        await result.current.actions.fetchTeachers();
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe('error');
    expect(result.current.error).toBe(errorMessage);
  });

  it('should create teacher successfully', async () => {
    const newTeacherData = {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      password: 'password123',
      department: 'Mathematics',
    };

    const createdTeacher: Teacher = {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'teacher',
      department: 'Mathematics',
      createdAt: '2023-01-02T00:00:00Z',
    };

    mockApiService.createTeacher.mockResolvedValue(createdTeacher);

    const { result } = renderHook(() => useTeachers(), { wrapper });

    await act(async () => {
      await result.current.actions.createTeacher(newTeacherData);
    });

    expect(result.current.data).toEqual([createdTeacher]);
    expect(result.current.error).toBeNull();
    expect(result.current.pagination.totalItems).toBe(1);
    expect(mockApiService.createTeacher).toHaveBeenCalledWith(newTeacherData);
  });

  it('should update teacher successfully', async () => {
    const updatedTeacher: Teacher = {
      ...mockTeacher,
      name: 'John Updated',
      department: 'Updated Department',
    };

    mockApiService.updateTeacher.mockResolvedValue(updatedTeacher);

    const { result } = renderHook(() => useTeachers(), { wrapper });

    // First set some initial data
    await act(async () => {
      result.current.actions.fetchTeachers();
    });

    await act(async () => {
      await result.current.actions.updateTeacher(1, {
        name: 'John Updated',
        department: 'Updated Department',
      });
    });

    expect(mockApiService.updateTeacher).toHaveBeenCalledWith(1, {
      name: 'John Updated',
      department: 'Updated Department',
    });
  });

  it('should delete teacher successfully', async () => {
    mockApiService.deleteTeacher.mockResolvedValue();
    mockApiService.getTeachers.mockResolvedValue(mockPaginatedResponse);

    const { result } = renderHook(() => useTeachers(), { wrapper });

    // First fetch teachers to have data
    await act(async () => {
      await result.current.actions.fetchTeachers();
    });

    await act(async () => {
      await result.current.actions.deleteTeacher(1);
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.pagination.totalItems).toBe(0);
    expect(mockApiService.deleteTeacher).toHaveBeenCalledWith(1);
  });

  it('should clear current teacher', () => {
    const { result } = renderHook(() => useTeachers(), { wrapper });

    act(() => {
      result.current.actions.clearCurrentTeacher();
    });

    expect(result.current.currentTeacher).toBeNull();
  });

  it('should clear error', async () => {
    mockApiService.getTeachers.mockRejectedValue(new Error('Test error'));

    const { result } = renderHook(() => useTeachers(), { wrapper });

    // First create an error
    await act(async () => {
      try {
        await result.current.actions.fetchTeachers();
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe('Test error');

    // Clear the error
    act(() => {
      result.current.actions.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should throw error when used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useTeachers());
    }).toThrow('useTeachers must be used within a TeachersProvider');

    consoleSpy.mockRestore();
  });
});