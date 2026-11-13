// Tareas del usuario logueado con Zustand
import { create } from 'zustand';
import { cancelReminder, scheduleTaskReminder } from '../notifications/notifications';
import { guardarTareas, traerTareas } from '../storage/storage';
import { Task, TaskContact, TaskLocation } from '../types';
import { useAuthStore } from './authStore';

// Lo que manda el formulario al guardar
export interface TaskInput {
  title: string;
  reminderSeconds: number; // 0 = sin aviso
  photoUri: string | null;
  location: TaskLocation | null;
  contact: TaskContact | null;
}

interface TasksStore {
  tasks: Task[];
  loading: boolean;
  loadTasks: () => Promise<void>;
  addTask: (data: TaskInput) => Promise<Task>;
  updateTask: (id: string, data: TaskInput) => Promise<Task | undefined>;
  setCalendarEvent: (id: string, eventId: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  clear: () => void;
}

// Usuario logueado
const usuarioActual = () => useAuthStore.getState().user ?? '';

// Programa el aviso si se eligio
async function programarAviso(title: string, seconds: number) {
  if (seconds <= 0) return { notificationId: null, remindAt: null };
  const notificationId = await scheduleTaskReminder(title, seconds);
  const remindAt = notificationId ? Date.now() + seconds * 1000 : null;
  return { notificationId, remindAt };
}

export const useTasksStore = create<TasksStore>()((set, get) => {
  // Guarda en AsyncStorage y actualiza el estado
  const guardarEnAS = async (updated: Task[]) => {
    await guardarTareas(usuarioActual(), updated);
    set({ tasks: updated });
  };

  return {
    tasks: [],
    loading: true,

    // LISTA
    loadTasks: async () => {
      set({ loading: true });
      try {
        const stored = await traerTareas(usuarioActual());
        set({ tasks: stored });
      } catch (e) {
        console.error('Error al cargar tareas:', e);
      } finally {
        set({ loading: false });
      }
    },

    // ALTA
    addTask: async (data) => {
      const title = data.title.trim();
      const aviso = await programarAviso(title, data.reminderSeconds);
      const nueva: Task = {
        id: Date.now().toString(),
        title,
        done: false,
        remindAt: aviso.remindAt,
        notificationId: aviso.notificationId,
        createdAt: Date.now(),
        photoUri: data.photoUri,
        location: data.location,
        contact: data.contact,
        calendarEventId: null,
      };
      await guardarEnAS([nueva, ...get().tasks]); // las nuevas van arriba
      return nueva;
    },

    // EDICION
    updateTask: async (id, data) => {
      const vieja = get().tasks.find((t) => t.id === id);
      if (!vieja) return undefined;
      await cancelReminder(vieja.notificationId);
      const title = data.title.trim();
      const aviso = await programarAviso(title, data.reminderSeconds);
      const editada: Task = {
        ...vieja, // conserva id, done, createdAt y calendarEventId
        title,
        remindAt: aviso.remindAt,
        notificationId: aviso.notificationId,
        photoUri: data.photoUri,
        location: data.location,
        contact: data.contact,
      };
      await guardarEnAS(get().tasks.map((t) => (t.id === id ? editada : t)));
      return editada;
    },

    // Guarda el id del evento de calendario creado para la tarea 
    setCalendarEvent: async (id, eventId) => {
      await guardarEnAS(
        get().tasks.map((t) => (t.id === id ? { ...t, calendarEventId: eventId } : t))
      );
    },

    // MARCAR HECHA / PENDIENTE. Si se completa, el aviso se cancela 
    toggleTask: async (id) => {
      const updated: Task[] = [];
      for (const t of get().tasks) {
        if (t.id !== id) {
          updated.push(t);
        } else if (!t.done) {
          await cancelReminder(t.notificationId);
          updated.push({ ...t, done: true, remindAt: null, notificationId: null });
        } else {
          updated.push({ ...t, done: false });
        }
      }
      await guardarEnAS(updated);
    },

    // BAJA
    deleteTask: async (id) => {
      const task = get().tasks.find((t) => t.id === id);
      if (task) await cancelReminder(task.notificationId);
      await guardarEnAS(get().tasks.filter((t) => t.id !== id));
    },

    // Al cerra sesion: que el prox us no vea las tareas del anterior ni por un instante
    clear: () => set({ tasks: [], loading: true }),
  };
});