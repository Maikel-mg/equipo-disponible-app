
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, Eye, EyeOff } from 'lucide-react';

interface CalendarFiltersProps {
  filters: {
    holidays: boolean;
    vacations: boolean;
    sickness: boolean;
    personal: boolean;
    maternity: boolean;
    paternity: boolean;
  };
  onFilterChange: (filterName: string, value: boolean) => void;
  onResetFilters: () => void;
}

export function CalendarFilters({ filters, onFilterChange, onResetFilters }: CalendarFiltersProps) {
  const filterOptions = [
    { key: 'holidays', label: 'Festivos', color: 'bg-blue-100 text-blue-800' },
    { key: 'vacations', label: 'Vacaciones', color: 'bg-green-100 text-green-800' },
    { key: 'sickness', label: 'Enfermedad', color: 'bg-red-100 text-red-800' },
    { key: 'personal', label: 'Personal', color: 'bg-purple-100 text-purple-800' },
    { key: 'maternity', label: 'Maternidad', color: 'bg-pink-100 text-pink-800' },
    { key: 'paternity', label: 'Paternidad', color: 'bg-indigo-100 text-indigo-800' },
  ];

  const allEnabled = Object.values(filters).every(Boolean);
  const noneEnabled = Object.values(filters).every(f => !f);

  return (
    <Card className="w-full md:w-80">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-sm">
          <Filter className="w-4 h-4" />
          <span>Filtros de Calendario</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              filterOptions.forEach(option => {
                onFilterChange(option.key, true);
              });
            }}
            disabled={allEnabled}
            className="flex-1"
          >
            <Eye className="w-3 h-3 mr-1" />
            Mostrar Todo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            disabled={noneEnabled}
            className="flex-1"
          >
            <EyeOff className="w-3 h-3 mr-1" />
            Ocultar Todo
          </Button>
        </div>
        
        <div className="space-y-2">
          {filterOptions.map(option => (
            <div key={option.key} className="flex items-center space-x-3">
              <Checkbox
                id={option.key}
                checked={filters[option.key as keyof typeof filters]}
                onCheckedChange={(checked) => onFilterChange(option.key, checked as boolean)}
              />
              <label
                htmlFor={option.key}
                className="flex items-center space-x-2 cursor-pointer flex-1"
              >
                <div className={`w-3 h-3 rounded ${option.color.split(' ')[0]}`}></div>
                <span className="text-sm">{option.label}</span>
              </label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
