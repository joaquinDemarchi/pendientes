// Tipos compartidos

export interface User {
  username: string;
  password: string; 
}

export interface Task {
  id: string;
  title: string;
  done: boolean;
  remindAt: number | null; 
  notificationId: string | null; // id que devuelve expo-notifications
  createdAt: number;
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  TaskForm: { task?: Task }; // sin task = alta, con task = edición
};