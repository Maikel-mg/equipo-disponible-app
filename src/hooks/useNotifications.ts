
import { useState, useEffect } from 'react';
import { Notification } from '@/models/types';
import { useAuth } from '@/contexts/AuthContext';
import { useLeaveRequests } from './useLeaveRequests';
import { useHolidays } from './useHolidays';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { requests } = useLeaveRequests();
  const { holidays } = useHolidays();

  useEffect(() => {
    if (!user) return;

    const generateNotifications = () => {
      const newNotifications: Notification[] = [];

      // Notificaciones para responsables y RRHH sobre solicitudes pendientes
      if (user.role === 'responsable' || user.role === 'rrhh') {
        const pendingRequests = requests.filter(r => r.status === 'pendiente');
        if (pendingRequests.length > 0) {
          newNotifications.push({
            id: 'pending-requests',
            user_id: user.id,
            title: 'Solicitudes pendientes',
            message: `Tienes ${pendingRequests.length} solicitud(es) pendiente(s) de revisión`,
            type: 'warning',
            is_read: false,
            related_type: 'leave_request',
            created_at: new Date().toISOString(),
          });
        }
      }

      // Notificaciones para empleados sobre sus solicitudes
      const userRequests = requests.filter(r => r.user_id === user.id);
      const recentlyReviewed = userRequests.filter(r => 
        r.status !== 'pendiente' && 
        r.reviewed_at && 
        new Date(r.reviewed_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );

      recentlyReviewed.forEach(request => {
        newNotifications.push({
          id: `request-${request.id}`,
          user_id: user.id,
          title: `Solicitud ${request.status}`,
          message: `Tu solicitud de ${request.type} ha sido ${request.status}`,
          type: request.status === 'aprobada' ? 'success' : 'error',
          is_read: false,
          related_id: request.id,
          related_type: 'leave_request',
          created_at: request.reviewed_at!,
        });
      });

      // Notificaciones sobre próximos festivos
      const upcomingHolidays = holidays.filter(h => {
        const holidayDate = new Date(h.date);
        const today = new Date();
        const daysUntil = Math.ceil((holidayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntil > 0 && daysUntil <= 7;
      });

      if (upcomingHolidays.length > 0) {
        newNotifications.push({
          id: 'upcoming-holidays',
          user_id: user.id,
          title: 'Próximos festivos',
          message: `Tienes ${upcomingHolidays.length} día(s) festivo(s) esta semana`,
          type: 'info',
          is_read: false,
          related_type: 'holiday',
          created_at: new Date().toISOString(),
        });
      }

      setNotifications(newNotifications);
      setLoading(false);
    };

    generateNotifications();
  }, [user, requests, holidays]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId 
          ? { ...n, is_read: true }
          : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, is_read: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}
