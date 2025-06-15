
import React from 'react';
import { User, Team } from '@/models/types';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface UsersTableProps {
  users: User[];
  teams: Team[];
  loading: boolean;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export function UsersTable({ users, teams, loading, onEditUser, onDeleteUser }: UsersTableProps) {
  const getTeamName = (teamId?: string) => {
    const team = teams.find(t => t.id === teamId);
    return team?.name || 'Sin equipo';
  };

  return (
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
                    onClick={() => onEditUser(userItem)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteUser(userItem.id)}
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
  );
}
