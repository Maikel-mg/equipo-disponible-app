
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Bell, Search, LogOut, User, Briefcase, Shield } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function Header() {
  const { user, logout } = useAuth();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'empleado':
        return <User className="w-4 h-4" />;
      case 'responsable':
        return <Briefcase className="w-4 h-4" />;
      case 'rrhh':
        return <Shield className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'empleado':
        return 'text-blue-600';
      case 'responsable':
        return 'text-green-600';
      case 'rrhh':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Bienvenido, {user?.name}
            </h2>
            <div className="flex items-center space-x-2">
              <span className={`flex items-center space-x-1 text-sm font-medium capitalize ${getRoleColor(user?.role || '')}`}>
                {getRoleIcon(user?.role || '')}
                <span>{user?.role}</span>
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-gray-500">{user?.email}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Search className="w-5 h-5" />
          </Button>
          
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon"
            onClick={logout}
            className="text-gray-500 hover:text-gray-700"
            title="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
