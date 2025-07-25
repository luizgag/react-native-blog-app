import React from 'react';
import { TouchableOpacity, Alert, View } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { DrawerActions } from '@react-navigation/native';
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

// Logout Button Component
const LogoutButton: React.FC = () => {
  const { actions } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza de que deseja sair?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            actions.logout();
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      onPress={handleLogout}
      style={{ marginRight: 15 }}
      accessibilityLabel="Sair"
      accessibilityHint="Toque para fazer logout"
      accessibilityRole="button"
    >
      <Icon name="logout" size={24} color="#2196F3" />
    </TouchableOpacity>
  );
};

// Drawer Toggle Button Component
const DrawerToggleButton: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <TouchableOpacity
      onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
      style={{ marginLeft: 15 }}
      accessibilityLabel="Abrir menu"
      accessibilityHint="Toque para abrir o menu lateral"
      accessibilityRole="button"
    >
      <Icon name="menu" size={24} color="#2196F3" />
    </TouchableOpacity>
  );
};

// Header Buttons Component (combines drawer toggle and logout)
const HeaderButtons: React.FC<{ navigation: any; showDrawerToggle?: boolean }> = ({
  navigation,
  showDrawerToggle = false
}) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {showDrawerToggle && <DrawerToggleButton navigation={navigation} />}
      <LogoutButton />
    </View>
  );
};

// Stack Navigator for Home-related screens
const HomeStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Posts do Blog',
          headerRight: () => <LogoutButton />,
        }}
      />
      <Stack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{
          title: 'Detalhes do Post',
          headerRight: () => <LogoutButton />,
        }}
      />
      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{
          title: 'Criar Post',
          headerRight: () => <LogoutButton />,
        }}
      />
      <Stack.Screen
        name="EditPost"
        component={EditPostScreen}
        options={{
          title: 'Editar Post',
          headerRight: () => <LogoutButton />,
        }}
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
        options={{
          title: 'Painel Administrativo',
          headerRight: () => <LogoutButton />,
        }}
      />
      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{
          title: 'Criar Post',
          headerRight: () => <LogoutButton />,
        }}
      />
      <Stack.Screen
        name="EditPost"
        component={EditPostScreen}
        options={{
          title: 'Editar Post',
          headerRight: () => <LogoutButton />,
        }}
      />
      <Stack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{
          title: 'Detalhes do Post',
          headerRight: () => <LogoutButton />,
        }}
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
        options={{ title: 'Professores' }}
      />
      <Stack.Screen
        name="CreateTeacher"
        component={CreateTeacherScreen}
        options={{ title: 'Adicionar Professor' }}
      />
      <Stack.Screen
        name="EditTeacher"
        component={EditTeacherScreen}
        options={{ title: 'Editar Professor' }}
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
        options={{ title: 'Alunos' }}
      />
      <Stack.Screen
        name="CreateStudent"
        component={CreateStudentScreen}
        options={{ title: 'Adicionar Aluno' }}
      />
      <Stack.Screen
        name="EditStudent"
        component={EditStudentScreen}
        options={{ title: 'Editar Aluno' }}
      />
    </Stack.Navigator>
  );
};

// Tab Navigator for main app sections
const MainTabNavigator: React.FC = () => {
  const { user } = useAuth();
  const isTeacher = user?.tipo_usuario === 'professor';

  // Debug logging
  console.log('MainTabNavigator - User:', JSON.stringify(user, null, 2));
  console.log('MainTabNavigator - User type:', user?.tipo_usuario);
  console.log('MainTabNavigator - Is teacher:', isTeacher);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
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
        options={{ tabBarLabel: 'Início' }}
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
  const isTeacher = user?.tipo_usuario === 'professor';

  if (!isTeacher) {
    // Students only get the tab navigator without drawer
    return <MainTabNavigator />;
  }

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerLeft: () => <DrawerToggleButton navigation={navigation} />,
        headerRight: () => <LogoutButton />,
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#333',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        drawerStyle: {
          backgroundColor: '#f8f9fa',
          width: 280,
        },
        drawerActiveTintColor: '#2196F3',
        drawerInactiveTintColor: '#666',
      })}
    >
      <Drawer.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{
          title: 'Blog App',
          drawerLabel: 'Início',
          drawerIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="TeacherManagement"
        component={TeacherStackNavigator}
        options={{
          title: 'Gerenciar Professores',
          drawerLabel: 'Gerenciar Professores',
          drawerIcon: ({ color, size }) => (
            <Icon name="school" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="StudentManagement"
        component={StudentStackNavigator}
        options={{
          title: 'Gerenciar Alunos',
          drawerLabel: 'Gerenciar Alunos',
          drawerIcon: ({ color, size }) => (
            <Icon name="people" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};