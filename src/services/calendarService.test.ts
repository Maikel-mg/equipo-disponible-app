
import { describe, it, expect } from 'vitest';
import { calendarService } from './calendarService';
import { Holiday, CalendarConfig, SpecialWorkday } from '@/models/types';

describe('CalendarService Business Logic', () => {
  // Mock Data
  const mockHolidays: Holiday[] = [
    { id: '1', date: '2024-12-25', name: 'Navidad', type: 'nacional', is_mandatory: true, created_by: '1', created_at: '' }
  ];

  const mockConfig: CalendarConfig = {
    id: '1',
    year: 2024,
    summer_start_date: '2024-07-01',
    summer_end_date: '2024-08-31',
    created_at: ''
  };

  const mockSpecialDays: SpecialWorkday[] = [
    { id: '1', date: '2024-12-24', type: 'intensiva', description: 'Nochebuena' }
  ];

  describe('getDayType hierarchy', () => {
    it('should identify a HOLIDAY (High Priority)', () => {
      const date = new Date('2024-12-25'); // Christmas
      const type = calendarService.getDayType(date, mockHolidays, mockConfig, mockSpecialDays);
      expect(type).toBe('HOLIDAY');
    });

    it('should identify a WEEKEND (Priority over special days/summer)', () => {
      const date = new Date('2024-07-06'); // Saturday in Summer
      const type = calendarService.getDayType(date, mockHolidays, mockConfig, mockSpecialDays);
      expect(type).toBe('WEEKEND');
    });

    it('should identify a SPECIAL INTENSIVE day (Manual Ad-hoc)', () => {
      const date = new Date('2024-12-24'); // Tuesday (Nochebuena special)
      const type = calendarService.getDayType(date, mockHolidays, mockConfig, mockSpecialDays);
      expect(type).toBe('WORKDAY_INTENSIVE');
    });

    it('should identify a FRIDAY as Intensive (Recurrent Rule)', () => {
      const date = new Date('2024-02-02'); // Friday in Winter
      const type = calendarService.getDayType(date, mockHolidays, mockConfig, mockSpecialDays);
      expect(type).toBe('WORKDAY_INTENSIVE');
    });

    it('should identify SUMMER Workdays as Intensive', () => {
      const date = new Date('2024-07-15'); // Monday in July
      const type = calendarService.getDayType(date, mockHolidays, mockConfig, mockSpecialDays);
      expect(type).toBe('WORKDAY_INTENSIVE');
    });

    it('should identify NORMAL Workdays (Default)', () => {
      const date = new Date('2024-02-01'); // Thursday in Winter
      const type = calendarService.getDayType(date, mockHolidays, mockConfig, mockSpecialDays);
      expect(type).toBe('WORKDAY_FULL');
    });
  });

  describe('calculateDayTypeBreakdown', () => {
    it('should correctly count day types in a range', () => {
      // Range: Dec 23 (Mon) to Dec 29 (Sun) 2024
      // Dec 23: Normal
      // Dec 24: Special Intensive
      // Dec 25: Holiday
      // Dec 26: Normal
      // Dec 27: Friday (Intensive)
      // Dec 28: Weekend
      // Dec 29: Weekend
      
      const start = new Date('2024-12-23');
      const end = new Date('2024-12-29');

      const breakdown = calendarService.calculateDayTypeBreakdown(
        start, end, mockHolidays, mockConfig, mockSpecialDays
      );

      expect(breakdown).toEqual({
        WORKDAY_FULL: 2,      // Mon 23, Thu 26
        WORKDAY_INTENSIVE: 2, // Tue 24 (Special), Fri 27 (Friday)
        HOLIDAY: 1,           // Wed 25
        WEEKEND: 2,           // Sat 28, Sun 29
        total_workdays: 4
      });
    });
  });
});
