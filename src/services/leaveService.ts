import { supabase } from '@/integrations/supabase/client';
import { LeaveRequest, User } from '@/models/types';
import { LEAVE_STATUS, APP_ERRORS } from '@/config/constants';
import { calendarService } from './calendarService';

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
 * Retrieves the full profile for a specific user to check balances and counters.
 */
const getUserProfile = async (userId: string): Promise<User> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error(`Error fetching profile for user ${userId}:`, error);
    throw error;
  }
  
  return data as User;
};

/**
 * Updates the vacation consumption counters for a specific user.
 */
const updateUserConsumption = async (
  userId: string, 
  data: { 
    vacation_full_consumed: number, 
    vacation_intensive_consumed: number 
  }
): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', userId);

  if (error) {
    console.error(`Error updating consumption for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Updates the personal days balance for a specific user.
 */
const updateUserPersonalBalance = async (userId: string, newBalance: number): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({ personal_days_balance: newBalance })
    .eq('id', userId);

  if (error) {
    console.error(`Error updating personal balance for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Checks if there are any existing requests that overlap with the given date range for a user.
 * Returns true if an overlap exists.
 */
const checkRequestOverlap = async (userId: string, startDate: string, endDate: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('leave_requests')
    .select('id')
    .eq('user_id', userId)
    .neq('status', LEAVE_STATUS.REJECTED)
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
    const hasOverlap = await checkRequestOverlap(
      requestData.user_id, 
      requestData.start_date, 
      requestData.end_date
    );

    if (hasOverlap) {
      throw new Error(APP_ERRORS.OVERLAPPING_REQUEST);
    }

    const profile = await getUserProfile(requestData.user_id);
    const status = requestData.type === 'enfermedad' ? LEAVE_STATUS.APPROVED : LEAVE_STATUS.PENDING;

    if (requestData.type === 'personal') {
      if (profile.personal_days_balance < requestData.days_count) {
        throw new Error('INSUFFICIENT_PERSONAL_BALANCE');
      }
    }

    if (requestData.type === 'vacaciones') {
      const year = new Date(requestData.start_date).getFullYear();
      const { holidays, config, specialDays } = await calendarService.getCalendarData(year);
      
      const breakdown = calendarService.calculateDayTypeBreakdown(
        new Date(requestData.start_date),
        new Date(requestData.end_date),
        holidays,
        config,
        specialDays
      );

      const totalConsumed = (profile.vacation_full_consumed || 0) + (profile.vacation_intensive_consumed || 0);
      const totalAvailable = profile.vacation_days_balance || 0;
      
      if (totalConsumed + breakdown.total_workdays > totalAvailable) {
        throw new Error('INSUFFICIENT_VACATION_BALANCE');
      }

      const maxFullDays = totalAvailable - 17;
      const currentFullConsumed = profile.vacation_full_consumed || 0;
      
      if (currentFullConsumed + breakdown.WORKDAY_FULL > maxFullDays) {
        throw new Error('EXCEEDED_FULL_WORKDAY_LIMIT');
      }
    }

    const { data, error } = await supabase
      .from('leave_requests')
      .insert([{ ...requestData, status }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

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
    const updatePayload: Partial<LeaveRequest> = {
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerId,
    };
    
    if (comments) {
      updatePayload.review_comments = comments;
    }

    const updatedRequest = await updateRequestStatusInDb(requestId, updatePayload);
    const isApproved = status === LEAVE_STATUS.APPROVED;

    if (isApproved) {
      try {
        const profile = await getUserProfile(updatedRequest.user_id);

        if (updatedRequest.type === 'vacaciones') {
          const year = new Date(updatedRequest.start_date).getFullYear();
          const { holidays, config, specialDays } = await calendarService.getCalendarData(year);
          const breakdown = calendarService.calculateDayTypeBreakdown(
            new Date(updatedRequest.start_date),
            new Date(updatedRequest.end_date),
            holidays,
            config,
            specialDays
          );

          await updateUserConsumption(updatedRequest.user_id, {
            vacation_full_consumed: (profile.vacation_full_consumed || 0) + breakdown.WORKDAY_FULL,
            vacation_intensive_consumed: (profile.vacation_intensive_consumed || 0) + breakdown.WORKDAY_INTENSIVE
          });
        } else if (updatedRequest.type === 'personal') {
          await updateUserPersonalBalance(updatedRequest.user_id, (profile.personal_days_balance || 0) - updatedRequest.days_count);
        }
      } catch (error) {
        console.error('CRITICAL: Failed to update user balance after approval', error);
        throw error;
      }
    }

    return updatedRequest;
  }
};