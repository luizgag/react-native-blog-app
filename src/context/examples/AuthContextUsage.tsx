import React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { useAuth, useAuthState, useAuthActions, useAuthGuard, AuthProvider } from '../index';

/**
 * Example component demonstrating how to use the AuthContext and related hooks
 * This file serves as documentation and can be used for manual testing
 */

// Example 1: Using the main useAuth hook
export const LoginExample: React.FC = () => {
  const { user, isAuthenticated, isLoading, error, actions } = useAuth();

  const handleLogin = async () => {
    try {
      await actions.login('teacher@example.com', 'password123');
      Alert.alert('Success', 'Logged in successfully!');
    } catch (error) {
      Alert.alert('Error', 'Login failed');
    }
  };

  const handleLogout = async () => {
    try {
      await actions.logout();
      Alert.alert('Success', 'Logged out successfully!');
    } catch (error) {
      Alert.alert('Error', 'Logout failed');
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>
        Authentication Status: {isAuthenticated ? 'Logged In' : 'Logged Out'}
      </Text>
      
      {user && (
        <View style={{ marginBottom: 20 }}>
          <Text>Name: {user.name}</Text>
          <Text>Email: {user.email}</Text>
          <Text>Role: {user.role}</Text>
        </View>
      )}
      
      {error && (
        <Text style={{ color: 'red', marginBottom: 20 }}>
          Error: {error}
        </Text>
      )}
      
      <View style={{ gap: 10 }}>
        {!isAuthenticated ? (
          <Button title="Login" onPress={handleLogin} />
        ) : (
          <Button title="Logout" onPress={handleLogout} />
        )}
        
        {error && (
          <Button title="Clear Error" onPress={actions.clearError} />
        )}
      </View>
    </View>
  );
};

// Example 2: Using useAuthState for read-only access
export const UserProfileExample: React.FC = () => {
  const { user, isAuthenticated } = useAuthState();

  if (!isAuthenticated || !user) {
    return <Text>Please log in to view profile</Text>;
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>User Profile</Text>
      <Text>Name: {user.name}</Text>
      <Text>Email: {user.email}</Text>
      <Text>Role: {user.role}</Text>
    </View>
  );
};

// Example 3: Using useAuthActions for action-only access
export const LogoutButtonExample: React.FC = () => {
  const { logout } = useAuthActions();

  const handleLogout = async () => {
    try {
      await logout();
      Alert.alert('Success', 'Logged out successfully!');
    } catch (error) {
      Alert.alert('Error', 'Logout failed');
    }
  };

  return <Button title="Logout" onPress={handleLogout} />;
};

// Example 4: Using useAuthGuard for role-based access control
export const AdminPanelExample: React.FC = () => {
  const { canAccessAdmin, isTeacher, requireTeacher } = useAuthGuard();

  if (!requireTeacher()) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ color: 'red' }}>
          Access Denied: Teacher role required
        </Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Admin Panel</Text>
      <Text>Welcome, Teacher!</Text>
      
      <View style={{ marginTop: 20, gap: 10 }}>
        <Button 
          title="Manage Posts" 
          disabled={!canAccessAdmin}
          onPress={() => Alert.alert('Navigate to Posts Management')}
        />
        <Button 
          title="Manage Users" 
          disabled={!canAccessAdmin}
          onPress={() => Alert.alert('Navigate to User Management')}
        />
      </View>
    </View>
  );
};

// Example 5: Conditional rendering based on authentication
export const ConditionalContentExample: React.FC = () => {
  const { isTeacher, isStudent, canCreatePosts } = useAuthGuard();

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>Available Actions:</Text>
      
      <View style={{ gap: 10 }}>
        <Button title="View Posts" onPress={() => Alert.alert('Navigate to Posts')} />
        
        {canCreatePosts && (
          <Button 
            title="Create Post" 
            onPress={() => Alert.alert('Navigate to Create Post')}
          />
        )}
        
        {isTeacher && (
          <>
            <Button 
              title="Manage Teachers" 
              onPress={() => Alert.alert('Navigate to Teacher Management')}
            />
            <Button 
              title="Manage Students" 
              onPress={() => Alert.alert('Navigate to Student Management')}
            />
          </>
        )}
        
        {isStudent && (
          <Text style={{ fontStyle: 'italic', marginTop: 10 }}>
            You have read-only access to posts
          </Text>
        )}
      </View>
    </View>
  );
};

// Example 6: Complete app wrapper showing how to use AuthProvider
export const AppWithAuthExample: React.FC = () => {
  return (
    <AuthProvider>
      <View style={{ flex: 1 }}>
        <LoginExample />
        <UserProfileExample />
        <AdminPanelExample />
        <ConditionalContentExample />
      </View>
    </AuthProvider>
  );
};