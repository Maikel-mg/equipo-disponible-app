import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/models/types';
import { mockUsers } from '@/data/mockData';

// Usamos los usuarios del mock centralizado
export const MOCK_USERS: User[] = mockUsers;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  setRole: (role: User["role"]) => void;
  updateAuthUser: (data: Partial<User>) => void;
  mockUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const setRole = (role: User['role']) => {
    setUser((prev) =>
      prev
        ? {
            ...prev,
            role,
            vacation_days_balance: role === "rrhh" ? 30 : prev.vacation_days_balance,
            sick_days_balance: role === "rrhh" ? 15 : prev.sick_days_balance,
          }
        : null
    );
  };

  const updateAuthUser = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    setRole,
    updateAuthUser,
    mockUsers: MOCK_USERS,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
