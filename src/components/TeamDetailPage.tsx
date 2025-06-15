
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';
import { ArrowLeft, Users, Calendar, BarChart3, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TeamStats } from './TeamStats';
import { MemberCard } from './MemberCard';
import { TeamRequestsSection } from './TeamRequestsSection';
import { TeamCalendarSection } from './TeamCalendarSection';

export function TeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const { user } = useAuth();
  const { users, teams, loading } = useUsers();
  const { requests } = useLeaveRequests();

  // Verificar permisos
  if (user?.role !== 'rrhh' && user?.role !== 'responsable') {
    return (
      <div className="p-8 text-center">
        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Acceso Restringido
        </h3>
        <p className="text-gray-500">
          Solo RRHH y responsables pueden ver detalles de equipos.
        </p>
      </div>
    );
  }

  const team = teams.find(t => t.id === teamId);
  const teamMembers = users.filter(u => u.team_id === teamId);
  const teamRequests = requests.filter(r => 
    teamMembers.some(member => member.id === r.user_id)
  );

  // Verificar si el responsable puede ver este equipo
  if (user?.role === 'responsable' && team?.manager_id !== user.id) {
    return (
      <div className="p-8 text-center">
        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Acceso Restringido
        </h3>
        <p className="text-gray-500">
          Solo puedes ver los detalles de tu propio equipo.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Cargando detalles del equipo...</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="p-8 text-center">
        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Equipo No Encontrado
        </h3>
        <p className="text-gray-500">
          El equipo que buscas no existe o no tienes permisos para verlo.
        </p>
        <Link to="/teams">
          <Button className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Equipos
          </Button>
        </Link>
      </div>
    );
  }

  const manager = users.find(u => u.id === team.manager_id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/teams">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
            <p className="text-gray-600">
              Responsable: {manager?.name || 'No asignado'}
            </p>
          </div>
        </div>
        
        {user?.role === 'rrhh' && (
          <div className="flex space-x-2">
            <Link to="/teams">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Gestionar Equipo
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <TeamStats team={team} members={teamMembers} requests={teamRequests} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Miembros del Equipo */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Miembros del Equipo ({teamMembers.length})
            </h2>
          </div>
          
          <div className="space-y-4">
            {teamMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Este equipo no tiene miembros asignados</p>
              </div>
            ) : (
              teamMembers.map((member) => (
                <MemberCard 
                  key={member.id} 
                  member={member} 
                  isManager={member.id === team.manager_id}
                  requests={requests.filter(r => r.user_id === member.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Solicitudes del Equipo */}
        <TeamRequestsSection 
          teamRequests={teamRequests} 
          teamMembers={teamMembers}
        />
      </div>

      {/* Calendario del Equipo */}
      <TeamCalendarSection 
        team={team}
        members={teamMembers}
        requests={teamRequests}
      />
    </div>
  );
}
