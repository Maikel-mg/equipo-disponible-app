
import React, { useState } from 'react';
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
  FileText,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NewRequestModal } from './NewRequestModal';

export function Dashboard() {
  const { user } = useAuth();
  const { requests } = useLeaveRequests();
  const { holidays } = useHolidays();
  const navigate = useNavigate();
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);

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
      subtitle: 'disponibles',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Solicitudes pendientes',
      value: pendingRequests,
      icon: Clock,
      color: 'amber',
      subtitle: 'por revisar',
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      title: 'Aprobadas este mes',
      value: approvedThisMonth,
      icon: CheckCircle,
      color: 'green',
      subtitle: 'solicitudes',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Días de enfermedad',
      value: user?.sick_days_balance || 0,
      icon: FileText,
      color: 'purple',
      subtitle: 'disponibles',
      gradient: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-3xl font-bold">¡Bienvenido de vuelta, {user?.name}!</h1>
          </div>
          <p className="text-blue-100 text-lg">
            Tienes {pendingRequests} solicitudes pendientes y {user?.vacation_days_balance || 0} días de vacaciones disponibles.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={stat.title} className="group">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.subtitle}</p>
                </div>
                <div className={`p-4 rounded-2xl bg-gradient-to-r ${stat.gradient} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 bg-gradient-to-r ${stat.gradient} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min((stat.value / 30) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Requests */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Solicitudes Recientes</h3>
            </div>
            <button 
              onClick={() => navigate('/requests')}
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
            >
              Ver todas <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            {recentRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50/80 rounded-xl hover:bg-gray-100/80 transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{request.user_name}</p>
                  <p className="text-xs text-gray-500 capitalize">{request.type}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(request.start_date, 'dd/MM')} - {formatDate(request.end_date, 'dd/MM')}{' '}
                    <span className="text-gray-400">
                      ({request.days_count} {request.days_count === 1 ? 'día' : 'días'})
                    </span>
                  </p>
                </div>
                <span className={`status-${request.status} px-3 py-1 rounded-full text-xs font-medium`}>
                  {request.status}
                </span>
              </div>
            ))}
            
            {recentRequests.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay solicitudes recientes</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Holidays */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Próximos Festivos</h3>
            </div>
            <button 
              onClick={() => navigate('/calendar')}
              className="text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1 transition-colors"
            >
              Ver calendario <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            {upcomingHolidays.map((holiday) => (
              <div key={holiday.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{holiday.name}</p>
                  <p className="text-xs text-purple-600 capitalize font-medium">{holiday.type}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(holiday.date)}
                  </p>
                </div>
                {holiday.is_mandatory && (
                  <span className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
                    Obligatorio
                  </span>
                )}
              </div>
            ))}
            
            {upcomingHolidays.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay festivos próximos</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16"></div>
        <div className="relative">
          <h3 className="text-2xl font-bold mb-2">Acciones Rápidas</h3>
          <p className="text-indigo-100 mb-8">Gestiona tus solicitudes y revisa la información del equipo</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button 
              onClick={() => setShowNewRequestModal(true)}
              className="group bg-white/20 backdrop-blur-sm p-6 rounded-2xl hover:bg-white/30 transition-all duration-300 text-left border border-white/20"
            >
              <FileText className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-lg mb-2">Nueva Solicitud</p>
              <p className="text-sm text-indigo-100">Pedir días libres</p>
            </button>
            
            <button 
              onClick={() => navigate('/calendar')}
              className="group bg-white/20 backdrop-blur-sm p-6 rounded-2xl hover:bg-white/30 transition-all duration-300 text-left border border-white/20"
            >
              <Calendar className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-lg mb-2">Ver Calendario</p>
              <p className="text-sm text-indigo-100">Planificar ausencias</p>
            </button>
            
            <button 
              onClick={() => navigate('/team')}
              className="group bg-white/20 backdrop-blur-sm p-6 rounded-2xl hover:bg-white/30 transition-all duration-300 text-left border border-white/20"
            >
              <Users className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-lg mb-2">Estado del Equipo</p>
              <p className="text-sm text-indigo-100">Ver disponibilidad</p>
            </button>
          </div>
        </div>
      </div>

      {/* New Request Modal */}
      <NewRequestModal 
        isOpen={showNewRequestModal}
        onClose={() => setShowNewRequestModal(false)}
      />
    </div>
  );
}
