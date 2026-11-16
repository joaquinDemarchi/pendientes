// Crear un evento en el calendario del teléfono para una tarea..
import * as Calendar from 'expo-calendar/legacy'; 
import { Alert, Platform } from 'react-native';
import { textoUbicacion } from '../location/location';
import { pedirPermiso } from '../permissions/permissions';
import { Task } from '../types';

const MEDIA_HORA = 30 * 60 * 1000; // en milisegundos
const UNA_HORA = 60 * 60 * 1000;

// Un calendario donde se pueda escribir. Si no hay ninguno, crea uno local llamado "Pendientes".
async function calendarioDestino(): Promise<string> {
  if (Platform.OS === 'ios') {
    const porDefecto = await Calendar.getDefaultCalendarAsync(); // solo existe en iOS
    return porDefecto.id;
  }
  //el principal de la cuenta (Google) si se puede editar; si no, cualquiera editable
  const calendarios = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const editables = calendarios.filter((c) => c.allowsModifications);
  const elegido = editables.find((c) => c.isPrimary) ?? editables[0];
  if (elegido) return elegido.id;

  return Calendar.createCalendarAsync({
    title: 'Pendientes',
    name: 'pendientes',
    color: '#4B3F72', 
    entityType: Calendar.EntityTypes.EVENT,
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
    ownerAccount: 'personal',
    source: { isLocalAccount: true, name: 'Pendientes', type: 'LOCAL' },
  });
}

// Devuelve el id del evento creado, o null si no hubo permiso o fallo
export async function agendarTarea(task: Task): Promise<string | null> {
  if (!(await pedirPermiso('calendario'))) return null;

  try {
    const inicio = new Date(task.remindAt ?? Date.now() + UNA_HORA);
    const fin = new Date(inicio.getTime() + MEDIA_HORA);
    const calendarId = await calendarioDestino();

    return await Calendar.createEventAsync(calendarId, {
      title: task.title,
      startDate: inicio,
      endDate: fin,
      location: task.location ? textoUbicacion(task.location) : undefined,
      notes: task.contact ? `Responsable: ${task.contact.name}` : 'Creada desde Pendientes',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  } catch (e) {
    console.warn('[Calendario] No se pudo crear el evento:', e);
    Alert.alert('Calendario', 'No pudimos agendar la tarea. Probá de nuevo más tarde.');
    return null;
  }
}