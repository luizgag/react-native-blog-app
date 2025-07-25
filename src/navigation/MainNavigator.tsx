import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { HomeScreen } from '../screens/HomeScreen';
import { PostDetailScreen } from '../screens/PostDetailScreen';
import { CreatePostScreen } from '../screens/CreatePostScreen';
import { EditPostScreen } from '../screens/EditPostScreen';
import { AdminScreen } from '../screens/AdminScreen';
import { TeacherListScreen } from '../screens/TeacherListScreen';
import { CreateTeacherScreen } from '../screens/CreateTeacherScreen';
import { EditTeacherScreen } from '../screens/EditTeacherScreen';
import { StudentListScreen } from '../screens/StudentListScreen';
import { CreateStudentScreen } from '../screens/CreateStudentScreen';
import { EditStudentScreen } from '../screens/EditStudentScreen';
import { CustomDrawerContent } from './CustomDrawerContent';

export type MainStackParamList = {
  Home: undefined;
  PostDetail: { postId: number };
  CreatePost: undefined;
  EditPost: { postId: number };
  Admin: undefined;
  TeacherList: undefined;
  CreateTeacher: undefined;
  EditTeacher: { teacherId: number };
  StudentList: undefined;
  CreateStudent: undefined;
  EditStudent: { studentId: number };
};

export type MainTabParamList = {
  HomeTab: undefined;
  AdminTab: undefined;
};

export type MainDrawerParamList = {
  MainTabs: undefined;
  TeacherManagement: undefined;
  StudentManagement: undefined;
};

const Stack = createStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const Drawer = createDrawerNavigator<MainDrawerParamList>();

// Stack Navigator for Home-related screens
const HomeStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Blog Posts' }}
      />
      <Stack.Screen 
        name="PostDetail" 
        component={PostDetailScreen}
        options={{ title: 'Post Details' }}
      />
      <Stack.Screen 
        name="CreatePost" 
        component={CreatePostScreen}
        options={{ title: 'Create Post' }}
      />
      <Stack.Screen 
        name="EditPost" 
        component={EditPostScreen}
        options={{ title: 'Edit Post' }}
      />
    </Stack.Navigator>
  );
};

// Stack Navigator for Admin-related screens
const AdminStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Admin" 
        component={AdminScreen}
        options={{ title: 'Admin Dashboard' }}
      />
    </Stack.Navigator>
  );
};

// Stack Navigator for Teacher Management
const TeacherStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="TeacherList" 
        component={TeacherListScreen}
        options={{ title: 'Teachers' }}
      />
      <Stack.Screen 
        name="CreateTeacher" 
        component={CreateTeacherScreen}
        options={{ title: 'Add Teacher' }}
      />
      <Stack.Screen 
        name="EditTeacher" 
        component={EditTeacherScreen}
        options={{ title: 'Edit Teacher' }}
      />
    </Stack.Navigator>
  );
};

// Stack Navigator for Student Management
const StudentStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="StudentList" 
        component={StudentListScreen}
        options={{ title: 'Students' }}
      />
      <Stack.Screen 
        name="CreateStudent" 
        component={CreateStudentScreen}
        options={{ title: 'Add Student' }}
      />
      <Stack.Screen 
        name="EditStudent" 
        component={EditStudentScreen}
        options={{ title: 'Edit Student' }}
      />
    </Stack.Navigator>
  );
};

// Tab Navigator for main app sections
const MainTabNavigator: React.FC = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'HomeTab') {
            iconName = 'home';
          } else if (route.name === 'AdminTab') {
            iconName = 'admin-panel-settings';
          } else {
            iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStackNavigator}
        options={{ tabBarLabel: 'Home' }}
      />
      {isTeacher && (
        <Tab.Screen 
          name="AdminTab" 
          component={AdminStackNavigator}
          options={{ tabBarLabel: 'Admin' }}
        />
      )}
    </Tab.Navigator>
  );
};

// Main Navigator with Drawer (for teachers only)
export const MainNavigator: React.FC = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  if (!isTeacher) {
    // Students only get the tab navigator without drawer
    return <MainTabNavigator />;
  }

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#f8f9fa',
          width: 280,
        },
        drawerActiveTintColor: '#2196F3',
        drawerInactiveTintColor: '#666',
      }}
    >
      <Drawer.Screen 
        name="MainTabs" 
        component={MainTabNavigator}
        options={{
          drawerLabel: 'Home',
          drawerIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="TeacherManagement" 
        component={TeacherStackNavigator}
        options={{
          drawerLabel: 'Manage Teachers',
          drawerIcon: ({ color, size }) => (
            <Icon name="school" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="StudentManagement" 
        component={StudentStackNavigator}
        options={{
          drawerLabel: 'Manage Students',
          drawerIcon: ({ color, size }) => (
            <Icon name="people" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};