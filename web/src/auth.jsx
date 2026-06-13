import { createContext, useContext, useEffect, useState } from 'react';
import { api, setToken, getToken } from './api.js';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      setCarregando(false);
      return;
    }
    api('/me')
      .then((d) => setUser(d.user))
      .catch(() => setToken(null))
      .finally(() => setCarregando(false));
  }, []);

  async function entrar(username, password) {
    const d = await api('/login', { method: 'POST', body: { username, password } });
    setToken(d.token);
    setUser(d.user);
  }

  async function cadastrar(username, password) {
    const d = await api('/register', { method: 'POST', body: { username, password } });
    setToken(d.token);
    setUser(d.user);
  }

  function sair() {
    setToken(null);
    setUser(null);
  }

  async function atualizarUser() {
    const d = await api('/me');
    setUser(d.user);
  }

  return (
    <AuthCtx.Provider value={{ user, carregando, entrar, cadastrar, sair, atualizarUser }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
