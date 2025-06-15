
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';
import { useHolidays } from '@/hooks/useHolidays';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/lib/utils';
import { EventDetailsModal } from '@/components/EventDetailsModal';
import { CalendarFilters } from '@/components/CalendarFilters';

export function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [filters, setFilters] = useState({
    holidays: true,
    vacations: true,
    sickness: true,
    personal: true,
    maternity: true,
    paternity: true,
  });

  const { requests } = useLeaveRequests();
  const { holidays } = useHolidays();
  const { user } = useAuth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    if (!date) return [];

    const dateStr = date.toISOString().split('T')[0];
    const events = [];

    // Check for holidays
    if (filters.holidays) {
      const holiday = holidays.find(h => h.date === dateStr);
      if (holiday) {
        events.push({
          type: 'holiday' as const,
          title: holiday.name,
          color: 'bg-blue-100 text-blue-800',
          data: holiday,
        });
      }
    }

    // Check for approved leave requests
    const userRequests = requests.filter(r => 
      r.status === 'aprobada' && 
      (user?.role === 'rrhh' || user?.role === 'responsable' || r.user_id === user?.id)
    );

    userRequests.forEach(request => {
      const startDate = new Date(request.start_date);
      const endDate = new Date(request.end_date);
      
      if (date >= startDate && date <= endDate) {
        const shouldShow = 
          (request.type === 'vacaciones' && filters.vacations) ||
          (request.type === 'enfermedad' && filters.sickness) ||
          (request.type === 'personal' && filters.personal) ||
          (request.type === 'maternidad' && filters.maternity) ||
          (request.type === 'paternidad' && filters.paternity);

        if (shouldShow) {
          events.push({
            type: 'leave' as const,
            title: `${request.user_name} - ${request.type}`,
            color: request.type === 'vacaciones' ? 'bg-green-100 text-green-800' : 
                   request.type === 'enfermedad' ? 'bg-red-100 text-red-800' :
                   request.type === 'personal' ? 'bg-purple-100 text-purple-800' :
                   request.type === 'maternidad' ? 'bg-pink-100 text-pink-800' :
                   'bg-indigo-100 text-indigo-800',
            data: request,
          });
        }
      }
    });

    return events;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const handleFilterChange = (filterName: string, value: boolean) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      holidays: false,
      vacations: false,
      sickness: false,
      personal: false,
      maternity: false,
      paternity: false,
    });
  };

  const handleDateClick = (date: Date, events: any[]) => {
    if (events.length > 0) {
      setSelectedDate(date);
      setShowEventModal(true);
    }
  };

  const days = getDaysInMonth(currentMonth);
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filtros */}
        <CalendarFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />

        {/* Calendario Principal */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentMonth(new Date())}
              >
                Hoy
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {dayNames.map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {days.map((date, index) => {
              const events = date ? getEventsForDate(date) : [];
              const isToday = date && 
                date.toDateString() === new Date().toDateString();
              const hasEvents = events.length > 0;
              
              return (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 border border-gray-100 transition-colors ${
                    date ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
                  } ${isToday ? 'ring-2 ring-blue-500' : ''} ${
                    hasEvents ? 'cursor-pointer hover:bg-blue-50' : ''
                  }`}
                  onClick={() => date && hasEvents && handleDateClick(date, events)}
                >
                  {date && (
                    <>
                      <div className={`text-sm font-medium mb-1 ${
                        isToday ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {date.getDate()}
                      </div>
                      
                      <div className="space-y-1">
                        {events.slice(0, 2).map((event, eventIndex) => (
                          <Badge
                            key={eventIndex}
                            variant="secondary"
                            className={`text-xs px-1 py-0 w-full justify-start truncate ${event.color}`}
                          >
                            {event.title}
                          </Badge>
                        ))}
                        
                        {events.length > 2 && (
                          <div className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            +{events.length - 2} más
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center flex-wrap gap-4 mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-100 rounded"></div>
              <span className="text-sm text-gray-600">Festivos</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-100 rounded"></div>
              <span className="text-sm text-gray-600">Vacaciones</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-100 rounded"></div>
              <span className="text-sm text-gray-600">Enfermedad</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-100 rounded"></div>
              <span className="text-sm text-gray-600">Personal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de detalles de eventos */}
      <EventDetailsModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        events={selectedDateEvents}
        date={selectedDate || new Date()}
      />
    </div>
  );
}
