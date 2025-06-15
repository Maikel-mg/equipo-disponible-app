
import React, { useState } from 'react';
import { User, Team } from '@/models/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserFormData {
  name: string;
  email: string;
  role: User['role'];
  team_id?: string;
  vacation_days_balance: number;
  sick_days_balance: number;
}

interface UserFormProps {
  onSubmit: (data: UserFormData) => void;
  onClose: () => void;
  teams: Team[];
  initialData?: User;
}

export function UserForm({ onSubmit, onClose, teams, initialData }: UserFormProps) {
  const [form, setForm] = useState<UserFormData>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    role: initialData?.role || 'empleado',
    team_id: initialData?.team_id || 'no-team',
    vacation_days_balance: initialData?.vacation_days_balance || 22,
    sick_days_balance: initialData?.sick_days_balance || 3,
  });

  // Update form when initialData changes
  React.useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        email: initialData.email,
        role: initialData.role,
        team_id: initialData.team_id || 'no-team',
        vacation_days_balance: initialData.vacation_days_balance,
        sick_days_balance: initialData.sick_days_balance,
      });
    }
  }, [initialData]);

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
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            Actualizar
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
