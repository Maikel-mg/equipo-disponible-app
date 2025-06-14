
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppSidebar } from './AppSidebar';
import { Header } from './Header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { RoleSwitcher } from './RoleSwitcher';
import { LoginScreen } from './LoginScreen';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, mockUsers, login, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Mostrar pantalla de login de demo con selección de usuario
    return <LoginScreen users={mockUsers} onLogin={login} />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col min-h-screen">
            <Header />
            <RoleSwitcher />
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
