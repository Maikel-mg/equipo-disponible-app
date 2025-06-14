
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Check } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Holiday } from '@/models/types';
import { HOLIDAY_TYPES } from '@/config/constants';

interface HolidayFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Holiday, 'id' | 'created_at' | 'created_by'>) => void;
  holiday?: Holiday;
}

interface FormData {
  name: string;
  date: Date;
  type: Holiday['type'];
  is_mandatory: boolean;
}

export function HolidayForm({ isOpen, onClose, onSubmit, holiday }: HolidayFormProps) {
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormData>({
    defaultValues: holiday ? {
      name: holiday.name,
      date: new Date(holiday.date),
      type: holiday.type,
      is_mandatory: holiday.is_mandatory
    } : {
      name: '',
      date: new Date(),
      type: 'nacional',
      is_mandatory: true
    }
  });

  const selectedDate = watch('date');
  const selectedType = watch('type');
  const isMandatory = watch('is_mandatory');

  React.useEffect(() => {
    if (holiday) {
      reset({
        name: holiday.name,
        date: new Date(holiday.date),
        type: holiday.type,
        is_mandatory: holiday.is_mandatory
      });
    } else {
      reset({
        name: '',
        date: new Date(),
        type: 'nacional',
        is_mandatory: true
      });
    }
  }, [holiday, reset]);

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      name: data.name,
      date: format(data.date, 'yyyy-MM-dd'),
      type: data.type,
      is_mandatory: data.is_mandatory
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {holiday ? 'Editar Festivo' : 'Nuevo Festivo'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del festivo</Label>
            <Input
              id="name"
              {...register('name', { required: 'El nombre es obligatorio' })}
              placeholder="Ej: Día del Trabajador"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Fecha</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPP", { locale: es })
                  ) : (
                    <span>Seleccionar fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => setValue('date', date || new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Tipo de festivo</Label>
            <Select
              value={selectedType}
              onValueChange={(value: Holiday['type']) => setValue('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                {HOLIDAY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setValue('is_mandatory', !isMandatory)}
              className={cn(
                "flex items-center space-x-2",
                isMandatory && "bg-blue-50 border-blue-200"
              )}
            >
              <div className={cn(
                "w-4 h-4 border-2 rounded flex items-center justify-center",
                isMandatory ? "border-blue-600 bg-blue-600" : "border-gray-300"
              )}>
                {isMandatory && <Check className="w-3 h-3 text-white" />}
              </div>
              <span>Obligatorio para todos los empleados</span>
            </Button>
          </div>

          <DialogFooter className="flex space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {holiday ? 'Actualizar' : 'Crear'} Festivo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
