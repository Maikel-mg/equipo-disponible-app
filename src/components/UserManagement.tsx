
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
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface UserFormData {
  name: string;
  email: string;
  role: User['role'];
  team_id?: string;
  vacation_days_balance: number;
  sick_days_balance: number;
}

function UserForm({ 
  onSubmit, 
  onClose, 
  teams, 
  initialData 
}: { 
  onSubmit: (data: UserFormData) => void;
  onClose: () => void;
  teams: Team[];
  initialData?: User;
}) {
  const [form, setForm] = useState<UserFormData>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    role: initialData?.role || 'empleado',
    team_id: initialData?.team_id || 'no-team',
    vacation_days_balance: initialData?.vacation_days_balance || 22,
    sick_days_balance: initialData?.sick_days_balance || 3,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...form,
      team_id: form.team_id === 'no-team' ? undefined : form.team_id
    };
    onSubmit(submitData);
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{initialData ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
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
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            {initialData ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

export function UserManagement() {
  const { user } = useAuth();
  const { users, teams, loading, updateUser, deleteUser } = useUsers();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

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

  const handleUpdateUser = async (data: UserFormData) => {
    if (editingUser) {
      await updateUser(editingUser.id, data);
      setEditingUser(null);
      setDialogOpen(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      await deleteUser(userId);
    }
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
          <p className="text-sm text-blue-600 mt-1">
            Nota: Los usuarios se crean mediante el proceso de registro
          </p>
        </div>
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
                    <Dialog open={dialogOpen && editingUser?.id === userItem.id} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingUser(userItem);
                            setDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <UserForm
                        onSubmit={handleUpdateUser}
                        onClose={() => setDialogOpen(false)}
                        teams={teams}
                        initialData={editingUser || undefined}
                      />
                    </Dialog>
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
    </div>
  );
}
