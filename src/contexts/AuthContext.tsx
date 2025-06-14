
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/models/types';

// Usuarios de ejemplo para demo
export const MOCK_USERS: User[] = [
  {
    id: "1",
    email: "maria.garcia@email.com",
    name: "María García",
    role: "empleado",
    vacation_days_balance: 12,
    sick_days_balance: 3,
    created_at: "2024-06-01T09:00:00Z",
  },
  {
    id: "2",
    email: "carlos.lopez@email.com",
    name: "Carlos López",
    role: "responsable",
    vacation_days_balance: 20,
    sick_days_balance: 5,
    created_at: "2024-05-21T13:00:00Z",
  },
  {
    id: "3",
    email: "ana.ruiz@email.com",
    name: "Ana Ruiz",
    role: "rrhh",
    vacation_days_balance: 30,
    sick_days_balance: 15,
    created_at: "2024-03-08T07:00:00Z",
  },
];

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  setRole: (role: User["role"]) => void;
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

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    setRole,
    mockUsers: MOCK_USERS,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
