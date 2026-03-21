import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
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
