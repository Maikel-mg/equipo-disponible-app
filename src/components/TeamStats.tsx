
import React from 'react';
import { Team, User, LeaveRequest } from '@/models/types';
import { Users, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

interface TeamStatsProps {
  team: Team;
  members: User[];
  requests: LeaveRequest[];
}

export function TeamStats({ team, members, requests }: TeamStatsProps) {
  const today = new Date();
  
  const activeLeaves = requests.filter(r => {
    if (r.status !== 'aprobada') return false;
    const startDate = new Date(r.start_date);
    const endDate = new Date(r.end_date);
    return today >= startDate && today <= endDate;
  });

  const pendingRequests = requests.filter(r => r.status === 'pendiente');
  
  const thisMonthRequests = requests.filter(r => {
    const requestDate = new Date(r.created_at);
    return requestDate.getMonth() === today.getMonth() && 
           requestDate.getFullYear() === today.getFullYear();
  });

  const availableMembers = members.length - activeLeaves.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-blue-50 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <Users className="w-8 h-8 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-900">Total Miembros</p>
            <p className="text-2xl font-bold text-blue-900">{members.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-green-50 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-900">Disponibles</p>
            <p className="text-2xl font-bold text-green-900">{availableMembers}</p>
          </div>
        </div>
      </div>

      <div className="bg-red-50 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-8 h-8 text-red-600" />
          <div>
            <p className="text-sm font-medium text-red-900">Ausentes Hoy</p>
            <p className="text-2xl font-bold text-red-900">{activeLeaves.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <Calendar className="w-8 h-8 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-900">Solicitudes Pendientes</p>
            <p className="text-2xl font-bold text-amber-900">{pendingRequests.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
