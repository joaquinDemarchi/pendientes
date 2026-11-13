// Sesion del usuario con Zustand. Reemplaza al AuthContext 
import { create } from 'zustand';
import { buscarUsuariosAS, guardarUsuariosAS } from '../storage/storage';

//Forma del store
interface AuthStore {
  user: string | null;
  register: (username: string, password: string) => Promise<string | null>;
  login: (username: string, password: string) => Promise<string | null>;
  logout: () => void;
}

//Crea el store. register y login devuelven un mensaje de error, o null esta todook
export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,

  register: async (username, password) => {
    const name = username.trim();
    if (await buscarUsuariosAS(name)) return 'Ese usuario ya existe';
    await guardarUsuariosAS({ username: name, password });
    set({ user: name }); // al cambiar user, el navegador muestra Home solo
    return null;
  },

  login: async (username, password) => {
    const usrBuscado = await buscarUsuariosAS(username.trim());
    if (!usrBuscado || usrBuscado.password !== password) {
      return 'Usuario o contraseña incorrectos';
    }
    set({ user: usrBuscado.username });
    return null;
  },

  logout: () => set({ user: null }), // el navegador vuelve a Login
}));