import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { StudentsProvider, useStudents } from '../StudentsContext';
import { apiService } from '../../services/apiService';
import { Student, PaginatedResponse } from '../../types';

// Mock the API service
jest.mock('../../services/apiService');
const mockApiService = apiService as jest.Mocked<typeof apiService>;

// Mock data
const mockStudent: Student = {
  id: 1,
  name: 'Alice Johnson',
  email: 'alice.johnson@example.com',
  role: 'student',
  studentId: 'STU001',
  createdAt: '2023-01-01T00:00:00Z',
};

const mockPaginatedResponse: PaginatedResponse<Student> = {
  data: [mockStudent],
  currentPage: 1,
  totalPages: 1,
  totalItems: 1,
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <StudentsProvider>{children}</StudentsProvider>
);

describe('StudentsContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide initial state', () => {
    const { result } = renderHook(() => useStudents(), { wrapper });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe('idle');
    expect(result.current.error).toBeNull();
    expect(result.current.currentStudent).toBeNull();
    expect(result.current.pagination.currentPage).toBe(1);
    expect(result.current.pagination.totalPages).toBe(1);
    expect(result.current.pagination.totalItems).toBe(0);
  });

  it('should fetch students successfully', async () => {
    mockApiService.getStudents.mockResolvedValue(mockPaginatedResponse);

    const { result } = renderHook(() => useStudents(), { wrapper });

    await act(async () => {
      await result.current.actions.fetchStudents();
    });

    expect(result.current.data).toEqual([mockStudent]);
    expect(result.current.loading).toBe('success');
    expect(result.current.error).toBeNull();
    expect(result.current.pagination.totalItems).toBe(1);
    expect(mockApiService.getStudents).toHaveBeenCalledWith(1);
  });

  it('should handle fetch students error', async () => {
    const errorMessage = 'Network error';
    mockApiService.getStudents.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useStudents(), { wrapper });

    await act(async () => {
      try {
        await result.current.actions.fetchStudents();
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe('error');
    expect(result.current.error).toBe(errorMessage);
  });

  it('should create student successfully', async () => {
    const newStudentData = {
      name: 'Bob Wilson',
      email: 'bob.wilson@example.com',
      password: 'password123',
      studentId: 'STU002',
    };

    const createdStudent: Student = {
      id: 2,
      name: 'Bob Wilson',
      email: 'bob.wilson@example.com',
      role: 'student',
      studentId: 'STU002',
      createdAt: '2023-01-02T00:00:00Z',
    };

    mockApiService.createStudent.mockResolvedValue(createdStudent);

    const { result } = renderHook(() => useStudents(), { wrapper });

    await act(async () => {
      await result.current.actions.createStudent(newStudentData);
    });

    expect(result.current.data).toEqual([createdStudent]);
    expect(result.current.error).toBeNull();
    expect(result.current.pagination.totalItems).toBe(1);
    expect(mockApiService.createStudent).toHaveBeenCalledWith(newStudentData);
  });

  it('should update student successfully', async () => {
    const updatedStudent: Student = {
      ...mockStudent,
      name: 'Alice Updated',
      studentId: 'STU001-UPDATED',
    };

    mockApiService.updateStudent.mockResolvedValue(updatedStudent);

    const { result } = renderHook(() => useStudents(), { wrapper });

    // First set some initial data
    await act(async () => {
      result.current.actions.fetchStudents();
    });

    await act(async () => {
      await result.current.actions.updateStudent(1, {
        name: 'Alice Updated',
        studentId: 'STU001-UPDATED',
      });
    });

    expect(mockApiService.updateStudent).toHaveBeenCalledWith(1, {
      name: 'Alice Updated',
      studentId: 'STU001-UPDATED',
    });
  });

  it('should delete student successfully', async () => {
    mockApiService.deleteStudent.mockResolvedValue();
    mockApiService.getStudents.mockResolvedValue(mockPaginatedResponse);

    const { result } = renderHook(() => useStudents(), { wrapper });

    // First fetch students to have data
    await act(async () => {
      await result.current.actions.fetchStudents();
    });

    await act(async () => {
      await result.current.actions.deleteStudent(1);
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.pagination.totalItems).toBe(0);
    expect(mockApiService.deleteStudent).toHaveBeenCalledWith(1);
  });

  it('should clear current student', () => {
    const { result } = renderHook(() => useStudents(), { wrapper });

    act(() => {
      result.current.actions.clearCurrentStudent();
    });

    expect(result.current.currentStudent).toBeNull();
  });

  it('should clear error', async () => {
    mockApiService.getStudents.mockRejectedValue(new Error('Test error'));

    const { result } = renderHook(() => useStudents(), { wrapper });

    // First create an error
    await act(async () => {
      try {
        await result.current.actions.fetchStudents();
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
      renderHook(() => useStudents());
    }).toThrow('useStudents must be used within a StudentsProvider');

    consoleSpy.mockRestore();
  });
});