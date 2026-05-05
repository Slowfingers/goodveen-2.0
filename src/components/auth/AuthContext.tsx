import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi } from '../../lib/api';
import { getToken, setToken, ApiError } from '../../lib/api/client';
import type { User } from '../../lib/api/types';

export type AuthMode = 'login' | 'register' | 'password-reset';

// ========== AUTH UI CONTEXT ==========
interface AuthUI {
  mode: AuthMode | null;
  open: (mode?: AuthMode) => void;
  close: () => void;
  setMode: (mode: AuthMode) => void;
}

const AuthUIContext = createContext<AuthUI | null>(null);

export function AuthUIProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AuthMode | null>(null);
  const open = useCallback((m: AuthMode = 'login') => setModeState(m), []);
  const close = useCallback(() => setModeState(null), []);
  const setMode = useCallback((m: AuthMode) => setModeState(m), []);

  // Lock body scroll while open
  useEffect(() => {
    if (!mode) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mode]);

  // Close on Escape
  useEffect(() => {
    if (!mode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, close]);

  return (
    <AuthUIContext.Provider value={{ mode, open, close, setMode }}>{children}</AuthUIContext.Provider>
  );
}

export function useAuthUI() {
  const ctx = useContext(AuthUIContext);
  if (!ctx) throw new Error('useAuthUI must be used within AuthUIProvider');
  return ctx;
}

// ========== USER AUTH CONTEXT ==========
interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getToken();
    console.log('AuthContext refresh - token:', token ? 'exists' : 'null');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { user: userData } = await authApi.me();
      console.log('AuthContext refresh - user loaded:', userData);
      setUser(userData);
    } catch (err) {
      console.log('AuthContext refresh - error:', err);
      if (err instanceof ApiError && (err.status === 401 || err.status === 404)) {
        setToken(null);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signIn = useCallback(async (email: string, password: string) => {
    console.log('AuthContext signIn - email:', email);
    const { token, user: userData } = await authApi.login(email, password);
    console.log('AuthContext signIn - token received, user:', userData);
    setToken(token);
    setUser(userData);
    console.log('AuthContext signIn - state updated');
  }, []);

  const signOut = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value: AuthState = {
    user,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
