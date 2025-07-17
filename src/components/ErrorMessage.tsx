import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
  type?: 'error' | 'warning' | 'info';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  retryText = 'Try Again',
  type = 'error',
}) => {
  const getContainerStyle = () => {
    switch (type) {
      case 'warning':
        return [styles.container, styles.warningContainer];
      case 'info':
        return [styles.container, styles.infoContainer];
      default:
        return [styles.container, styles.errorContainer];
    }
  };

  const getTextStyle = () => {
    switch (type) {
      case 'warning':
        return [styles.message, styles.warningText];
      case 'info':
        return [styles.message, styles.infoText];
      default:
        return [styles.message, styles.errorText];
    }
  };

  return (
    <View style={getContainerStyle()}>
      <Text
        style={getTextStyle()}
        accessibilityLabel={`${type}: ${message}`}
        accessibilityRole="alert"
      >
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          accessibilityLabel={retryText}
          accessibilityHint="Tap to retry the failed operation"
          accessibilityRole="button"
        >
          <Text style={styles.retryText}>{retryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  errorContainer: {
    backgroundColor: '#FFF5F5',
    borderColor: '#E53E3E',
  },
  warningContainer: {
    backgroundColor: '#FFFBEB',
    borderColor: '#D69E2E',
  },
  infoContainer: {
    backgroundColor: '#EBF8FF',
    borderColor: '#3182CE',
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  errorText: {
    color: '#E53E3E',
  },
  warningText: {
    color: '#D69E2E',
  },
  infoText: {
    color: '#3182CE',
  },
  retryButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#007AFF',
    borderRadius: 6,
    alignSelf: 'center',
    minHeight: 44, // Accessibility: minimum touch target
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});