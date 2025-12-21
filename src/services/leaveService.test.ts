
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { leaveService } from './leaveService';
import { supabase } from '@/integrations/supabase/client';
import { LEAVE_STATUS } from '@/config/constants';

// --- Global Mocks ---

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Helper to create a chained Supabase mock
const createSupabaseMock = (finalValue: { data: any, error: any }) => {
  const mock = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnValue(finalValue),
    // For cases where we don't call single()
    then: (resolve: any) => resolve(finalValue),
  };
  return mock;
};

describe('LeaveService Business Rules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createRequest (Phase 2 & 4 Rules)', () => {
    
    it('should AUTO-APPROVE sickness requests', async () => {
      // 1. Mock Overlap Check (returns empty array)
      const overlapMock = createSupabaseMock({ data: [], error: null });
      // 2. Mock Get Profile
      const profileMock = createSupabaseMock({ data: { id: 'user1', personal_days_balance: 3 }, error: null });
      // 3. Mock Insert
      const insertMock = createSupabaseMock({ data: { id: '123' }, error: null });

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === 'leave_requests') return overlapMock;
        if (table === 'profiles') return profileMock;
      });

      // Override leave_requests for the final insert
      overlapMock.insert = vi.fn().mockReturnValue(insertMock);

      const requestData = {
        user_id: 'user1',
        user_name: 'Pepe',
        type: 'enfermedad' as const,
        start_date: '2024-01-01',
        end_date: '2024-01-05',
        days_count: 5,
      };

      await leaveService.createRequest(requestData);

      expect(overlapMock.insert).toHaveBeenCalledWith([
        expect.objectContaining({ status: LEAVE_STATUS.APPROVED })
      ]);
    });

    it('should VALIDATE BALANCE for Personal Days', async () => {
      const profileMock = createSupabaseMock({ 
        data: { id: 'user1', personal_days_balance: 2, vacation_days_balance: 22 }, 
        error: null 
      });

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === 'profiles') return profileMock;
        return createSupabaseMock({ data: [], error: null });
      });

      const requestData = {
        user_id: 'user1',
        user_name: 'Pepe',
        type: 'personal' as const,
        start_date: '2024-01-01',
        end_date: '2024-01-03',
        days_count: 3, 
      };

      await expect(leaveService.createRequest(requestData))
        .rejects
        .toThrow('INSUFFICIENT_PERSONAL_BALANCE');
    });

    it('should REJECT vacation if it exceeds FULL WORKDAY limit (Total - 17)', async () => {
      const profileMock = createSupabaseMock({ 
        data: { 
          vacation_days_balance: 22,
          vacation_full_consumed: 4,
          vacation_intensive_consumed: 0
        }, 
        error: null 
      });

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === 'profiles') return profileMock;
        if (table === 'holidays') return createSupabaseMock({ data: [], error: null });
        if (table === 'calendar_configs') return createSupabaseMock({ data: [], error: null });
        if (table === 'special_workdays') return createSupabaseMock({ data: [], error: null });
        return createSupabaseMock({ data: [], error: null });
      });

      const requestData = {
        user_id: 'user1',
        user_name: 'Pepe',
        type: 'vacaciones' as const,
        start_date: '2024-02-05', // Monday
        end_date: '2024-02-06',   // Tuesday
        days_count: 2, 
      };

      await expect(leaveService.createRequest(requestData))
        .rejects
        .toThrow('EXCEEDED_FULL_WORKDAY_LIMIT');
    });
  });

  describe('updateRequest (Approval Logic)', () => {
    it('should DEDUCT desaggregated vacation consumption when approving', async () => {
      const requestMock = createSupabaseMock({ 
        data: { 
          id: 'req1', 
          user_id: 'user1', 
          type: 'vacaciones', 
          start_date: '2024-02-02', // Friday
          end_date: '2024-02-02',
          days_count: 1,
          status: LEAVE_STATUS.APPROVED 
        }, 
        error: null 
      });

      const profileMock = createSupabaseMock({ 
        data: { vacation_full_consumed: 0, vacation_intensive_consumed: 0 }, 
        error: null 
      });

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === 'leave_requests') return requestMock;
        if (table === 'profiles') return profileMock;
        return createSupabaseMock({ data: [], error: null });
      });

      await leaveService.updateRequest({ requestId: 'req1', status: LEAVE_STATUS.APPROVED });

      // Check if profile update was called
      expect(profileMock.update).toHaveBeenCalled();
    });
  });
});
