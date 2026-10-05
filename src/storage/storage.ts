
//funciones que usan el AS  

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, User } from '../types';

const CLAVE_USR = '@pendientes_users';
// Cada usuario tiene su propia lista
const claveTarea = (username: string) => `@pendientes_tasks_${username}`;

//  Usuarios 
export async function traerUsuariosAS(): Promise<User[]> {
  const raw = await AsyncStorage.getItem(CLAVE_USR);
  return raw ? JSON.parse(raw) : [];
}

export async function guardarUsuariosAS(user: User): Promise<void> {
  const users = await traerUsuariosAS();
  users.push(user);
  await AsyncStorage.setItem(CLAVE_USR, JSON.stringify(users));
}

export async function buscarUsuariosAS(username: string): Promise<User | undefined> {
  const users = await traerUsuariosAS();
  return users.find((u) => u.username.toLowerCase() === username.toLowerCase());
}

//Tareas
export async function traerTareas(username: string): Promise<Task[]> {
  const raw = await AsyncStorage.getItem(claveTarea(username));
  return raw ? JSON.parse(raw) : [];
}

export async function guardarTareas(username: string, tasks: Task[]): Promise<void> {
  await AsyncStorage.setItem(claveTarea(username), JSON.stringify(tasks));
}