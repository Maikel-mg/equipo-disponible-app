
import React, { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';
import { Holiday } from '@/models/types';
import { HOLIDAY_TYPES } from '@/config/constants';
import { useAuth } from '@/contexts/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2,
  Calendar as CalendarIcon 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from "@/components/ui/checkbox";

interface HolidayTableProps {
  holidays: Holiday[];
  onEdit?: (holiday: Holiday) => void;
  onDelete?: (holidayId: string) => void;
  loading?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  selectedIds?: string[];
  onDeleteSelected?: (selectedIds: string[]) => void;
}

export function HolidayTable({
  holidays,
  onEdit,
  onDelete,
  loading,
  onSelectionChange,
  selectedIds = [],
  onDeleteSelected,
}: HolidayTableProps) {
  const { user } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);

  // Solo permitir gestión a responsables y RRHH
  const canManage = user?.role === 'responsable' || user?.role === 'rrhh';

  useEffect(() => {
    setSelected(selectedIds);
  }, [selectedIds]);

  useEffect(() => {
    if (onSelectionChange && canManage) {
      onSelectionChange(selected);
    }
    // eslint-disable-next-line
  }, [selected]);

  const toggleSelect = (id: string) => {
    if (!canManage) return;
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isAllSelected = holidays.length > 0 && selected.length === holidays.length;
  const toggleSelectAll = () => {
    if (!canManage) return;
    if (isAllSelected) {
      setSelected([]);
    } else {
      setSelected(holidays.map((h) => h.id));
    }
  };

  const getTypeLabel = (type: Holiday['type']) => {
    return HOLIDAY_TYPES.find(t => t.value === type)?.label || type;
  };

  const sortedHolidays = [...holidays].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (holidays.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay festivos configurados
        </h3>
        <p className="text-gray-500">
          {canManage ? 'Empieza añadiendo el primer festivo del calendario laboral.' : 'No hay festivos configurados en el calendario laboral.'}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      {/* Barra de acciones cuando hay seleccionados - solo para gestores */}
      {canManage && (
        <div className={`p-2 border-b bg-slate-50 flex items-center gap-4 ${selected.length > 0 ? '' : 'hidden'}`}>
          <span className="text-sm text-gray-700 font-medium">
            {selected.length} seleccionados
          </span>
          <Button
            variant="destructive"
            size="sm"
            className="flex items-center gap-2"
            type="button"
            onClick={() => {
              if (onDeleteSelected) {
                onDeleteSelected(selected);
              }
            }}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Eliminar seleccionados
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="ml-2"
            type="button"
            onClick={() => setSelected([])}
          >
            Deseleccionar todos
          </Button>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            {canManage && (
              <TableHead className="w-[32px] px-2">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Seleccionar todos"
                />
              </TableHead>
            )}
            <TableHead>Nombre</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Obligatorio</TableHead>
            {canManage && <TableHead className="w-[50px]"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedHolidays.map((holiday) => (
            <TableRow key={holiday.id} className={selected.includes(holiday.id) ? "bg-blue-50" : ""}>
              {canManage && (
                <TableCell className="px-2">
                  <Checkbox
                    checked={selected.includes(holiday.id)}
                    onCheckedChange={() => toggleSelect(holiday.id)}
                    aria-label={`Seleccionar ${holiday.name}`}
                  />
                </TableCell>
              )}
              <TableCell className="font-medium">
                {holiday.name}
              </TableCell>
              <TableCell>
                {formatDate(holiday.date, 'EEEE, dd MMMM yyyy')}
              </TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${holiday.type === 'nacional' ? 'bg-blue-100 text-blue-800' : ''}
                  ${holiday.type === 'autonomico' ? 'bg-green-100 text-green-800' : ''}
                  ${holiday.type === 'local' ? 'bg-orange-100 text-orange-800' : ''}
                  ${holiday.type === 'empresa' ? 'bg-purple-100 text-purple-800' : ''}
                `}>
                  {getTypeLabel(holiday.type)}
                </span>
              </TableCell>
              <TableCell>
                {holiday.is_mandatory ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Sí
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    No
                  </span>
                )}
              </TableCell>
              {canManage && (
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit && onEdit(holiday)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete && onDelete(holiday.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
