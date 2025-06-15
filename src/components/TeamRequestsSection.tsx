
import React, { useState } from 'react';
import { User, LeaveRequest } from '@/models/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, Filter } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface TeamRequestsSectionProps {
  teamRequests: LeaveRequest[];
  teamMembers: User[];
}

export function TeamRequestsSection({ teamRequests, teamMembers }: TeamRequestsSectionProps) {
  const [filter, setFilter] = useState<'all' | 'pendiente' | 'aprobada' | 'rechazada'>('all');

  const filteredRequests = teamRequests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const getStatusIcon = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'pendiente':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'aprobada':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rechazada':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: LeaveRequest['status']) => {
    const styles = {
      pendiente: 'bg-amber-100 text-amber-800',
      aprobada: 'bg-green-100 text-green-800',
      rechazada: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={styles[status]}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Clock className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Solicitudes del Equipo ({filteredRequests.length})
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="all">Todas</option>
            <option value="pendiente">Pendientes</option>
            <option value="aprobada">Aprobadas</option>
            <option value="rechazada">Rechazadas</option>
          </select>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'No hay solicitudes para este equipo' 
                : `No hay solicitudes ${filter}s`
              }
            </p>
          </div>
        ) : (
          filteredRequests
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(request.status)}
                  <div>
                    <p className="font-medium text-gray-900">{request.user_name}</p>
                    <p className="text-sm text-gray-600 capitalize">{request.type}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(request.start_date)} - {formatDate(request.end_date)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  {getStatusBadge(request.status)}
                  <p className="text-xs text-gray-500 mt-1">
                    {request.days_count} {request.days_count === 1 ? 'día' : 'días'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(request.created_at, 'dd/MM/yyyy')}
                  </p>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
