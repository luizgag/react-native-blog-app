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
      delay = API_CONFIG.RETRY_DELAY,
      backoffMultiplier = API_CONFIG.RETRY_BACKOFF_MULTIPLIER,
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

        console.log(`Retry attempt ${attempt}/${maxAttempts} failed, retrying in ${currentDelay}ms...`);
        console.log(`Error: ${lastError.message} (${lastError.code})`);

        // Wait before retrying
        await this.sleep(currentDelay);
        currentDelay *= backoffMultiplier;
      }
    }

    throw lastError!;
  }

  private static defaultRetryCondition(error: ApiError): boolean {
    // Retry on network errors and 5xx server errors, but not on auth errors
    const retryableCodes = [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'CONNECTION_REFUSED',
      'HOST_NOT_FOUND',
      'REQUEST_CANCELLED'
    ];

    const isRetryableCode = retryableCodes.includes(error.code || '');
    const isServerError = error.status !== undefined && error.status >= 500;
    const isNotAuthError = error.status !== 401 && error.status !== 403;

    return (isRetryableCode || isServerError) && isNotAuthError;
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Exponential backoff with jitter to avoid thundering herd
   */
  static calculateBackoffDelay(attempt: number, baseDelay: number, multiplier: number): number {
    const exponentialDelay = baseDelay * Math.pow(multiplier, attempt - 1);
    const jitter = Math.random() * 0.1 * exponentialDelay; // Add up to 10% jitter
    return Math.min(exponentialDelay + jitter, 30000); // Cap at 30 seconds
  }
}