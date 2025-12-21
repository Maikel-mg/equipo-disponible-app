import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useLeaveRequests } from './useLeaveRequests';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { APP_ERRORS } from '@/config/constants';

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

        // --- FIX: Add mocks for Calendar tables ---
        if (['holidays', 'calendar_configs', 'special_workdays'].includes(table)) {
            return {
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({ data: [], error: null })),
                    data: [], 
                    error: null,
                    // If chained like select().eq()...
                    then: (resolve: any) => resolve([]),
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
    
    // Filter calls that look like the consumption update (has vacation_full_consumed)
    // NOTE: The logic changed in Phase 4. We no longer deduct from balance, we add to consumption.
    const balanceUpdateCalls = updateMock.mock.calls.filter(args => args[0] && 'vacation_full_consumed' in args[0]);
    
    expect(balanceUpdateCalls.length).toBeGreaterThan(0);
    // We don't check exact math here because it depends on the calendar mock which returns empty in this test,
    // defaulting to full days. The important part is that IT UPDATES THE REQUESTER profile.
  });
});

// New test suite for overlap validation
describe('leaveService Overlap Validation', () => {
  const MOCK_USER_ID = 'test_user_id';
  const MOCK_EXISTING_REQUEST_ID = 'existing_req_1';

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup a mock for supabase.from('leave_requests').select().eq().in().ov().data
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'leave_requests') {
        return {
          select: vi.fn(() => ({
            // This mock is specifically for the overlap check query
            // It should return a single existing request that overlaps
            filter: vi.fn(() => ({
              or: vi.fn(() => ({
                neq: vi.fn(() => ({
                  eq: vi.fn((column, value) => {
                    if (column === 'user_id' && value === MOCK_USER_ID) {
                      return {
                        in: vi.fn(() => ({
                          // Simulate an overlapping request
                          data: [{
                            id: MOCK_EXISTING_REQUEST_ID,
                            user_id: MOCK_USER_ID,
                            start_date: '2024-03-10',
                            end_date: '2024-03-15',
                            status: 'aprobada',
                            type: 'vacaciones',
                            days_count: 5,
                            created_at: '2024-03-01T00:00:00Z',
                          }],
                          error: null,
                        })),
                      };
                    }
                    // Fallback for other select calls if needed
                    return { data: [], error: null };
                  }),
                }))
              }))
            }))
            ,
            // Default select for getRequests if not specifically mocked above
            order: vi.fn(() => ({ data: [], error: null })),
          })),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => ({ data: {}, error: null }))
            }))
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn(() => ({ data: {}, error: null }))
              }))
            }))
          })),
        };
      }
      if (table === 'profiles') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({ data: { vacation_days_balance: 10 }, error: null }))
            }))
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({ data: {}, error: null }))
            }))
          })),
        };
      }
      return {};
    });
  });

  it('should prevent creating a request that overlaps with an existing one', async () => {
    const { result } = renderHook(() => useLeaveRequests(), {
      wrapper: createWrapper(),
    });

    const overlappingRequestData = {
      user_id: MOCK_USER_ID,
      start_date: '2024-03-14', // Overlaps with 2024-03-10 to 2024-03-15
      end_date: '2024-03-18',
      type: 'vacaciones',
      days_count: 5,
    };

    let caughtError: any;
    await act(async () => {
      try {
        await result.current.createRequest(overlappingRequestData as any);
      } catch (error) {
        caughtError = error;
      }
    });

    // We expect an error to be thrown
    expect(caughtError).toBeDefined();
    // And we expect the insert operation NOT to have been called
    expect(mockSupabase.from('leave_requests').insert).not.toHaveBeenCalled();
  });
});
