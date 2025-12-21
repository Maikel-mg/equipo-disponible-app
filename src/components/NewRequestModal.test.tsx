
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { NewRequestModal } from './NewRequestModal';
import { calendarService } from '@/services/calendarService';

// --- Mocks ---

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Test User', vacation_days_balance: 22 }
  })
}));

vi.mock('@/hooks/useLeaveRequests', () => ({
  useLeaveRequests: () => ({
    createRequest: vi.fn()
  })
}));

vi.mock('@/hooks/useHolidays', () => ({
  useHolidays: () => ({ holidays: [] })
}));

vi.mock('@/hooks/useCalendarConfig', () => ({
  useCalendarConfig: () => ({ config: null, specialDays: [] })
}));

vi.mock('@/services/calendarService', () => ({
  calendarService: {
    calculateDayTypeBreakdown: vi.fn(),
    getDayType: vi.fn()
  }
}));

// Mock Calendar
vi.mock('@/components/ui/calendar', () => ({
  Calendar: ({ onSelect }: any) => (
    <div data-testid="mock-calendar">
      <button onClick={() => onSelect(new Date('2024-07-01'))}>Select Start</button>
      <button onClick={() => onSelect(new Date('2024-07-05'))}>Select End</button>
    </div>
  )
}));

// Mock Select (Radix UI bypass)
vi.mock('@/components/ui/select', () => ({
  Select: ({ onValueChange, children }: any) => (
    <div data-testid="mock-select" onClick={() => onValueChange('vacaciones')}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: any) => <button>{children}</button>,
  SelectValue: () => <span>Selecciona el tipo</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children }: any) => <div>{children}</div>,
}));

describe('NewRequestModal UI (Phase 3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display breakdown summary when Vacaciones is selected', async () => {
    // 1. Setup Logic Mock
    (calendarService.calculateDayTypeBreakdown as any).mockReturnValue({
      WORKDAY_FULL: 3,
      WORKDAY_INTENSIVE: 2,
      HOLIDAY: 0,
      WEEKEND: 0,
      total_workdays: 5
    });

    render(<NewRequestModal isOpen={true} onClose={vi.fn()} />);

    // 2. Select "Vacaciones" (Click Mock Select Wrapper)
    const selectWrapper = screen.getByTestId('mock-select');
    fireEvent.click(selectWrapper);
    
    // 3. Select Start Date (Open Popover -> Click Mock Button)
    const startButton = screen.getAllByText('Seleccionar fecha')[0];
    fireEvent.click(startButton);
    fireEvent.click(screen.getByText('Select Start'));

    // 4. Select End Date (Open Popover -> Click Mock Button)
    const endButton = screen.getAllByText('Seleccionar fecha')[0]; // The first one changes text, so we get the remaining one
    fireEvent.click(endButton);
    fireEvent.click(screen.getByText('Select End'));

    // 5. Assertion: Check if Breakdown appears
    expect(await screen.findByText('Total días a descontar:')).toBeTruthy();
    expect(screen.getByText('5 días')).toBeTruthy();
    expect(screen.getByText('Completa: 3')).toBeTruthy();
    expect(screen.getByText('Intensiva: 2')).toBeTruthy();
  });
});
