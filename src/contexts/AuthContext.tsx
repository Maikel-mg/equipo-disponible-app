
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/models/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: any) => void;
  logout: () => void;
  isAuthenticated: boolean;
  setRole: (role: User["role"]) => void;
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

  const login = (userData: any) => {
    setUser({
      ...userData,
      created_at: new Date().toISOString(),
    });
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

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    setRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
