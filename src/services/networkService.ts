import { ApiError } from '../types';
import { API_CONFIG } from '../config';

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
   * Test connectivity to API server
   */
  static async testApiConnectivity(): Promise<{ success: boolean; baseUrl?: string; error?: string }> {
    const axios = require('axios');
    
    for (const baseUrl of API_CONFIG.FALLBACK_URLS) {
      try {
        await axios.get(`${baseUrl}/posts`, {
          timeout: API_CONFIG.CONNECTION_TIMEOUT,
          headers: { 'Content-Type': 'application/json' }
        });
        
        return { success: true, baseUrl };
      } catch (error: any) {
        console.log(`API connectivity test failed for ${baseUrl}:`, error.code || error.message);
        continue;
      }
    }
    
    return { 
      success: false, 
      error: 'All API endpoints failed connectivity test' 
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

  /**
   * Create appropriate error based on network conditions
   */
  static createNetworkError(originalError: any): ApiError {
    if (!this.isOnline()) {
      return this.createOfflineError();
    }

    // Map specific network errors to user-friendly messages
    if (originalError.code === 'ECONNREFUSED') {
      return {
        message: 'Unable to connect to server. Please check if the server is running.',
        code: 'CONNECTION_REFUSED',
      };
    } else if (originalError.code === 'ETIMEDOUT') {
      return {
        message: 'Request timed out. Please check your internet connection and try again.',
        code: 'TIMEOUT_ERROR',
      };
    } else if (originalError.code === 'ENOTFOUND') {
      return {
        message: 'Server not found. Please check your network connection.',
        code: 'HOST_NOT_FOUND',
      };
    }

    return {
      message: 'Network error occurred. Please check your connection and try again.',
      code: 'NETWORK_ERROR',
    };
  }
}

export default NetworkService;