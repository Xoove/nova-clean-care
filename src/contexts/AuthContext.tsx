import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { User } from '@/lib/types';
import { getCurrentUser, setCurrentUser, MOCK_USERS } from '@/lib/store';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, login: () => {}, logout: () => {} });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(getCurrentUser);

  const login = (u: User) => { setCurrentUser(u); setUser(u); };
  const logout = () => { setCurrentUser(null); setUser(null); };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export { MOCK_USERS };

// Permission helpers — единая точка контроля доступа.
export type Permission =
  | 'orders.write' | 'orders.advance'
  | 'clients.write'
  | 'payments.write'
  | 'delivery.write'
  | 'operations.write'
  | 'defects.write'
  | 'notifications.write'
  | 'reports.view'
  | 'employees.view'
  | 'directories.view' | 'directories.write'
  | 'settings.view';

const PERMS: Record<string, Permission[]> = {
  admin: [
    'orders.write','orders.advance','clients.write','payments.write','delivery.write',
    'operations.write','defects.write','notifications.write','reports.view',
    'employees.view','directories.view','directories.write','settings.view',
  ],
  production: [
    'orders.advance','operations.write','defects.write','reports.view',
    'employees.view','directories.view',
  ],
};

export const can = (user: User | null, perm: Permission): boolean => {
  if (!user) return false;
  return PERMS[user.role]?.includes(perm) ?? false;
};
