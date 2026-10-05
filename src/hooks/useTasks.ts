


import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { cancelReminder, scheduleTaskReminder } from '../notifications/notifications';
import { traerTareas, guardarTareas } from '../storage/storage';
import { Task } from '../types';

export function useTasks() {
  const { user } = useAuth();
  const username = user ?? '';
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Leer de AsyncStorage → estado
  const reload = useCallback(async () => {
    try {
      const stored = await traerTareas(username);
      setTasks(stored);
    } catch (e) {
      console.error('Error al cargar tareas:', e);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Guardar en AsyncStorage + actualizar el estado
  const guardarEnAS = async (updated: Task[]) => {
    await guardarTareas(username, updated);
    setTasks(updated);
  };

 
  const addTask = async (title: string, reminderSeconds: number) => {
    let notificationId: string | null = null;
    if (reminderSeconds > 0) {
      notificationId = await scheduleTaskReminder(title.trim(), reminderSeconds);
    }
    const newTask: Task = {
      id: Date.now().toString(),
      title: title.trim(),
      done: false,
      remindAt: notificationId ? Date.now() + reminderSeconds * 1000 : null,
      notificationId,
      createdAt: Date.now(),
    };
    const current = await traerTareas(username);
    await guardarEnAS([newTask, ...current]);
  };


  const updateTask = async (id: string, title: string, reminderSeconds: number) => {
    const tareasActuales = await traerTareas(username);
    const tareaAEditar = tareasActuales.find((t) => t.id === id);
    if (!tareaAEditar) return;

    await cancelReminder(tareaAEditar.notificationId);
    let notificationId: string | null = null;
    if (reminderSeconds > 0) {
      notificationId = await scheduleTaskReminder(title.trim(), reminderSeconds);
    }
    const remindAt = notificationId ? Date.now() + reminderSeconds * 1000 : null;
    const updated = tareasActuales.map((t) =>
      t.id === id ? { ...t, title: title.trim(), remindAt, notificationId } : t
    );
    await guardarEnAS(updated);
  };

  // MARCAR HECHA / PENDIENTE
  const toggleTask = async (id: string) => {
    const current = await traerTareas(username);
    const updated: Task[] = [];
    for (const t of current) {
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
  };

  // BAJA 
  const deleteTask = async (id: string) => {
    const current = await traerTareas(username);
    const task = current.find((t) => t.id === id);
    if (task) await cancelReminder(task.notificationId);
    await guardarEnAS(current.filter((t) => t.id !== id));
  };

  return { tasks, loading, reload, addTask, updateTask, toggleTask, deleteTask };
}