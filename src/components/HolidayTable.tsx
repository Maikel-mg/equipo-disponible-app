
import React from 'react';
import { formatDate } from '@/lib/utils';
import { Holiday } from '@/models/types';
import { HOLIDAY_TYPES } from '@/config/constants';
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

interface HolidayTableProps {
  holidays: Holiday[];
  onEdit: (holiday: Holiday) => void;
  onDelete: (holidayId: string) => void;
  loading?: boolean;
}

export function HolidayTable({ holidays, onEdit, onDelete, loading }: HolidayTableProps) {
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
          Empieza añadiendo el primer festivo del calendario laboral.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Obligatorio</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedHolidays.map((holiday) => (
            <TableRow key={holiday.id}>
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
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(holiday)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(holiday.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
