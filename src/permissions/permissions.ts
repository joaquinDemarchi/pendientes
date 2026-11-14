// Pedir permisos del dispositivo

import * as Calendar from 'expo-calendar/legacy'; 
import * as Contacts from 'expo-contacts';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Alert, AlertButton, Linking } from 'react-native';

export type Recurso = 'galeria' | 'ubicacion' | 'contactos' | 'calendario';

// Loque devuelven todas las funciones de pernisos
type RespuestaPermiso = { status: string; canAskAgain: boolean };

const PERMISOS: Record<
  Recurso,
  {
    nombre: string;
    paraQue: string;
    consultar: () => Promise<RespuestaPermiso>;
    pedir: () => Promise<RespuestaPermiso>;
  }
> = {
  galeria: {
    nombre: 'tus fotos',
    paraQue: 'adjuntar una imagen a la tarea',
    consultar: ImagePicker.getMediaLibraryPermissionsAsync,
    pedir: ImagePicker.requestMediaLibraryPermissionsAsync,
  },
  ubicacion: {
    nombre: 'tu ubicación',
    paraQue: 'guardar dónde hay que hacer la tarea',
    consultar: Location.getForegroundPermissionsAsync,
    pedir: Location.requestForegroundPermissionsAsync,
  },
  contactos: {
    nombre: 'tus contactos',
    paraQue: 'elegir un responsable',
    consultar: Contacts.getPermissionsAsync,
    pedir: Contacts.requestPermissionsAsync,
  },
  calendario: {
    nombre: 'tu calendario',
    paraQue: 'agendar la tarea',
    consultar: Calendar.getCalendarPermissionsAsync,
    pedir: Calendar.requestCalendarPermissionsAsync,
  },
};


export async function pedirPermiso(recurso: Recurso): Promise<boolean> {
  const p = PERMISOS[recurso];

  // Verifica estado actual..
  let respuesta = await p.consultar();
  if (respuesta.status === 'granted') return true; // concedido

  // Pendieente (nunca se pidio) o denegado 
  if (respuesta.status === 'undetermined' || respuesta.canAskAgain) {
    respuesta = await p.pedir();
    if (respuesta.status === 'granted') return true;
  }

  avisarRechazo(p.nombre, p.paraQue, respuesta.canAskAgain);
  return false;
}

// Mensaje cuando el permiso se rechaza
export function avisarRechazo(nombre: string, paraQue: string, puedePreguntar: boolean) {
  const botones: AlertButton[] = [{ text: 'Entendido', style: 'cancel' }];
  if (!puedePreguntar) {
    // Bloqueado: la app ya no puede mostrar el cartel del sistema
    botones.push({ text: 'Abrir ajustes', onPress: () => Linking.openSettings() });
  }
  Alert.alert(
    'Permiso rechazado',
    `Sin acceso a ${nombre} no se puede ${paraQue}. ` +
      (puedePreguntar
        ? 'Te lo vamos a volver a pedir la proxima vez.'
        : 'Si cambias de idea, habilitalo desde los ajustes del telefono.'),
    botones
  );
}