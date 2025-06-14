
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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

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

export function AppSidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role || 'empleado')
  );

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center space-x-3 p-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">GestorRH</h1>
            <p className="text-xs text-gray-500">Gestión de Bajas</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.href}>
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center space-x-3 p-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {user?.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
