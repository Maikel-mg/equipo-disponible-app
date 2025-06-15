
import React, { useState } from 'react';
import { Team, User, LeaveRequest } from '@/models/types';
import { Calendar, Users, AlertTriangle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface TeamCalendarSectionProps {
  team: Team;
  members: User[];
  requests: LeaveRequest[];
}

export function TeamCalendarSection({ team, members, requests }: TeamCalendarSectionProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const approvedRequests = requests.filter(r => r.status === 'aprobada');
  
  // Get upcoming absences (next 30 days)
  const today = new Date();
  const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const upcomingAbsences = approvedRequests.filter(r => {
    const startDate = new Date(r.start_date);
    const endDate = new Date(r.end_date);
    return startDate <= next30Days && endDate >= today;
  }).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

  // Group absences by date to find critical days
  const absencesByDate = new Map<string, LeaveRequest[]>();
  
  approvedRequests.forEach(request => {
    const startDate = new Date(request.start_date);
    const endDate = new Date(request.end_date);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      if (!absencesByDate.has(dateKey)) {
        absencesByDate.set(dateKey, []);
      }
      absencesByDate.get(dateKey)?.push(request);
    }
  });

  // Find critical days (more than 50% of team absent)
  const criticalDays = Array.from(absencesByDate.entries())
    .filter(([, requests]) => requests.length > members.length * 0.5)
    .map(([date, requests]) => ({ date, count: requests.length, requests }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const getMemberName = (userId: string) => {
    const member = members.find(m => m.id === userId);
    return member?.name || 'Usuario desconocido';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vacaciones':
        return 'bg-blue-100 text-blue-800';
      case 'enfermedad':
        return 'bg-red-100 text-red-800';
      case 'personal':
        return 'bg-purple-100 text-purple-800';
      case 'maternidad':
      case 'paternidad':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Calendar className="w-6 h-6 text-purple-600" />
        <h2 className="text-xl font-semibold text-gray-900">
          Calendario del Equipo
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas Ausencias */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Próximas Ausencias (30 días)
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {upcomingAbsences.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay ausencias programadas</p>
              </div>
            ) : (
              upcomingAbsences.map((request) => (
                <div key={request.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">
                      {getMemberName(request.user_id)}
                    </p>
                    <Badge className={getTypeColor(request.type)}>
                      {request.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {formatDate(request.start_date, 'dd/MM/yyyy')} - {formatDate(request.end_date, 'dd/MM/yyyy')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {request.days_count} {request.days_count === 1 ? 'día' : 'días'}
                  </p>
                  {request.reason && (
                    <p className="text-xs text-gray-500 mt-1">
                      Motivo: {request.reason}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Días Críticos */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Días Críticos
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {criticalDays.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay días críticos identificados</p>
                <p className="text-xs text-gray-400 mt-1">
                  (+ del 50% del equipo ausente)
                </p>
              </div>
            ) : (
              criticalDays.map((day, index) => (
                <div key={index} className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <p className="font-medium text-red-900">
                        {formatDate(day.date, 'dd/MM/yyyy')}
                      </p>
                    </div>
                    <Badge className="bg-red-100 text-red-800">
                      {day.count} ausentes
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    {day.requests.map((request, reqIndex) => (
                      <p key={reqIndex} className="text-xs text-red-700">
                        • {getMemberName(request.user_id)} ({request.type})
                      </p>
                    ))}
                  </div>
                  <p className="text-xs text-red-600 mt-2">
                    {Math.round((day.count / members.length) * 100)}% del equipo ausente
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Resumen de Cobertura */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">
              {members.length - (absencesByDate.get(today.toISOString().split('T')[0])?.length || 0)}
            </p>
            <p className="text-sm text-gray-600">Disponibles Hoy</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {upcomingAbsences.length}
            </p>
            <p className="text-sm text-gray-600">Ausencias Próximas</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">
              {criticalDays.length}
            </p>
            <p className="text-sm text-gray-600">Días Críticos</p>
          </div>
        </div>
      </div>
    </div>
  );
}
