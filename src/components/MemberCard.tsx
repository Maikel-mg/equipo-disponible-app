
import React from 'react';
import { User, LeaveRequest } from '@/models/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Edit, Mail, Calendar } from 'lucide-react';

interface MemberCardProps {
  member: User;
  isManager: boolean;
  requests: LeaveRequest[];
}

export function MemberCard({ member, isManager, requests }: MemberCardProps) {
  const today = new Date();
  
  const activeLeavesToday = requests.filter(r => {
    if (r.status !== 'aprobada') return false;
    const startDate = new Date(r.start_date);
    const endDate = new Date(r.end_date);
    return today >= startDate && today <= endDate;
  });

  const pendingRequests = requests.filter(r => r.status === 'pendiente');

  const getMemberStatus = () => {
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

  const status = getMemberStatus();

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-medium">
            {member.name.charAt(0)}
          </div>
          {isManager && (
            <Crown className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <p className="font-medium text-gray-900">{member.name}</p>
            {isManager && (
              <Badge variant="outline" className="text-xs">
                Responsable
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 capitalize">{member.role}</p>
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            <Mail className="w-3 h-3" />
            <span>{member.email}</span>
          </div>
        </div>
      </div>

      <div className="text-right space-y-2">
        <Badge className={status.color}>
          {status.status}
        </Badge>
        
        {status.reason && (
          <p className="text-xs text-gray-500 capitalize">{status.reason}</p>
        )}
        
        <div className="flex space-x-1 text-xs text-gray-500">
          <span>Vacaciones: {member.vacation_days_balance}</span>
          <span>•</span>
          <span>Enfermedad: {member.sick_days_balance}</span>
        </div>
        
        {pendingRequests.length > 0 && (
          <div className="flex items-center space-x-1 text-xs text-amber-600">
            <Calendar className="w-3 h-3" />
            <span>{pendingRequests.length} pendiente{pendingRequests.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
}
