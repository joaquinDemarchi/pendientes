
// Estado de sesión compartido por toda la app.
import React, { createContext, useContext, useState } from 'react';
import { buscarUsuariosAS, guardarUsuariosAS } from '../storage/storage';

type AuthContextType = {
  user: string | null; // nombre del usuario logueado, o null
  register: (username: string, password: string) => Promise<string | null>;
  login: (username: string, password: string) => Promise<string | null>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null);

  // Devuelven un mensaje de error, o null si salió todo bien.
  const register = async (username: string, password: string) => {
    const name = username.trim();
    if (await buscarUsuariosAS(name)) return 'Ese usuario ya existe';
    await guardarUsuariosAS({ username: name, password });
    setUser(name); // al cambiar "user", el navegador muestra Home solo
    return null;
  };

  const login = async (username: string, password: string) => {
    const usrBuscado = await buscarUsuariosAS(username.trim());
    if (!usrBuscado || usrBuscado.password !== password) {
      return 'Usuario o contraseña incorrectos';
    }
    setUser(usrBuscado.username);
    return null;
  };

  const logout = () => {
    setUser(null); // el navegador vuelve a mostrar Login
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto: const { user, logout } = useAuth();
export const useAuth = () => useContext(AuthContext);