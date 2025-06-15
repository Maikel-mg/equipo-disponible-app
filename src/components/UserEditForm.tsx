
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

interface UserEditFormProps {
  onSubmit: (data: UserFormData) => Promise<void>;
  onClose: () => void;
  teams: Team[];
  initialData: User;
}

export function UserEditForm({ 
  onSubmit, 
  onClose, 
  teams, 
  initialData 
}: UserEditFormProps) {
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
