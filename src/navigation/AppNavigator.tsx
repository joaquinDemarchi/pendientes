
// Stack Navigation con las 4 pantallas obligatorias.
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useAuth } from '../context/AuthContext';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TaskFormScreen from '../screens/TaskFormScreen';
import { colors } from '../theme';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerBackTitle: 'Volver',
          contentStyle: { backgroundColor: colors.bg },
          animation: 'slide_from_right',
        }}
      >
        {user ? (
          // Con sesióo: solo existen estas pantallas 
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen
              name="TaskForm"
              component={TaskFormScreen}
              options={({ route }) => ({
                title: route.params?.task ? 'Editar tarea' : 'Nueva tarea',
              })}
            />
          </>
        ) : (
          // Sin sesion no se puede llgar al home
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: '' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}