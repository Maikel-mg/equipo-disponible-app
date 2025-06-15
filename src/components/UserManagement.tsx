import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import { User, Team } from '@/models/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Trash2, Users, UserPlus } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { CreateUserForm } from './CreateUserForm';

interface UserFormData {
  name: string;
  email: string;
  role: User['role'];
  team_id?: string;
  vacation_days_balance: number;
  sick_days_balance: number;
}

function UserEditForm({ 
  onSubmit, 
  onClose, 
  teams, 
  initialData 
}: { 
  onSubmit: (data: UserFormData) => Promise<void>;
  onClose: () => void;
  teams: Team[];
  initialData: User;
}) {
  const [form, setForm] = useState<UserFormData>({
    name: initialData.name,
    email: initialData.email,
    role: initialData.role,
    team_id: initialData.team_id || 'no-team',
    vacation_days_balance: initialData.vacation_days_balance,
    sick_days_balance: initialData.sick_days_balance,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log('UserEditForm rendered with data:', { initialData, form });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', form);
    
    setIsSubmitting(true);
    try {
      const submitData = {
        name: form.name,
        email: form.email,
        role: form.role,
        team_id: form.team_id === 'no-team' ? undefined : form.team_id,
        vacation_days_balance: form.vacation_days_balance,
        sick_days_balance: form.sick_days_balance,
      };
      console.log('Calling onSubmit with:', submitData);
      await onSubmit(submitData);
      console.log('onSubmit completed successfully');
      onClose(); // Cerrar el diálogo después del éxito
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Editar Usuario</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="role">Rol</Label>
          <Select value={form.role} onValueChange={(value: User['role']) => setForm(prev => ({ ...prev, role: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="empleado">Empleado</SelectItem>
              <SelectItem value="responsable">Responsable</SelectItem>
              <SelectItem value="rrhh">Recursos Humanos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="team">Equipo</Label>
          <Select value={form.team_id} onValueChange={(value) => setForm(prev => ({ ...prev, team_id: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar equipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-team">Sin equipo</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="vacation_days">Días de Vacaciones</Label>
            <Input
              id="vacation_days"
              type="number"
              value={form.vacation_days_balance}
              onChange={(e) => setForm(prev => ({ ...prev, vacation_days_balance: parseInt(e.target.value) }))}
              min="0"
              required
            />
          </div>
          <div>
            <Label htmlFor="sick_days">Días de Enfermedad</Label>
            <Input
              id="sick_days"
              type="number"
              value={form.sick_days_balance}
              onChange={(e) => setForm(prev => ({ ...prev, sick_days_balance: parseInt(e.target.value) }))}
              min="0"
              required
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
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

  const getTeamName = (teamId?: string) => {
    const team = teams.find(t => t.id === teamId);
    return team?.name || 'Sin equipo';
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Equipo</TableHead>
              <TableHead>Días Vacaciones</TableHead>
              <TableHead>Días Enfermedad</TableHead>
              <TableHead>Fecha Creación</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((userItem) => (
              <TableRow key={userItem.id}>
                <TableCell className="font-medium">{userItem.name}</TableCell>
                <TableCell>{userItem.email}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${userItem.role === 'rrhh' ? 'bg-purple-100 text-purple-800' : ''}
                    ${userItem.role === 'responsable' ? 'bg-blue-100 text-blue-800' : ''}
                    ${userItem.role === 'empleado' ? 'bg-green-100 text-green-800' : ''}
                  `}>
                    {userItem.role}
                  </span>
                </TableCell>
                <TableCell>{getTeamName(userItem.team_id)}</TableCell>
                <TableCell>{userItem.vacation_days_balance}</TableCell>
                <TableCell>{userItem.sick_days_balance}</TableCell>
                <TableCell>{formatDate(userItem.created_at, 'dd/MM/yyyy')}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(userItem)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(userItem.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {users.length === 0 && !loading && (
          <div className="p-6 text-center text-gray-500">
            No hay usuarios registrados
          </div>
        )}
      </div>

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
