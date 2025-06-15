
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Notification } from '@/models/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLeaveRequests } from './useLeaveRequests';
import { useHolidays } from './useHolidays';

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { requests } = useLeaveRequests();
  const { holidays } = useHolidays();

  const { data: notifications = [], isLoading: loading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Generate dynamic notifications based on data
      const dynamicNotifications: Notification[] = [];

      // Notifications for managers and HR about pending requests
      if (user.role === 'responsable' || user.role === 'rrhh') {
        const pendingRequests = requests.filter(r => r.status === 'pendiente');
        if (pendingRequests.length > 0) {
          dynamicNotifications.push({
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

      // Notifications about upcoming holidays
      const upcomingHolidays = holidays.filter(h => {
        const holidayDate = new Date(h.date);
        const today = new Date();
        const daysUntil = Math.ceil((holidayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntil > 0 && daysUntil <= 7;
      });

      if (upcomingHolidays.length > 0) {
        dynamicNotifications.push({
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

      return [...dynamicNotifications, ...data] as Notification[];
    },
    enabled: !!user,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      // Only update real notifications in database, not dynamic ones
      if (!notificationId.startsWith('pending-') && !notificationId.startsWith('upcoming-')) {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notificationId);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
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
