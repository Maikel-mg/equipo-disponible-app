
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Briefcase, Shield } from 'lucide-react';

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'empleado' | 'responsable' | 'rrhh';
  team_id?: string;
  vacation_days_balance: number;
  sick_days_balance: number;
  description: string;
}

const mockUsers: MockUser[] = [
  {
    id: '1',
    name: 'María García',
    email: 'maria.garcia@empresa.com',
    role: 'empleado',
    team_id: 'team-1',
    vacation_days_balance: 23,
    sick_days_balance: 5,
    description: 'Empleada del equipo de desarrollo'
  },
  {
    id: '2',
    name: 'Carlos López',
    email: 'carlos.lopez@empresa.com',
    role: 'responsable',
    team_id: 'team-1',
    vacation_days_balance: 20,
    sick_days_balance: 8,
    description: 'Responsable del equipo de desarrollo'
  },
  {
    id: '3',
    name: 'Ana Ruiz',
    email: 'ana.ruiz@empresa.com',
    role: 'rrhh',
    vacation_days_balance: 30,
    sick_days_balance: 15,
    description: 'Responsable de Recursos Humanos'
  }
];

interface LoginScreenProps {
  onLogin: (user: MockUser) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    // Simulate login delay
    setTimeout(() => {
      onLogin(selectedUser);
      setLoading(false);
    }, 1000);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'empleado':
        return <User className="w-5 h-5" />;
      case 'responsable':
        return <Briefcase className="w-5 h-5" />;
      case 'rrhh':
        return <Shield className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'empleado':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'responsable':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'rrhh':
        return 'bg-purple-50 border-purple-200 text-purple-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Sistema de Vacaciones</CardTitle>
          <CardDescription>
            Selecciona un usuario para probar la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {mockUsers.map((user) => (
              <div
                key={user.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedUser?.id === user.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${getRoleColor(user.role)}`}>
                    {getRoleIcon(user.role)}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                    <div className="text-xs text-gray-500 capitalize">{user.description}</div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium capitalize ${getRoleColor(user.role)}`}>
                    {user.role}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedUser && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600 space-y-1">
                <div>Días de vacaciones: <span className="font-semibold">{selectedUser.vacation_days_balance}</span></div>
                <div>Días por enfermedad: <span className="font-semibold">{selectedUser.sick_days_balance}</span></div>
              </div>
            </div>
          )}

          <Button 
            onClick={handleLogin}
            disabled={!selectedUser || loading}
            className="w-full"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>

          <div className="text-center text-xs text-gray-500 mt-4">
            Modo demo - Selecciona cualquier usuario para probar
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
