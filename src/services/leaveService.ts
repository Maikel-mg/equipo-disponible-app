import { supabase } from '@/integrations/supabase/client';
import { LeaveRequest } from '@/models/types';
import { LEAVE_STATUS, APP_ERRORS } from '@/config/constants';

// --- Private Helper Functions (Data Access Layer) ---

/**
 * Updates the status and review details of a specific leave request in the database.
 */
const updateRequestStatusInDb = async (
  requestId: string, 
  updateData: Partial<LeaveRequest>
): Promise<LeaveRequest> => {
  const { data, error } = await supabase
    .from('leave_requests')
    .update(updateData)
    .eq('id', requestId)
    .select()
    .single();

  if (error) throw error;
  return data as LeaveRequest;
};

/**
 * Retrieves the current vacation days balance for a specific user.
 */
const getUserVacationBalance = async (userId: string): Promise<number> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('vacation_days_balance')
    .eq('id', userId)
    .single();

  if (error) {
    console.error(`Error fetching vacation balance for user ${userId}:`, error);
    throw error;
  }
  
  return data?.vacation_days_balance ?? 0;
};

/**
 * Updates the vacation days balance for a specific user.
 */
const updateUserVacationBalance = async (userId: string, newBalance: number): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({ vacation_days_balance: newBalance })
    .eq('id', userId);

  if (error) {
    console.error(`Error updating vacation balance for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Checks if there are any existing requests that overlap with the given date range for a user.
 * Returns true if an overlap exists.
 */
const checkRequestOverlap = async (userId: string, startDate: string, endDate: string): Promise<boolean> => {
  // Logic: (StartA <= EndB) and (EndA >= StartB)
  const { data, error } = await supabase
    .from('leave_requests')
    .select('id')
    .eq('user_id', userId)
    .neq('status', LEAVE_STATUS.REJECTED) // Ignore rejected requests
    .lte('start_date', endDate)
    .gte('end_date', startDate);

  if (error) {
    console.error('Error checking for request overlap:', error);
    throw error;
  }

  return data && data.length > 0;
};

// --- Public Service (Business Logic Layer) ---

export const leaveService = {
  getRequests: async (): Promise<LeaveRequest[]> => {
    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as LeaveRequest[];
  },

  createRequest: async (requestData: Omit<LeaveRequest, 'id' | 'created_at' | 'status'>) => {
    // 1. Validation: Check for overlapping requests
    const hasOverlap = await checkRequestOverlap(
      requestData.user_id, 
      requestData.start_date, 
      requestData.end_date
    );

    if (hasOverlap) {
      throw new Error(APP_ERRORS.OVERLAPPING_REQUEST);
    }

    // 2. Persist request
    const { data, error } = await supabase
      .from('leave_requests')
      .insert([requestData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Processes a review for a leave request.
   * If approved, it automatically handles the deduction of vacation days.
   */
  updateRequest: async ({ 
    requestId, 
    status, 
    comments,
    reviewerId
  }: { 
    requestId: string; 
    status: LeaveRequest['status']; 
    comments?: string;
    reviewerId?: string;
  }) => {
    // 1. Prepare update payload
    const updatePayload: Partial<LeaveRequest> = {
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerId,
    };
    
    if (comments) {
      updatePayload.review_comments = comments;
    }

    // 2. Persist status change
    const updatedRequest = await updateRequestStatusInDb(requestId, updatePayload);

    // 3. Execute Business Rules (Side Effects)
    const isVacationRequest = updatedRequest.type === 'vacaciones';
    const isApproved = status === LEAVE_STATUS.APPROVED;

    if (isApproved && isVacationRequest) {
      try {
        const currentBalance = await getUserVacationBalance(updatedRequest.user_id);
        const newBalance = currentBalance - updatedRequest.days_count;
        
        await updateUserVacationBalance(updatedRequest.user_id, newBalance);
      } catch (error) {
        // Critical error: Request approved but balance not updated.
        // In a real system, we might want to rollback the approval here or alert admin.
        console.error('CRITICAL: Failed to update user balance after approval', error);
        throw error;
      }
    }

    return updatedRequest;
  }
};