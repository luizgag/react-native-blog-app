import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

interface NetworkStatusIndicatorProps {
  showWhenOnline?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
  showWhenOnline = false,
  autoHide = true,
  autoHideDelay = 3000,
}) => {
  const { isOnline, isConnected, type } = useNetworkStatus();
  const [visible, setVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const shouldShow = !isOnline || (showWhenOnline && isOnline);
    
    if (shouldShow && !visible) {
      setVisible(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto hide for online status
      if (isOnline && autoHide) {
        const timer = setTimeout(() => {
          hideIndicator();
        }, autoHideDelay);

        return () => clearTimeout(timer);
      }
    } else if (!shouldShow && visible) {
      hideIndicator();
    }
  }, [isOnline, isConnected, visible, showWhenOnline, autoHide, autoHideDelay]);

  const hideIndicator = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
    });
  };

  const getStatusText = () => {
    if (!isConnected) {
      return 'No internet connection';
    }
    if (!isOnline) {
      return 'Connection issues detected';
    }
    return `Connected via ${type}`;
  };

  const getStatusStyle = () => {
    if (!isOnline) {
      return [styles.container, styles.offline];
    }
    return [styles.container, styles.online];
  };

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        getStatusStyle(),
        { opacity: fadeAnim }
      ]}
    >
      <TouchableOpacity
        onPress={hideIndicator}
        style={styles.content}
        accessibilityLabel={`Network status: ${getStatusText()}`}
        accessibilityHint="Tap to dismiss this notification"
        accessibilityRole="button"
      >
        <Text style={styles.text}>{getStatusText()}</Text>
        <Text style={styles.dismissText}>Tap to dismiss</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: 50, // Account for status bar
  },
  content: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  offline: {
    backgroundColor: '#E53E3E',
  },
  online: {
    backgroundColor: '#38A169',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  dismissText: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.8,
    marginTop: 2,
  },
});