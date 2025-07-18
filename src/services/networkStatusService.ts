import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
}

export class NetworkStatusService {
  private static listeners: ((status: NetworkStatus) => void)[] = [];
  private static currentStatus: NetworkStatus = {
    isConnected: false,
    isInternetReachable: false,
    type: 'unknown',
  };

  static async initialize(): Promise<void> {
    // Get initial network state
    const state = await NetInfo.fetch();
    this.updateStatus(state);

    // Subscribe to network state changes
    NetInfo.addEventListener(this.updateStatus);
  }

  private static updateStatus = (state: NetInfoState): void => {
    const newStatus: NetworkStatus = {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable ?? false,
      type: state.type,
    };

    const hasChanged = 
      newStatus.isConnected !== this.currentStatus.isConnected ||
      newStatus.isInternetReachable !== this.currentStatus.isInternetReachable ||
      newStatus.type !== this.currentStatus.type;

    if (hasChanged) {
      this.currentStatus = newStatus;
      this.notifyListeners(newStatus);
    }
  };

  private static notifyListeners(status: NetworkStatus): void {
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in network status listener:', error);
      }
    });
  }

  static getCurrentStatus(): NetworkStatus {
    return { ...this.currentStatus };
  }

  static isOnline(): boolean {
    return this.currentStatus.isConnected && this.currentStatus.isInternetReachable;
  }

  static addListener(listener: (status: NetworkStatus) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  static async checkConnectivity(): Promise<NetworkStatus> {
    const state = await NetInfo.fetch();
    return {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable ?? false,
      type: state.type,
    };
  }
}