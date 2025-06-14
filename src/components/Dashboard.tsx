import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';
import { useHolidays } from '@/hooks/useHolidays';
import { formatDate, getStatusColor } from '@/lib/utils';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  Users, 
  TrendingUp,
  FileText
} from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();
  const { requests } = useLeaveRequests();
  const { holidays } = useHolidays();

  const pendingRequests = requests.filter(r => r.status === 'pendiente').length;
  const approvedThisMonth = requests.filter(r => 
    r.status === 'aprobada' && 
    new Date(r.created_at).getMonth() === new Date().getMonth()
  ).length;

  const upcomingHolidays = holidays.filter(h => 
    new Date(h.date) > new Date()
  ).slice(0, 3);

  const recentRequests = requests.slice(0, 3);

  const stats = [
    {
      title: 'Días de vacaciones',
      value: user?.vacation_days_balance || 0,
      icon: Calendar,
      color: 'blue',
      subtitle: 'disponibles'
    },
    {
      title: 'Solicitudes pendientes',
      value: pendingRequests,
      icon: Clock,
      color: 'amber',
      subtitle: 'por revisar'
    },
    {
      title: 'Aprobadas este mes',
      value: approvedThisMonth,
      icon: CheckCircle,
      color: 'green',
      subtitle: 'solicitudes'
    },
    {
      title: 'Días de enfermedad',
      value: user?.sick_days_balance || 0,
      icon: FileText,
      color: 'red',
      subtitle: 'disponibles'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Solicitudes Recientes</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {recentRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{request.user_name}</p>
                  <p className="text-xs text-gray-500 capitalize">{request.type}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(request.start_date, 'dd/MM')} - {formatDate(request.end_date, 'dd/MM')}
                  </p>
                  <span className="text-[11px] text-gray-400 block mt-0.5">
                    {request.days_count} {request.days_count === 1 ? 'día' : 'días'}
                  </span>
                </div>
                <span className={`status-${request.status}`}>
                  {request.status}
                </span>
              </div>
            ))}
            
            {recentRequests.length === 0 && (
              <p className="text-center text-gray-500 py-8">No hay solicitudes recientes</p>
            )}
          </div>
        </div>

        {/* Upcoming Holidays */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Próximos Festivos</h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {upcomingHolidays.map((holiday) => (
              <div key={holiday.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{holiday.name}</p>
                  <p className="text-xs text-blue-600 capitalize">{holiday.type}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(holiday.date)}
                  </p>
                </div>
                {holiday.is_mandatory && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Obligatorio
                  </span>
                )}
              </div>
            ))}
            
            {upcomingHolidays.length === 0 && (
              <p className="text-center text-gray-500 py-8">No hay festivos próximos</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left">
            <FileText className="w-6 h-6 text-blue-600 mb-2" />
            <p className="font-medium text-gray-900">Nueva Solicitud</p>
            <p className="text-xs text-gray-500">Pedir días libres</p>
          </button>
          
          <button className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left">
            <Calendar className="w-6 h-6 text-green-600 mb-2" />
            <p className="font-medium text-gray-900">Ver Calendario</p>
            <p className="text-xs text-gray-500">Planificar ausencias</p>
          </button>
          
          <button className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left">
            <Users className="w-6 h-6 text-purple-600 mb-2" />
            <p className="font-medium text-gray-900">Estado del Equipo</p>
            <p className="text-xs text-gray-500">Ver disponibilidad</p>
          </button>
        </div>
      </div>
    </div>
  );
}
