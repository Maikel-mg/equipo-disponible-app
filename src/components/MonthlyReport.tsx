
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';
import { useUsers } from '@/hooks/useUsers';
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
  const [currentDate, setCurrentDate] = useState(new Date());

  // Solo mostrar si es responsable o RRHH
  if (!user || (user.role !== 'responsable' && user.role !== 'rrhh')) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">No tienes permisos para ver este informe</p>
      </div>
    );
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  // Obtener usuarios del equipo si es responsable
  const teamUsers = user.role === 'responsable' 
    ? users.filter(u => u.team_id === user.team_id)
    : users;

  // Filtrar solicitudes del mes actual
  const monthRequests = requests.filter(request => {
    const startDate = new Date(request.start_date);
    const endDate = new Date(request.end_date);
    return (startDate.getFullYear() === year && startDate.getMonth() === month) ||
           (endDate.getFullYear() === year && endDate.getMonth() === month) ||
           (startDate <= new Date(year, month, 1) && endDate >= new Date(year, month + 1, 0));
  });

  // Función para verificar si un usuario tiene ausencia en un día específico
  const hasLeaveOnDay = (userId: string, day: number) => {
    const targetDate = new Date(year, month, day);
    return monthRequests.find(request => {
      if (request.user_id !== userId || request.status !== 'aprobada') return false;
      const startDate = new Date(request.start_date);
      const endDate = new Date(request.end_date);
      return targetDate >= startDate && targetDate <= endDate;
    });
  };

  // Función para obtener el tipo de ausencia
  const getLeaveType = (userId: string, day: number) => {
    const leave = hasLeaveOnDay(userId, day);
    if (!leave) return null;
    
    const typeMap = {
      'vacaciones': 'V',
      'enfermedad': 'E',
      'personal': 'P',
      'maternidad': 'M',
      'paternidad': 'PT'
    };
    
    return typeMap[leave.type] || 'X';
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(month - 1);
    } else {
      newDate.setMonth(month + 1);
    }
    setCurrentDate(newDate);
  };

  const getDayOfWeek = (day: number) => {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // 0 = domingo, 6 = sábado
  };

  const getTotalDaysOff = (userId: string) => {
    return monthRequests
      .filter(req => req.user_id === userId && req.status === 'aprobada')
      .reduce((total, req) => {
        const startDate = new Date(req.start_date);
        const endDate = new Date(req.end_date);
        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);
        
        const overlapStart = new Date(Math.max(startDate.getTime(), monthStart.getTime()));
        const overlapEnd = new Date(Math.min(endDate.getTime(), monthEnd.getTime()));
        
        if (overlapStart <= overlapEnd) {
          const days = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          return total + days;
        }
        return total;
      }, 0);
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
                    const leaveType = getLeaveType(teamUser.id, day);
                    
                    return (
                      <TableCell key={day} className="text-center p-1">
                        <div className={`w-8 h-8 flex items-center justify-center text-xs rounded ${
                          isWeekend 
                            ? 'bg-gray-100 text-gray-400' 
                            : leaveType
                            ? 'bg-red-100 text-red-800 font-semibold'
                            : 'hover:bg-gray-50'
                        }`}>
                          {leaveType || (isWeekend ? '·' : '')}
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
            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded flex items-center justify-center text-red-800 font-semibold">V</div>
            <span>Vacaciones</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded flex items-center justify-center text-red-800 font-semibold">E</div>
            <span>Enfermedad</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded flex items-center justify-center text-red-800 font-semibold">P</div>
            <span>Personal</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded flex items-center justify-center text-red-800 font-semibold">M</div>
            <span>Maternidad</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded flex items-center justify-center text-red-800 font-semibold">PT</div>
            <span>Paternidad</span>
          </div>
        </div>
      </div>
    </div>
  );
}
