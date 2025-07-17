import { API_CONFIG } from '../config';
import { ApiError } from '../types';

export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoffMultiplier?: number;
  retryCondition?: (error: ApiError) => boolean;
}

export class RetryService {
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = API_CONFIG.RETRY_ATTEMPTS,
      delay = 1000,
      backoffMultiplier = 2,
      retryCondition = this.defaultRetryCondition,
    } = options;

    let lastError: ApiError;
    let currentDelay = delay;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as ApiError;

        // Don't retry on last attempt or if retry condition fails
        if (attempt === maxAttempts || !retryCondition(lastError)) {
          throw lastError;
        }

        // Wait before retrying
        await this.sleep(currentDelay);
        currentDelay *= backoffMultiplier;
      }
    }

    throw lastError!;
  }

  private static defaultRetryCondition(error: ApiError): boolean {
    // Retry on network errors and 5xx server errors
    return (
      error.code === 'NETWORK_ERROR' ||
      (error.status !== undefined && error.status >= 500)
    );
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}