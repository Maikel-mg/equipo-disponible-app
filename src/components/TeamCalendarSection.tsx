
import React from 'react';
import { Team, User, LeaveRequest } from '@/models/types';
import { Calendar, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface TeamCalendarSectionProps {
  team: Team;
  members: User[];
  requests: LeaveRequest[];
}

export function TeamCalendarSection({ team, members, requests }: TeamCalendarSectionProps) {
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const upcomingLeaves = requests.filter(r => {
    if (r.status !== 'aprobada') return false;
    const startDate = new Date(r.start_date);
    return startDate >= today && startDate <= nextMonth;
  }).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

  const getConflictingDays = () => {
    const dayMap = new Map<string, LeaveRequest[]>();
    
    upcomingLeaves.forEach(leave => {
      const startDate = new Date(leave.start_date);
      const endDate = new Date(leave.end_date);
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0];
        if (!dayMap.has(dateKey)) {
          dayMap.set(dateKey, []);
        }
        dayMap.get(dateKey)!.push(leave);
      }
    });

    // Encontrar días con múltiples ausencias
    const conflicts = Array.from(dayMap.entries())
      .filter(([_, leaves]) => leaves.length > 1)
      .map(([date, leaves]) => ({ date, leaves }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return conflicts;
  };

  const conflicts = getConflictingDays();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Calendar className="w-6 h-6 text-green-600" />
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
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {upcomingLeaves.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No hay ausencias programadas</p>
              </div>
            ) : (
              upcomingLeaves.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{leave.user_name}</p>
                    <p className="text-sm text-gray-600 capitalize">{leave.type}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-blue-800 border-blue-300">
                    {leave.days_count} día{leave.days_count !== 1 ? 's' : ''}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Días Críticos (Conflictos) */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>Días Críticos</span>
          </h3>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {conflicts.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No hay conflictos detectados</p>
              </div>
            ) : (
              conflicts.map((conflict) => (
                <div key={conflict.date} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-amber-900">
                      {formatDate(conflict.date)}
                    </p>
                    <Badge className="bg-amber-100 text-amber-800">
                      {conflict.leaves.length} ausentes
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    {conflict.leaves.map((leave) => (
                      <p key={leave.id} className="text-sm text-amber-700">
                        • {leave.user_name} ({leave.type})
                      </p>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Resumen del Equipo */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">{members.length}</p>
            <p className="text-sm text-gray-600">Miembros Total</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{upcomingLeaves.length}</p>
            <p className="text-sm text-gray-600">Ausencias Programadas</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">{conflicts.length}</p>
            <p className="text-sm text-gray-600">Días Críticos</p>
          </div>
        </div>
      </div>
    </div>
  );
}
