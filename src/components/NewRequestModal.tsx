
import React, { useState } from 'react';
import { Calendar, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';
import { useHolidays } from '@/hooks/useHolidays';
import { useCalendarConfig } from '@/hooks/useCalendarConfig';
import { calendarService } from '@/services/calendarService';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/sonner';
import { APP_ERRORS } from '@/config/constants';

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const leaveTypes = [
  { value: 'vacaciones', label: 'Vacaciones' },
  { value: 'enfermedad', label: 'Baja por enfermedad' },
  { value: 'personal', label: 'Asunto personal' },
  { value: 'maternidad', label: 'Baja por maternidad' },
  { value: 'paternidad', label: 'Baja por paternidad' },
];

export function NewRequestModal({ isOpen, onClose }: NewRequestModalProps) {
  const { user } = useAuth();
  const { createRequest } = useLeaveRequests();
  const { holidays } = useHolidays();
  const currentYear = new Date().getFullYear();
  const { config, specialDays } = useCalendarConfig(currentYear);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    start_date: '',
    end_date: '',
    reason: '',
  });

  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  // Calculate Breakdown
  const dayBreakdown = React.useMemo(() => {
    if (!startDate || !endDate || !formData.type) return null;
    // Solo calculamos desglose detallado para vacaciones
    if (formData.type !== 'vacaciones') return null;

    return calendarService.calculateDayTypeBreakdown(
      startDate,
      endDate,
      holidays,
      config,
      specialDays
    );
  }, [startDate, endDate, formData.type, holidays, config, specialDays]);

  // Calculate Validation Errors
  const validationError = React.useMemo(() => {
    if (!user || !startDate || !endDate || !formData.type) return null;

    if (formData.type === 'personal') {
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (days > (user.personal_days_balance || 0)) {
        return 'Saldo de Asuntos Propios insuficiente';
      }
    }

    if (formData.type === 'vacaciones' && dayBreakdown) {
      const totalAvailable = user.vacation_days_balance || 0;
      const totalConsumed = (user.vacation_full_consumed || 0) + (user.vacation_intensive_consumed || 0);
      
      if (totalConsumed + dayBreakdown.total_workdays > totalAvailable) {
        return 'Saldo de Vacaciones totales insuficiente';
      }

      const maxFullDays = totalAvailable - 17;
      const currentFullConsumed = user.vacation_full_consumed || 0;
      if (currentFullConsumed + dayBreakdown.WORKDAY_FULL > maxFullDays) {
        return `Has excedido el límite de días en Jornada Completa (${maxFullDays} días máx.)`;
      }
    }

    return null;
  }, [user, startDate, endDate, formData.type, dayBreakdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !startDate || !endDate || validationError) return;

    if (endDate < startDate) {
      toast.error('La fecha de fin no puede ser anterior a la fecha de inicio');
      return;
    }

    try {
      setLoading(true);
      
      const daysDifference = formData.type === 'vacaciones' && dayBreakdown 
        ? dayBreakdown.total_workdays 
        : Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      await createRequest({
        user_id: user.id,
        user_name: user.name,
        type: formData.type as any,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        days_count: daysDifference,
        reason: formData.reason,
      });

      toast.success('Solicitud creada correctamente');
      onClose();
      
      // Reset form
      setFormData({ type: '', start_date: '', end_date: '', reason: '' });
      setStartDate(undefined);
      setEndDate(undefined);
    } catch (error: any) {
      if (error.message === APP_ERRORS.OVERLAPPING_REQUEST) {
        toast.error('Ya existe una solicitud para este rango de fechas. Por favor, verifica tu calendario.');
      } else if (error.message === 'EXCEEDED_FULL_WORKDAY_LIMIT') {
        toast.error('Has excedido el límite de días en Jornada Completa permitido por convenio.');
      } else {
        toast.error('Error al crear la solicitud');
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nueva Solicitud de Ausencia</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de solicitud</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha de inicio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? formatDate(startDate.toISOString()) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Fecha de fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {endDate ? formatDate(endDate.toISOString()) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => 
                      date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                      (startDate && date < startDate)
                    }
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo (opcional)</Label>
            <Textarea
              id="reason"
              placeholder="Describe el motivo de tu solicitud..."
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Breakdown Summary */}
          {dayBreakdown && (
            <div className="bg-blue-50 border border-blue-100 rounded-md p-4 text-sm space-y-2">
              <div className="flex justify-between font-semibold text-blue-900">
                <span>Total días a descontar:</span>
                <span>{dayBreakdown.total_workdays} días</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-blue-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Completa: {dayBreakdown.WORKDAY_FULL}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span>Intensiva: {dayBreakdown.WORKDAY_INTENSIVE}</span>
                </div>
              </div>
              <div className="text-xs text-blue-600 pt-2 border-t border-blue-200 mt-2">
                * Festivos ({dayBreakdown.HOLIDAY}) y fines de semana ({dayBreakdown.WEEKEND}) no consumen saldo.
              </div>
            </div>
          )}

          {/* Validation Error Message */}
          {validationError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm font-medium">
              {validationError}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.type || !startDate || !endDate || !!validationError}
            >
              {loading ? 'Creando...' : 'Crear Solicitud'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
