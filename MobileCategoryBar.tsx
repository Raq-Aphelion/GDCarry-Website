import { createContext, useCallback, useContext, type ReactNode } from 'react';

export interface ToastInput {
  title: string;
  description?: string;
  variant?: 'gold' | 'cyan';
}

interface ToastContextValue {
  toast: (t: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

/**
 * Notifications are disabled site-wide — the provider stays as a no-op so
 * existing call sites keep working without rendering any popups.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const toast = useCallback((_t: ToastInput) => {}, []);
  return <ToastContext.Provider value={{ toast }}>{children}</ToastContext.Provider>;
}
