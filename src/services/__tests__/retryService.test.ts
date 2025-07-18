import { RetryService } from '../retryService';
import { ApiError } from '../../types';

describe('RetryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('withRetry', () => {
    it('should return result on first successful attempt', async () => {
      const mockOperation = jest.fn().mockResolvedValue('success');

      const result = await RetryService.withRetry(mockOperation);

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('should retry on network errors', async () => {
      const networkError: ApiError = {
        message: 'Network error',
        code: 'NETWORK_ERROR',
      };
      const mockOperation = jest
        .fn()
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError)
        .mockResolvedValue('success');

      const result = await RetryService.withRetry(mockOperation, {
        maxAttempts: 3,
        delay: 10, // Short delay for testing
      });

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(3);
    });

    it('should retry on 5xx server errors', async () => {
      const serverError: ApiError = {
        message: 'Internal Server Error',
        status: 500,
      };
      const mockOperation = jest
        .fn()
        .mockRejectedValueOnce(serverError)
        .mockResolvedValue('success');

      const result = await RetryService.withRetry(mockOperation, {
        maxAttempts: 2,
        delay: 10,
      });

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(2);
    });

    it('should not retry on 4xx client errors', async () => {
      const clientError: ApiError = {
        message: 'Bad Request',
        status: 400,
      };
      const mockOperation = jest.fn().mockRejectedValue(clientError);

      await expect(
        RetryService.withRetry(mockOperation, {
          maxAttempts: 3,
          delay: 10,
        })
      ).rejects.toEqual(clientError);

      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('should throw error after max attempts', async () => {
      const networkError: ApiError = {
        message: 'Network error',
        code: 'NETWORK_ERROR',
      };
      const mockOperation = jest.fn().mockRejectedValue(networkError);

      await expect(
        RetryService.withRetry(mockOperation, {
          maxAttempts: 3,
          delay: 10,
        })
      ).rejects.toEqual(networkError);

      expect(mockOperation).toHaveBeenCalledTimes(3);
    });

    it('should use exponential backoff', async () => {
      const networkError: ApiError = {
        message: 'Network error',
        code: 'NETWORK_ERROR',
      };
      const mockOperation = jest.fn().mockRejectedValue(networkError);
      const startTime = Date.now();

      await expect(
        RetryService.withRetry(mockOperation, {
          maxAttempts: 3,
          delay: 50,
          backoffMultiplier: 2,
        })
      ).rejects.toEqual(networkError);

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should wait at least 50ms + 100ms = 150ms total
      expect(totalTime).toBeGreaterThan(140);
      expect(mockOperation).toHaveBeenCalledTimes(3);
    });

    it('should use custom retry condition', async () => {
      const customError: ApiError = {
        message: 'Custom error',
        code: 'CUSTOM_ERROR',
      };
      const mockOperation = jest.fn().mockRejectedValue(customError);
      const customRetryCondition = jest.fn().mockReturnValue(false);

      await expect(
        RetryService.withRetry(mockOperation, {
          maxAttempts: 3,
          delay: 10,
          retryCondition: customRetryCondition,
        })
      ).rejects.toEqual(customError);

      expect(mockOperation).toHaveBeenCalledTimes(1);
      expect(customRetryCondition).toHaveBeenCalledWith(customError);
    });

    it('should retry with custom condition returning true', async () => {
      const customError: ApiError = {
        message: 'Custom error',
        code: 'CUSTOM_ERROR',
      };
      const mockOperation = jest
        .fn()
        .mockRejectedValueOnce(customError)
        .mockResolvedValue('success');
      const customRetryCondition = jest.fn().mockReturnValue(true);

      const result = await RetryService.withRetry(mockOperation, {
        maxAttempts: 2,
        delay: 10,
        retryCondition: customRetryCondition,
      });

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(2);
      expect(customRetryCondition).toHaveBeenCalledWith(customError);
    });

    it('should handle async operations that throw synchronously', async () => {
      const syncError = new Error('Sync error');
      const mockOperation = jest.fn().mockImplementation(() => {
        throw syncError;
      });

      await expect(
        RetryService.withRetry(mockOperation, {
          maxAttempts: 2,
          delay: 10,
        })
      ).rejects.toEqual(syncError);

      expect(mockOperation).toHaveBeenCalledTimes(1);
    });
  });

  describe('default retry condition', () => {
    it('should retry on network errors', () => {
      const networkError: ApiError = {
        message: 'Network error',
        code: 'NETWORK_ERROR',
      };

      // Access the private method through reflection for testing
      const shouldRetry = (RetryService as any).defaultRetryCondition(networkError);
      expect(shouldRetry).toBe(true);
    });

    it('should retry on 5xx errors', () => {
      const serverError: ApiError = {
        message: 'Server error',
        status: 500,
      };

      const shouldRetry = (RetryService as any).defaultRetryCondition(serverError);
      expect(shouldRetry).toBe(true);
    });

    it('should not retry on 4xx errors', () => {
      const clientError: ApiError = {
        message: 'Client error',
        status: 400,
      };

      const shouldRetry = (RetryService as any).defaultRetryCondition(clientError);
      expect(shouldRetry).toBe(false);
    });

    it('should not retry on 2xx errors (edge case)', () => {
      const successError: ApiError = {
        message: 'Success error',
        status: 200,
      };

      const shouldRetry = (RetryService as any).defaultRetryCondition(successError);
      expect(shouldRetry).toBe(false);
    });
  });
});