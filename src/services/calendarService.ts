import { supabase } from '@/integrations/supabase/client';
import { Holiday, CalendarConfig, SpecialWorkday, DayType } from '@/models/types';
import { format, isFriday, isWeekend, parseISO, isWithinInterval } from 'date-fns';

export const calendarService = {
  /**
   * Fetches all relevant calendar data for a given year.
   */
  getCalendarData: async (year: number) => {
    const [holidays, configs, specialDays] = await Promise.all([
      supabase.from('holidays').select('*'),
      supabase.from('calendar_configs').select('*').eq('year', year),
      supabase.from('special_workdays').select('*')
    ]);

    if (holidays.error) throw holidays.error;
    if (configs.error) throw configs.error;
    if (specialDays.error) throw specialDays.error;

    return {
      holidays: holidays.data as Holiday[],
      config: (configs.data?.[0] as CalendarConfig) || null,
      specialDays: specialDays.data as SpecialWorkday[]
    };
  },

  /**
   * Determines the type of a specific day based on business rules.
   * Priority: Holiday > Weekend > Special (Manual) > Friday > Summer > Full
   */
  getDayType: (
    date: Date, 
    holidays: Holiday[], 
    config: CalendarConfig | null, 
    specialDays: SpecialWorkday[]
  ): DayType => {
    const dateStr = format(date, 'yyyy-MM-dd');

    // 1. Check for Holidays
    if (holidays.some(h => h.date === dateStr)) {
      return 'HOLIDAY';
    }

    // 2. Check for Weekends
    if (isWeekend(date)) {
      return 'WEEKEND';
    }

    // 3. Check for Special Manual Workdays (e.g., intensive ad-hoc)
    if (specialDays.some(s => s.date === dateStr && s.type === 'intensiva')) {
      return 'WORKDAY_INTENSIVE';
    }

    // 4. Check for Fridays
    if (isFriday(date)) {
      return 'WORKDAY_INTENSIVE';
    }

    // 5. Check for Summer Period
    if (config) {
      const summerStart = parseISO(config.summer_start_date);
      const summerEnd = parseISO(config.summer_end_date);
      
      if (isWithinInterval(date, { start: summerStart, end: summerEnd })) {
        return 'WORKDAY_INTENSIVE';
      }
    }

    // 6. Default: Full Workday
    return 'WORKDAY_FULL';
  },

  /**
   * Calculates the count of each day type within a date range.
   */
  calculateDayTypeBreakdown: (
    startDate: Date,
    endDate: Date,
    holidays: Holiday[],
    config: CalendarConfig | null,
    specialDays: SpecialWorkday[]
  ) => {
    const breakdown = {
      WORKDAY_FULL: 0,
      WORKDAY_INTENSIVE: 0,
      HOLIDAY: 0,
      WEEKEND: 0,
      total_workdays: 0
    };

    let current = new Date(startDate);
    while (current <= endDate) {
      const type = calendarService.getDayType(current, holidays, config, specialDays);
      breakdown[type]++;
      
      if (type === 'WORKDAY_FULL' || type === 'WORKDAY_INTENSIVE') {
        breakdown.total_workdays++;
      }

      current.setDate(current.getDate() + 1);
    }

    return breakdown;
  }
};
