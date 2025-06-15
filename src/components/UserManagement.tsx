
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserManagement } from '@/hooks/useUserManagement';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Users, UserPlus } from 'lucide-react';
import { UserForm } from './UserForm';
import { UserTable } from './UserTable';
import { CreateUserForm } from './CreateUserForm';

export function UserManagement() {
  const { user } = useAuth();
  const {
    users,
    teams,
    loading,
    editDialogOpen,
    createDialogOpen,
    editingUser,
    setCreateDialogOpen,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    handleEditClick,
    handleEditClose,
  } = useUserManagement();

  // Solo RRHH puede gestionar usuarios
  if (user?.role !== 'rrhh') {
    return (
      <div className="p-8 text-center">
        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Acceso Restringido
        </h3>
        <p className="text-gray-500">
          Solo el personal de Recursos Humanos puede gestionar usuarios.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
          <p className="text-gray-600">Administra los usuarios y sus equipos</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Crear Usuario
        </Button>
      </div>

      <UserTable
        users={users}
        teams={teams}
        loading={loading}
        onEditUser={handleEditClick}
        onDeleteUser={handleDeleteUser}
      />

      <Dialog open={editDialogOpen} onOpenChange={handleEditClose}>
        <UserForm
          onSubmit={handleUpdateUser}
          onClose={handleEditClose}
          teams={teams}
          initialData={editingUser || undefined}
        />
      </Dialog>

      <CreateUserForm
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateUser}
        teams={teams}
      />
    </div>
  );
}
