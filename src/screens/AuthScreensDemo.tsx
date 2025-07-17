import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ActionButton } from '../components/ActionButton';
import { LoginScreen } from './LoginScreen';
import { SplashScreen } from './SplashScreen';

type DemoScreen = 'splash' | 'login' | 'info';

export const AuthScreensDemo: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<DemoScreen>('info');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'login':
        return <LoginScreen />;
      default:
        return (
          <View style={styles.container}>
            <Text style={styles.title}>Authentication Screens Demo</Text>
            <Text style={styles.subtitle}>
              Task 8: Implement authentication screens ✅
            </Text>
            
            <View style={styles.info}>
              <Text style={styles.infoTitle}>Implemented Features:</Text>
              <Text style={styles.infoItem}>• LoginScreen with email/password form</Text>
              <Text style={styles.infoItem}>• Form validation and error handling</Text>
              <Text style={styles.infoItem}>• SplashScreen with authentication check</Text>
              <Text style={styles.infoItem}>• Loading states and error messages</Text>
              <Text style={styles.infoItem}>• Integration with AuthContext</Text>
              <Text style={styles.infoItem}>• Accessibility support</Text>
            </View>

            <View style={styles.buttons}>
              <ActionButton
                title="View Splash Screen"
                onPress={() => setCurrentScreen('splash')}
                variant="primary"
                fullWidth
                style={styles.button}
              />
              <ActionButton
                title="View Login Screen"
                onPress={() => setCurrentScreen('login')}
                variant="secondary"
                fullWidth
                style={styles.button}
              />
            </View>

            <Text style={styles.note}>
              Note: These screens are fully functional and integrate with the existing
              AuthContext, API service, and reusable components.
            </Text>
          </View>
        );
    }
  };

  if (currentScreen !== 'info') {
    return (
      <View style={styles.fullScreen}>
        {renderScreen()}
        <View style={styles.backButton}>
          <ActionButton
            title="← Back to Demo"
            onPress={() => setCurrentScreen('info')}
            variant="outline"
            size="small"
          />
        </View>
      </View>
    );
  }

  return renderScreen();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 20,
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#059669',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '600',
  },
  info: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  infoItem: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
    lineHeight: 20,
  },
  buttons: {
    marginBottom: 20,
  },
  button: {
    marginBottom: 12,
  },
  note: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1000,
  },
});