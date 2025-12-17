import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useLeaveRequests } from './useLeaveRequests';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Hoist all mocks to ensure they are available for vi.mock calls
const { mockSupabase, updateMock, mockRequest, mockApprover } = vi.hoisted(() => {
  const mockApprover = {
    id: 'approver_1',
    email: 'boss@example.com',
    vacation_days_balance: 20, // Approver starts with 20 days
    role: 'responsable'
  };

  const mockRequest = {
    id: 'req_1',
    user_id: 'requester_1',
    days_count: 2,
    type: 'vacaciones',
    status: 'pendiente',
    created_at: '2023-01-01T00:00:00Z'
  };

  const updateMock = vi.fn(() => ({
    eq: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => ({ data: mockRequest, error: null }))
      }))
    }))
  }));

  const mockSupabase = {
    from: vi.fn((table) => {
        if (table === 'leave_requests') {
             return {
                select: vi.fn(() => ({
                  order: vi.fn(() => ({
                    data: [mockRequest],
                    error: null
                  })),
                  // For the find() inside the mutation
                  eq: vi.fn(() => ({
                    single: vi.fn(() => ({ data: {}, error: null }))
                  }))
                })),
                insert: vi.fn(() => ({
                  select: vi.fn(() => ({
                    single: vi.fn(() => ({ data: {}, error: null }))
                  }))
                })),
                update: updateMock, // For status update
             };
        }
        
        if (table === 'profiles') {
            return {
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn(() => ({
                            // Mocking the requester's balance fetch
                            data: { vacation_days_balance: 10 }, 
                            error: null 
                        }))
                    }))
                })),
                update: updateMock, // For balance update
                eq: vi.fn(() => ({
                    single: vi.fn(() => ({ data: {}, error: null }))
                }))
            };
        }

        return {};
    }),
  };

  return { mockSupabase, updateMock, mockRequest, mockApprover };
});

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockApprover,
    isAuthenticated: true
  })
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useLeaveRequests Bug Reproduction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should deduct days from the REQUESTER based on THEIR balance, not the approver\'s', async () => {
    const { result } = renderHook(() => useLeaveRequests(), {
      wrapper: createWrapper(),
    });

    // Wait for requests to load
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.requests).toHaveLength(1);

    // Perform approval
    await act(async () => {
      await result.current.updateRequestStatus('req_1', 'aprobada');
    });

    // Check Supabase calls for Profile Update
    expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    
    // Filter calls that look like the balance update (has vacation_days_balance)
    const balanceUpdateCalls = updateMock.mock.calls.filter(args => args[0] && 'vacation_days_balance' in args[0]);
    
    expect(balanceUpdateCalls.length).toBeGreaterThan(0);
    const updateArg = balanceUpdateCalls[0][0];

    const mockRequesterInitialBalance = 10;
    const requestDays = 2;
    const expectedCorrectBalance = mockRequesterInitialBalance - requestDays; // 8

    console.log('Update Arg received:', updateArg);
    
    // This expectation asserts CORRECT behavior. 
    // Now that we fixed the code and updated the mock, this should PASS.
    expect(updateArg.vacation_days_balance).toBe(expectedCorrectBalance);
  });
});
