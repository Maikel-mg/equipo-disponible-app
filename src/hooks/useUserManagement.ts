
import { useState } from 'react';
import { User } from '@/models/types';
import { useUsers } from '@/hooks/useUsers';

interface UserFormData {
  name: string;
  email: string;
  role: User['role'];
  team_id?: string;
  vacation_days_balance: number;
  sick_days_balance: number;
}

interface CreateUserData extends UserFormData {
  password: string;
}

export function useUserManagement() {
  const { users, teams, loading, createUser, updateUser, deleteUser } = useUsers();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleCreateUser = async (data: CreateUserData) => {
    await createUser(data);
  };

  const handleUpdateUser = async (data: UserFormData) => {
    if (editingUser) {
      await updateUser(editingUser.id, data);
      setEditingUser(null);
      setEditDialogOpen(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    await deleteUser(userId);
  };

  const handleEditClick = (userItem: User) => {
    setEditingUser(userItem);
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditingUser(null);
  };

  return {
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
  };
}
