import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Calendar, Download, Loader2 } from 'lucide-react';
import { Holiday } from '@/models/types';
import { useToast } from '@/hooks/use-toast';

// Import the holidays library using ES6 syntax
import Holidays from 'date-holidays';

interface HolidayImportProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (holidays: Omit<Holiday, 'id' | 'created_at' | 'created_by'>[]) => void;
  existingHolidays: Holiday[];
}

interface ImportableHoliday {
  name: string;
  date: string;
  type: string;
  selected: boolean;
  exists: boolean;
}

const COUNTRY_OPTIONS = [
  { value: 'ES', label: 'España' },
  { value: 'US', label: 'Estados Unidos' },
  { value: 'FR', label: 'Francia' },
  { value: 'DE', label: 'Alemania' },
  { value: 'IT', label: 'Italia' },
  { value: 'PT', label: 'Portugal' },
  { value: 'GB', label: 'Reino Unido' },
  { value: 'MX', label: 'México' },
  { value: 'AR', label: 'Argentina' },
  { value: 'CO', label: 'Colombia' },
];

export function HolidayImport({ isOpen, onClose, onImport, existingHolidays }: HolidayImportProps) {
  const { toast } = useToast();
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [availableHolidays, setAvailableHolidays] = useState<ImportableHoliday[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHolidays = async () => {
    if (!selectedCountry) {
      toast({
        title: "Error",
        description: "Por favor selecciona un país",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const hd = new Holidays(selectedCountry);
      const holidays = hd.getHolidays(parseInt(selectedYear));

      console.log('Raw holidays from library:', holidays);
      console.log('Existing holidays in app:', existingHolidays);

      const importableHolidays: ImportableHoliday[] = holidays.map((holiday: any) => {
        let dateString: string;
        
        if (holiday.date instanceof Date) {
          dateString = holiday.date.toISOString().split('T')[0];
        } else if (typeof holiday.date === 'string') {
          dateString = holiday.date.split('T')[0];
        } else if (holiday.date && typeof holiday.date === 'object') {
          if (holiday.date.year && holiday.date.month && holiday.date.day) {
            const date = new Date(holiday.date.year, holiday.date.month - 1, holiday.date.day);
            dateString = date.toISOString().split('T')[0];
          } else {
            dateString = new Date(holiday.date).toISOString().split('T')[0];
          }
        } else {
          console.warn('Unknown date format:', holiday.date);
          dateString = new Date().toISOString().split('T')[0]; // Fallback to today
        }

        const exists = existingHolidays.some(existing => {
          const dateMatch =
            existing.date === dateString ||
            existing.date === dateString.split(" ")[0] || // por si hay formato con horas
            dateString.startsWith(existing.date);
          const nameMatch = existing.name.trim().toLowerCase() === holiday.name.trim().toLowerCase();

          return dateMatch && nameMatch;
        });

        return {
          name: holiday.name,
          date: dateString,
          type: holiday.type === 'public' ? 'nacional' : 'local',
          selected: !exists,  // Solo marcar seleccionados los NO existentes
          exists,
        };
      });

      console.log('Final importable holidays:', importableHolidays);
      setAvailableHolidays(importableHolidays);
      
      const existingCount = importableHolidays.filter(h => h.exists).length;
      toast({
        title: "Festivos cargados",
        description: `Se encontraron ${importableHolidays.length} festivos para ${selectedYear}${existingCount > 0 ? ` (${existingCount} ya existen)` : ''}`,
      });
    } catch (error) {
      console.error('Error fetching holidays:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los festivos. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleHolidaySelection = (index: number) => {
    setAvailableHolidays(prev => prev.map((holiday, i) => {
      if (i !== index) return holiday;
      if (holiday.exists) return holiday; // Si ya existe, nunca permitir cambiar selected
      return { ...holiday, selected: !holiday.selected };
    }));
  };

  const selectAll = () => {
    setAvailableHolidays(prev =>
      prev.map(holiday => ({
        ...holiday,
        selected: !holiday.exists ? true : false  // desmarcado si existe
      }))
    );
  };

  const selectNone = () => {
    setAvailableHolidays(prev =>
      prev.map(holiday => ({
        ...holiday,
        selected: false
      }))
    );
  };

  const handleImport = () => {
    const selectedHolidays = availableHolidays
      .filter(holiday => holiday.selected && !holiday.exists)
      .map(holiday => ({
        name: holiday.name,
        date: holiday.date,
        type: holiday.type as Holiday['type'],
        is_mandatory: true,
      }));

    if (selectedHolidays.length === 0) {
      toast({
        title: "Error",
        description: "Selecciona al menos un festivo para importar",
        variant: "destructive",
      });
      return;
    }

    onImport(selectedHolidays);
    onClose();
    setAvailableHolidays([]);
    setSelectedCountry('');
  };

  const handleClose = () => {
    onClose();
    setAvailableHolidays([]);
    setSelectedCountry('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Download className="mr-2 h-5 w-5" />
            Importar Festivos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>País</Label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar país" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_OPTIONS.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Año</Label>
              <Input
                id="year"
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                min="2020"
                max="2030"
              />
            </div>
          </div>

          <Button 
            onClick={fetchHolidays} 
            disabled={loading || !selectedCountry}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cargando festivos...
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Buscar Festivos
              </>
            )}
          </Button>

          {availableHolidays.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">
                  Festivos encontrados ({availableHolidays.length})
                </Label>
                <div className="space-x-2">
                  <Button variant="outline" size="sm" onClick={selectAll}>
                    Seleccionar disponibles
                  </Button>
                  <Button variant="outline" size="sm" onClick={selectNone}>
                    Deseleccionar todos
                  </Button>
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto border rounded-lg p-4 space-y-2">
                {availableHolidays.map((holiday, index) => (
                  <div key={index} className={`flex items-center space-x-3 p-2 rounded ${
                    holiday.exists ? 'bg-red-50 border border-red-200' : 'hover:bg-gray-50'
                  }`}>
                    <Checkbox
                      checked={holiday.selected}
                      onCheckedChange={() => toggleHolidaySelection(index)}
                      disabled={holiday.exists}
                    />
                    <div className="flex-1">
                      <div className={`font-medium ${holiday.exists ? 'text-red-600' : ''}`}>
                        {holiday.name}
                        {holiday.exists && <span className="ml-2 text-xs font-bold text-red-500">(YA EXISTE)</span>}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(holiday.date).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${holiday.type === 'nacional' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
                    `}>
                      {holiday.type === 'nacional' ? 'Nacional' : 'Local'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex space-x-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          {availableHolidays.length > 0 && (
            <Button onClick={handleImport}>
              Importar Seleccionados ({availableHolidays.filter(h => h.selected).length})
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
