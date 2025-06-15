
import React from 'react';
import { Users, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';
import { formatDate } from '@/lib/utils';

export function TeamPage() {
  const { user } = useAuth();
  const { users } = useUsers();
  const { requests } = useLeaveRequests();

  // Filter team members based on current user's role
  const teamMembers = user?.role === 'rrhh' 
    ? users // RRHH can see all users
    : users.filter(u => u.team_id === user?.team_id || u.id === user?.id);

  const getTeamRequests = () => {
    const teamUserIds = teamMembers.map(member => member.id);
    return requests.filter(request => teamUserIds.includes(request.user_id));
  };

  const teamRequests = getTeamRequests();
  const pendingRequests = teamRequests.filter(r => r.status === 'pendiente');
  const activeLeaves = teamRequests.filter(r => {
    if (r.status !== 'aprobada') return false;
    const today = new Date();
    const startDate = new Date(r.start_date);
    const endDate = new Date(r.end_date);
    return today >= startDate && today <= endDate;
  });

  const getMemberStatus = (memberId: string) => {
    const activeLeavesToday = activeLeaves.filter(leave => leave.user_id === memberId);
    if (activeLeavesToday.length > 0) {
      return {
        status: 'ausente',
        reason: activeLeavesToday[0].type,
        color: 'bg-red-100 text-red-800',
      };
    }
    return {
      status: 'disponible',
      reason: '',
      color: 'bg-green-100 text-green-800',
    };
  };

  const getUpcomingLeaves = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return teamRequests.filter(r => {
      if (r.status !== 'aprobada') return false;
      const startDate = new Date(r.start_date);
      return startDate > today && startDate <= nextWeek;
    });
  };

  const upcomingLeaves = getUpcomingLeaves();

  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Users className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            {user?.role === 'rrhh' ? 'Todos los Empleados' : 'Mi Equipo'}
          </h2>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Total Miembros</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">{teamMembers.length}</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Disponibles</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {teamMembers.length - activeLeaves.length}
            </p>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-900">Ausentes</span>
            </div>
            <p className="text-2xl font-bold text-red-900 mt-1">{activeLeaves.length}</p>
          </div>

          <div className="bg-amber-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium text-amber-900">Pendientes</span>
            </div>
            <p className="text-2xl font-bold text-amber-900 mt-1">{pendingRequests.length}</p>
          </div>
        </div>

        {/* Team Members List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Miembros del Equipo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamMembers.map((member) => {
              const memberStatus = getMemberStatus(member.id);
              return (
                <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-500 capitalize">{member.role}</p>
                      <p className="text-xs text-gray-400">{member.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={`${memberStatus.color} mb-1`}>
                      {memberStatus.status}
                    </Badge>
                    {memberStatus.reason && (
                      <p className="text-xs text-gray-500 capitalize">{memberStatus.reason}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upcoming Leaves */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Calendar className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Ausencias Próximas (7 días)</h3>
        </div>

        {upcomingLeaves.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay ausencias programadas para la próxima semana</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingLeaves.map((leave) => (
              <div key={leave.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{leave.user_name}</p>
                  <p className="text-sm text-gray-600 capitalize">{leave.type}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-purple-800 border-purple-300">
                    {leave.days_count} {leave.days_count === 1 ? 'día' : 'días'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Requests for Review */}
      {(user?.role === 'responsable' || user?.role === 'rrhh') && pendingRequests.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="w-6 h-6 text-amber-600" />
            <h3 className="text-lg font-semibold text-gray-900">Solicitudes Pendientes</h3>
          </div>

          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{request.user_name}</p>
                  <p className="text-sm text-gray-600 capitalize">{request.type}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(request.start_date)} - {formatDate(request.end_date)}
                  </p>
                </div>
                <div className="text-right">
                  <Badge className="bg-amber-100 text-amber-800 mb-1">
                    Pendiente
                  </Badge>
                  <p className="text-xs text-gray-500">
                    {request.days_count} {request.days_count === 1 ? 'día' : 'días'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
