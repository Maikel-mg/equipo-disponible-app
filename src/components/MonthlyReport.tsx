import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';
import { useUsers } from '@/hooks/useUsers';
import { useHolidays } from '@/hooks/useHolidays';
import { useCalendarConfig } from '@/hooks/useCalendarConfig';
import { calendarService } from '@/services/calendarService';
import { formatDate } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Download, FileText } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

export function MonthlyReport() {
  const { user } = useAuth();
  const { requests } = useLeaveRequests();
  const { users } = useUsers();
  const { holidays } = useHolidays();
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const { config, specialDays } = useCalendarConfig(year);

  // Solo mostrar si es responsable o RRHH
  if (!user || (user.role !== 'responsable' && user.role !== 'rrhh')) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">No tienes permisos para ver este informe</p>
      </div>
    );
  }

  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  // Obtener usuarios del equipo si es responsable
  const teamUsers = user.role === 'responsable' 
    ? users.filter(u => u.team_id === user.team_id)
    : users;

  const monthStartStr = `${year}-${(month + 1).toString().padStart(2, '0')}-01`;
  const monthEndStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${daysInMonth.toString().padStart(2, '0')}`;

  // Filtrar solicitudes del mes actual
  const monthRequests = requests.filter(request => {
    return request.start_date <= monthEndStr && request.end_date >= monthStartStr;
  });

  // Función para verificar si un usuario tiene ausencia en un día específico
  const hasLeaveOnDay = (userId: string, day: number) => {
    const targetDateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    return monthRequests.find(request => {
      if (request.user_id !== userId || request.status !== 'aprobada') return false;
      return targetDateStr >= request.start_date && targetDateStr <= request.end_date;
    });
  };

  // Función para obtener el tipo de ausencia y si es jornada intensiva
  const getLeaveDetails = (userId: string, day: number) => {
    const leave = hasLeaveOnDay(userId, day);
    if (!leave) return null;
    
    // Obtener el tipo de jornada para este día específico
    const date = new Date(year, month, day);
    const dayType = calendarService.getDayType(date, holidays, config, specialDays);
    const isIntensive = dayType === 'WORKDAY_INTENSIVE';

    const typeMap: Record<string, string> = {
      'vacaciones': 'V',
      'enfermedad': 'E',
      'personal': 'P',
      'maternidad': 'M',
      'paternidad': 'PT'
    };
    
    return {
      code: typeMap[leave.type] || 'X',
      isIntensive,
      type: leave.type
    };
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getDayOfWeek = (day: number) => {
    // Usar Date.UTC para asegurar que el día de la semana sea correcto independientemente de la hora local
    const date = new Date(Date.UTC(year, month, day));
    const dayOfWeek = date.getUTCDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // 0 = domingo, 6 = sábado
  };
  
  const isHoliday = (day: number) => {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return holidays.some(h => h.date === dateStr);
  };

  const getTotalDaysOff = (userId: string) => {
    let count = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const leave = hasLeaveOnDay(userId, d);
      if (leave) {
        const isWeekend = getDayOfWeek(d);
        const isFestivo = isHoliday(d);
        
        // Si es vacaciones, descontar fines de semana y festivos
        if (!isWeekend && !isFestivo) {
          count++;
        }
      }
    }
    return count;
  };

  // Helper para generar las clases de color
  const getCellStyles = (leaveDetails: { code: string; isIntensive: boolean; type: string } | null, isWeekend: boolean) => {
    if (isWeekend) return 'bg-gray-100 text-gray-400';
    if (!leaveDetails) return 'hover:bg-gray-50';

    const baseStyles = 'font-semibold border';
    
    // Vacaciones: Verde oscuro para completa, verde claro para intensiva
    if (leaveDetails.type === 'vacaciones') {
      return leaveDetails.isIntensive 
        ? `${baseStyles} bg-green-50 text-green-700 border-green-200`
        : `${baseStyles} bg-green-100 text-green-800 border-green-200`;
    }

    // Enfermedad: Rojo
    if (leaveDetails.type === 'enfermedad') {
       return `${baseStyles} bg-red-100 text-red-800 border-red-200`;
    }

    // Personal: Morado
    if (leaveDetails.type === 'personal') {
       return `${baseStyles} bg-purple-100 text-purple-800 border-purple-200`;
    }

    // Maternidad/Paternidad: Rosa/Azul
    if (leaveDetails.type === 'maternidad' || leaveDetails.type === 'paternidad') {
       return `${baseStyles} bg-blue-100 text-blue-800 border-blue-200`;
    }

    return 'bg-gray-50';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Informe Mensual</h2>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateMonth('prev')}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>
          
          <h3 className="text-lg font-semibold text-gray-900 capitalize">
            {monthName}
          </h3>
          
          <button
            onClick={() => navigateMonth('next')}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span>Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-48 sticky left-0 bg-white border-r">
                  Empleado
                </TableHead>
                {Array.from({ length: daysInMonth }, (_, i) => (
                  <TableHead key={i + 1} className="text-center w-10 min-w-10">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-medium">{i + 1}</span>
                      <span className="text-[10px] text-gray-500">
                        {new Date(year, month, i + 1).toLocaleDateString('es-ES', { weekday: 'narrow' })}
                      </span>
                    </div>
                  </TableHead>
                ))}
                <TableHead className="text-center w-16 border-l">
                  Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamUsers.map((teamUser) => (
                <TableRow key={teamUser.id}>
                  <TableCell className="sticky left-0 bg-white border-r">
                    <div>
                      <p className="font-medium text-gray-900">{teamUser.name}</p>
                      <p className="text-xs text-gray-500">{teamUser.email}</p>
                    </div>
                  </TableCell>
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const isWeekend = getDayOfWeek(day);
                    const leaveDetails = getLeaveDetails(teamUser.id, day);
                    const styles = getCellStyles(leaveDetails, isWeekend);
                    
                    return (
                      <TableCell key={day} className="text-center p-1">
                        <div className={`w-8 h-8 flex items-center justify-center text-xs rounded ${styles}`}>
                          {leaveDetails?.code || (isWeekend ? '·' : '')}
                        </div>
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center font-semibold border-l">
                    {getTotalDaysOff(teamUser.id)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Leyenda</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 border border-green-200 rounded flex items-center justify-center text-green-800 font-semibold">V</div>
            <span>Vacaciones (J. Completa)</span>
          </div>
           <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-50 border border-green-200 rounded flex items-center justify-center text-green-700 font-semibold">V</div>
            <span>Vacaciones (J. Intensiva)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded flex items-center justify-center text-red-800 font-semibold">E</div>
            <span>Enfermedad</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-100 border border-purple-200 rounded flex items-center justify-center text-purple-800 font-semibold">P</div>
            <span>Personal</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded flex items-center justify-center text-blue-800 font-semibold">M</div>
            <span>Maternidad/Paternidad</span>
          </div>
        </div>
      </div>
    </div>
  );
}