
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import { Team, User } from '@/models/types';
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
import { Plus, Edit, Trash2, Users, Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface TeamFormData {
  name: string;
  manager_id: string | null;
}

function TeamForm({ 
  onSubmit, 
  onClose, 
  users, 
  initialData 
}: { 
  onSubmit: (data: TeamFormData) => void;
  onClose: () => void;
  users: User[];
  initialData?: Team;
}) {
  const [form, setForm] = useState<TeamFormData>({
    name: initialData?.name || '',
    manager_id: initialData?.manager_id || null,
  });

  useEffect(() => {
    // This effect ensures the form is populated with the correct data for editing,
    // and resets when creating a new team.
    setForm({
      name: initialData?.name || '',
      manager_id: initialData?.manager_id || null,
    });
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  // Filtrar usuarios que pueden ser responsables
  const responsables = users.filter(user => user.role === 'responsable' || user.role === 'rrhh');

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{initialData ? 'Editar Equipo' : 'Nuevo Equipo'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre del Equipo</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="manager">Responsable</Label>
          <Select value={form.manager_id || 'no-manager'} onValueChange={(value) => setForm(prev => ({ ...prev, manager_id: value === 'no-manager' ? null : value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar responsable" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-manager">Sin responsable</SelectItem>
              {responsables.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

export function TeamManagement() {
  const { user } = useAuth();
  const { users, teams, loading, createTeam, updateTeam, deleteTeam } = useUsers();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  // Solo RRHH puede gestionar equipos
  if (user?.role !== 'rrhh') {
    return (
      <div className="p-8 text-center">
        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Acceso Restringido
        </h3>
        <p className="text-gray-500">
          Solo el personal de Recursos Humanos puede gestionar equipos.
        </p>
      </div>
    );
  }

  const handleCreateTeam = async (data: TeamFormData) => {
    try {
      await createTeam(data);
      setDialogOpen(false);
      setEditingTeam(null);
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const handleUpdateTeam = async (data: TeamFormData) => {
    if (editingTeam) {
      try {
        await updateTeam(editingTeam.id, data);
        setEditingTeam(null);
        setDialogOpen(false);
      } catch (error) {
        console.error('Error updating team:', error);
      }
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este equipo? Los usuarios asignados perderán su asignación de equipo.')) {
      try {
        await deleteTeam(teamId);
      } catch (error) {
        console.error('Error deleting team:', error);
      }
    }
  };

  const handleEditClick = (team: Team) => {
    setEditingTeam(team);
    setDialogOpen(true);
  };

  const handleCreateClick = () => {
    setEditingTeam(null);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingTeam(null);
    }
  };

  const getManagerName = (managerId: string) => {
    const manager = users.find(u => u.id === managerId);
    return manager?.name || 'No asignado';
  };

  const getTeamMembersCount = (teamId: string) => {
    return users.filter(u => u.team_id === teamId).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Equipos</h2>
          <p className="text-gray-600">Administra los equipos y sus responsables</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateClick}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Equipo
            </Button>
          </DialogTrigger>
          <TeamForm
            onSubmit={editingTeam ? handleUpdateTeam : handleCreateTeam}
            onClose={() => handleDialogClose(false)}
            users={users}
            initialData={editingTeam || undefined}
          />
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre del Equipo</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Miembros</TableHead>
              <TableHead>Fecha Creación</TableHead>
              <TableHead className="w-[150px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.id}>
                <TableCell className="font-medium">{team.name}</TableCell>
                <TableCell>{getManagerName(team.manager_id)}</TableCell>
                <TableCell>{getTeamMembersCount(team.id)}</TableCell>
                <TableCell>{formatDate(team.created_at, 'dd/MM/yyyy')}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Link to={`/teams/${team.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(team)}
                      title="Editar equipo"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTeam(team.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Eliminar equipo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {teams.length === 0 && !loading && (
          <div className="p-6 text-center text-gray-500">
            No hay equipos registrados
          </div>
        )}
      </div>
    </div>
  );
}
