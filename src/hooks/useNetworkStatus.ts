import { useState, useEffect } from 'react';
import { NetworkStatusService, NetworkStatus } from '../services/networkStatusService';

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(
    NetworkStatusService.getCurrentStatus()
  );

  useEffect(() => {
    // Initialize network service if not already done
    NetworkStatusService.initialize().catch(console.error);

    // Subscribe to network status changes
    const unsubscribe = NetworkStatusService.addListener(setNetworkStatus);

    // Get current status
    setNetworkStatus(NetworkStatusService.getCurrentStatus());

    return unsubscribe;
  }, []);

  return {
    ...networkStatus,
    isOnline: NetworkStatusService.isOnline(),
    refresh: async () => {
      const status = await NetworkStatusService.checkConnectivity();
      setNetworkStatus(status);
      return status;
    },
  };
};