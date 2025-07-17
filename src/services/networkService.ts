import { ApiError } from '../types';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
}

/**
 * Service for handling network-related functionality
 */
export class NetworkService {
  private static networkStatus: NetworkStatus = {
    isConnected: true,
    isInternetReachable: true,
  };

  static getNetworkStatus(): NetworkStatus {
    return this.networkStatus;
  }

  static setNetworkStatus(status: NetworkStatus): void {
    this.networkStatus = status;
  }

  static isOnline(): boolean {
    return this.networkStatus.isConnected && this.networkStatus.isInternetReachable !== false;
  }

  static createOfflineError(): ApiError {
    return {
      message: 'No internet connection. Please check your network and try again.',
      code: 'OFFLINE_ERROR',
    };
  }

  /**
   * Wrapper for API calls that checks network status
   */
  static async executeWithNetworkCheck<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.isOnline()) {
      throw this.createOfflineError();
    }
    return operation();
  }
}

export default NetworkService;