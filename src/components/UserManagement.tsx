
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import { User, Team } from '@/models/types';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { UserPlus } from 'lucide-react';
import { CreateUserForm } from './CreateUserForm';
import { UserEditForm } from './UserEditForm';
import { UsersTable } from './UsersTable';
import { AccessRestricted } from './AccessRestricted';

interface UserFormData {
  name: string;
  email: string;
  role: User['role'];
  team_id?: string | null;
  vacation_days_balance: number;
  sick_days_balance: number;
}

export function UserManagement() {
  const { user } = useAuth();
  const { users, teams, loading, createUser, updateUser, deleteUser } = useUsers();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  console.log('UserManagement rendered:', { 
    usersCount: users.length, 
    teamsCount: teams.length, 
    loading,
    editingUser: editingUser?.id
  });

  // Solo RRHH puede gestionar usuarios
  if (user?.role !== 'rrhh') {
    return <AccessRestricted />;
  }

  const handleCreateUser = async (data: {
    name: string;
    email: string;
    password: string;
    role: User['role'];
    team_id?: string;
    vacation_days_balance: number;
    sick_days_balance: number;
  }) => {
    console.log('Creating user with data:', data);
    try {
      await createUser(data);
      console.log('User created successfully');
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleUpdateUser = async (data: UserFormData) => {
    console.log('handleUpdateUser called with:', { data, editingUserId: editingUser?.id });
    
    if (!editingUser) {
      console.error('No user selected for editing');
      return;
    }

    try {
      console.log('Calling updateUser API...');
      await updateUser(editingUser.id, data);
      console.log('User updated successfully');
      // No necesitamos cerrar manualmente aquí, lo hace el formulario
    } catch (error) {
      console.error('Error updating user:', error);
      throw error; // Re-lanzar el error para que el formulario lo maneje
    }
  };

  const handleDeleteUser = async (userId: string) => {
    console.log('Attempting to delete user:', userId);
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await deleteUser(userId);
        console.log('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleEditClick = (userItem: User) => {
    console.log('Edit button clicked for user:', userItem.id);
    setEditingUser(userItem);
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    console.log('Closing edit dialog');
    setEditDialogOpen(false);
    setEditingUser(null);
  };

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

      <UsersTable
        users={users}
        teams={teams}
        loading={loading}
        onEditUser={handleEditClick}
        onDeleteUser={handleDeleteUser}
      />

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        {editingUser && (
          <UserEditForm
            onSubmit={handleUpdateUser}
            onClose={handleEditClose}
            teams={teams}
            initialData={editingUser}
          />
        )}
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
