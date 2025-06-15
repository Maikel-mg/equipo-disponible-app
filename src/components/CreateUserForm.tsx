
import React, { useState } from 'react';
import { User, Team } from '@/models/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
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
import { useToast } from '@/hooks/use-toast';

interface CreateUserFormData {
  name: string;
  email: string;
  password: string;
  role: User['role'];
  team_id?: string;
  vacation_days_balance: number;
  sick_days_balance: number;
}

interface CreateUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserFormData) => Promise<void>;
  teams: Team[];
}

export function CreateUserForm({ isOpen, onClose, onSubmit, teams }: CreateUserFormProps) {
  const { toast } = useToast();
  const [form, setForm] = useState<CreateUserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'empleado',
    team_id: 'no-team',
    vacation_days_balance: 22,
    sick_days_balance: 3,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        ...form,
        team_id: form.team_id === 'no-team' ? undefined : form.team_id
      };
      await onSubmit(submitData);
      toast({
        title: "Usuario creado",
        description: "El usuario se ha creado correctamente.",
      });
      setForm({
        name: '',
        email: '',
        password: '',
        role: 'empleado',
        team_id: 'no-team',
        vacation_days_balance: 22,
        sick_days_balance: 3,
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "No se pudo crear el usuario. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm({
      name: '',
      email: '',
      password: '',
      role: 'empleado',
      team_id: 'no-team',
      vacation_days_balance: 22,
      sick_days_balance: 3,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Usuario</DialogTitle>
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
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Mínimo 6 caracteres"
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
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear Usuario'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
