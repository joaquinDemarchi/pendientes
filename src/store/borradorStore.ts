// Borrador de la tarea que se esta cargangdo
import { create } from 'zustand';
import { Task, TaskContact, TaskLocation } from '../types';

interface BorradorStore {
  photoUri: string | null;
  location: TaskLocation | null;
  contact: TaskContact | null;
  iniciar: (task?: Task) => void; // al abrir el formulario
  setPhoto: (uri: string | null) => void;
  setLocation: (loc: TaskLocation | null) => void;
  setContact: (c: TaskContact | null) => void;
}

export const useBorradorStore = create<BorradorStore>()((set) => ({
  photoUri: null,
  location: null,
  contact: null,
  // Alta: todo vacioo.peor si ests editando arranca con lo que ya tenia la tarea
  iniciar: (task) =>
    set({
      photoUri: task?.photoUri ?? null,
      location: task?.location ?? null,
      contact: task?.contact ?? null,
    }),
  setPhoto: (uri) => set({ photoUri: uri }),
  setLocation: (loc) => set({ location: loc }),
  setContact: (c) => set({ contact: c }),
}));