
import React from 'react';
import { LeaveRequest, User } from '@/models/types';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface TeamRequestsSectionProps {
  teamRequests: LeaveRequest[];
  teamMembers: User[];
}

export function TeamRequestsSection({ teamRequests, teamMembers }: TeamRequestsSectionProps) {
  const pendingRequests = teamRequests.filter(r => r.status === 'pendiente');
  const recentRequests = teamRequests
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const getMemberName = (userId: string) => {
    const member = teamMembers.find(m => m.id === userId);
    return member?.name || 'Usuario desconocido';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprobada':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rechazada':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-amber-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aprobada':
        return <Badge className="bg-green-100 text-green-800">Aprobada</Badge>;
      case 'rechazada':
        return <Badge className="bg-red-100 text-red-800">Rechazada</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-800">Pendiente</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Calendar className="w-6 h-6 text-green-600" />
        <h2 className="text-xl font-semibold text-gray-900">
          Solicitudes del Equipo
        </h2>
      </div>

      {pendingRequests.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Pendientes de Aprobación ({pendingRequests.length})
          </h3>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div key={request.id} className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <p className="font-medium text-gray-900">{getMemberName(request.user_id)}</p>
                    </div>
                    <p className="text-sm text-gray-600 capitalize">{request.type}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(request.start_date, 'dd/MM/yyyy')} - {formatDate(request.end_date, 'dd/MM/yyyy')}
                      <span className="ml-2">({request.days_count} {request.days_count === 1 ? 'día' : 'días'})</span>
                    </p>
                    {request.reason && (
                      <p className="text-xs text-gray-500 mt-1">Motivo: {request.reason}</p>
                    )}
                  </div>
                  <Badge className="bg-amber-100 text-amber-800">
                    Pendiente
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Solicitudes Recientes
        </h3>
        <div className="space-y-3">
          {recentRequests.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay solicitudes registradas para este equipo</p>
            </div>
          ) : (
            recentRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(request.status)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{getMemberName(request.user_id)}</p>
                    <p className="text-xs text-gray-500 capitalize">{request.type}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(request.start_date, 'dd/MM')} - {formatDate(request.end_date, 'dd/MM')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(request.status)}
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(request.created_at, 'dd/MM/yyyy')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
