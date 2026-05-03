import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export type AuthMode = 'login' | 'register' | 'password-reset';

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
