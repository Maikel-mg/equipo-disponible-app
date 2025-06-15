
import React, { useState } from 'react';
import { User, Calendar, FileText, Edit, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';
import { formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/sonner';

export function UserProfile() {
  const { user } = useAuth();
  const { requests } = useLeaveRequests();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);

  if (!user) return null;

  const userRequests = requests.filter(r => r.user_id === user.id);
  const recentRequests = userRequests.slice(0, 5);

  const handleSave = () => {
    // In a real app, this would call an API to update the user
    toast.success('Perfil actualizado correctamente');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprobada':
        return 'bg-green-100 text-green-800';
      case 'rechazada':
        return 'bg-red-100 text-red-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'empleado':
        return 'bg-blue-100 text-blue-800';
      case 'responsable':
        return 'bg-green-100 text-green-800';
      case 'rrhh':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Mi Perfil</h2>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button onClick={handleSave} size="sm">
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-start space-x-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {user.name.charAt(0)}
          </div>
          
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={editedUser?.name || ''}
                    onChange={(e) => setEditedUser(prev => prev ? {...prev, name: e.target.value} : null)}
                  />
                ) : (
                  <p className="text-lg font-medium text-gray-900">{user.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={editedUser?.email || ''}
                    onChange={(e) => setEditedUser(prev => prev ? {...prev, email: e.target.value} : null)}
                  />
                ) : (
                  <p className="text-gray-600">{user.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Rol</Label>
                <Badge className={`capitalize ${getRoleColor(user.role)}`}>
                  {user.role}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <Label>Fecha de registro</Label>
                <p className="text-gray-600">{formatDate(user.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Días de Vacaciones</h3>
              <p className="text-sm text-gray-500">Disponibles</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-600">{user.vacation_days_balance}</p>
          <p className="text-sm text-gray-500 mt-1">días restantes</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <FileText className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Días de Enfermedad</h3>
              <p className="text-sm text-gray-500">Disponibles</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-red-600">{user.sick_days_balance}</p>
          <p className="text-sm text-gray-500 mt-1">días restantes</p>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Solicitudes</h3>
        
        {recentRequests.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No tienes solicitudes registradas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <p className="font-medium text-gray-900 capitalize">{request.type}</p>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDate(request.start_date)} - {formatDate(request.end_date)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {request.days_count} {request.days_count === 1 ? 'día' : 'días'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {formatDate(request.created_at, 'dd/MM/yyyy')}
                  </p>
                  {request.reviewed_at && (
                    <p className="text-xs text-gray-400">
                      Revisado: {formatDate(request.reviewed_at, 'dd/MM/yyyy')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
