
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/models/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  setRole: (role: User["role"]) => void; // NUEVO
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

  // Mock user for demo purposes
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setUser({
        id: '1',
        email: 'usuario@empresa.com',
        name: 'María García',
        role: 'empleado',
        team_id: 'team-1',
        vacation_days_balance: 23,
        sick_days_balance: 5,
        created_at: new Date().toISOString(),
      });
      setLoading(false);
    }, 1000);
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login
    setLoading(true);
    setTimeout(() => {
      setUser({
        id: '1',
        email,
        name: 'María García',
        role: 'empleado',
        team_id: 'team-1',
        vacation_days_balance: 23,
        sick_days_balance: 5,
        created_at: new Date().toISOString(),
      });
      setLoading(false);
    }, 1000);
  };

  const logout = () => {
    setUser(null);
  };

  // NUEVO: cambiar el rol
  const setRole = (role: User['role']) => {
    setUser((prev) =>
      prev
        ? {
            ...prev,
            role,
            // Mock para RRHH/admin, poner saldo alto
            vacation_days_balance: role === "rrhh" ? 99 : prev.vacation_days_balance,
            sick_days_balance: role === "rrhh" ? 99 : prev.sick_days_balance,
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
    setRole, // añadir al contexto
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

