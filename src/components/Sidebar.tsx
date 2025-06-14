
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { 
  Calendar, 
  FileText, 
  BarChart3, 
  Settings, 
  Users,
  Home,
  UserCog,
  UsersIcon
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home, roles: ['empleado', 'responsable', 'rrhh'] },
  { name: 'Mis Solicitudes', href: '/requests', icon: FileText, roles: ['empleado', 'responsable', 'rrhh'] },
  { name: 'Calendario', href: '/calendar', icon: Calendar, roles: ['empleado', 'responsable', 'rrhh'] },
  { name: 'Equipo', href: '/team', icon: Users, roles: ['responsable', 'rrhh'] },
  { name: 'Usuarios', href: '/users', icon: UserCog, roles: ['rrhh'] },
  { name: 'Equipos', href: '/teams', icon: UsersIcon, roles: ['rrhh'] },
  { name: 'Reportes', href: '/reports', icon: BarChart3, roles: ['rrhh'] },
  { name: 'Configuración', href: '/settings', icon: Settings, roles: ['rrhh'] },
];

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role || 'empleado')
  );

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">GestorRH</h1>
            <p className="text-xs text-gray-500">Gestión de Bajas</p>
          </div>
        </div>
      </div>

      <nav className="px-4 space-y-1">
        {filteredNavigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'group flex items-center px-2 py-2.5 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 transition-colors',
                  isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {user?.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
