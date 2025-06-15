
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LeaveRequest } from '@/models/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useLeaveRequests() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading: loading, error } = useQuery({
    queryKey: ['leave-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as LeaveRequest[];
    },
    enabled: !!user,
  });

  const createRequestMutation = useMutation({
    mutationFn: async (requestData: Omit<LeaveRequest, 'id' | 'created_at' | 'status'>) => {
      const { data, error } = await supabase
        .from('leave_requests')
        .insert([requestData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
    },
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ 
      requestId, 
      status, 
      comments 
    }: { 
      requestId: string; 
      status: LeaveRequest['status']; 
      comments?: string; 
    }) => {
      const updateData: any = {
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id,
      };
      
      if (comments) {
        updateData.review_comments = comments;
      }

      const { data, error } = await supabase
        .from('leave_requests')
        .update(updateData)
        .eq('id', requestId)
        .select()
        .single();
      
      if (error) throw error;

      // If approved vacation request, update user's balance
      if (status === 'aprobada') {
        const request = requests.find(r => r.id === requestId);
        if (request && request.type === 'vacaciones') {
          await supabase
            .from('profiles')
            .update({
              vacation_days_balance: user!.vacation_days_balance - request.days_count
            })
            .eq('id', request.user_id);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const createRequest = async (requestData: Omit<LeaveRequest, 'id' | 'created_at' | 'status'>) => {
    return createRequestMutation.mutateAsync(requestData);
  };

  const updateRequestStatus = async (
    requestId: string, 
    status: LeaveRequest['status'], 
    comments?: string
  ) => {
    return updateRequestMutation.mutateAsync({ requestId, status, comments });
  };

  return {
    requests,
    loading: loading || createRequestMutation.isPending || updateRequestMutation.isPending,
    error: error?.message || null,
    createRequest,
    updateRequestStatus,
  };
}
