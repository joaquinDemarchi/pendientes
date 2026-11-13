// Tipos compartidos

export interface User {
  username: string;
  password: string; 
}

// Ubicacion guardada en una tarea
export interface TaskLocation {
  latitude: number;
  longitude: number;
  address: string | null; 
}

// Contacto responsable de la tarea
export interface TaskContact {
  id: string;
  name: string;
  phone: string | null;
}


export interface Task {
  id: string;
  title: string;
  done: boolean;
  remindAt: number | null;
  notificationId: string | null; 
  createdAt: number;
  photoUri?: string | null;       
  location?: TaskLocation | null;
  contact?: TaskContact | null;
  calendarEventId?: string | null; 
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  TaskForm: { task?: Task }; 
  Camera: undefined;         //sacar la foto
  ContactPicker: undefined;  //elegir el responsable
};