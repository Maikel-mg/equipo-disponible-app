import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LeaveRequest } from '@/models/types';
import { useAuth } from '@/contexts/AuthContext';
import { leaveService } from '@/services/leaveService';

export function useLeaveRequests() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading: loading, error } = useQuery({
    queryKey: ['leave-requests'],
    queryFn: leaveService.getRequests,
    enabled: !!user,
  });

  const createRequestMutation = useMutation({
    mutationFn: leaveService.createRequest,
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
      return leaveService.updateRequest({
        requestId,
        status,
        comments,
        reviewerId: user?.id
      });
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