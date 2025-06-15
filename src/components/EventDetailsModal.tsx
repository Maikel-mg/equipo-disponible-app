
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Clock, FileText } from 'lucide-react';
import { LeaveRequest, Holiday } from '@/models/types';
import { formatDate } from '@/lib/utils';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: Array<{
    type: 'holiday' | 'leave';
    title: string;
    color: string;
    data?: LeaveRequest | Holiday;
  }>;
  date: Date;
}

export function EventDetailsModal({ isOpen, onClose, events, date }: EventDetailsModalProps) {
  if (!events.length) return null;

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'holiday': return <Calendar className="w-4 h-4" />;
      case 'leave': return <User className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>{formatDate(date, 'dd MMMM yyyy')}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getEventIcon(event.type)}
                  <span className="font-medium">{event.title}</span>
                </div>
                <Badge variant="secondary" className={event.color}>
                  {event.type === 'holiday' ? 'Festivo' : 'Ausencia'}
                </Badge>
              </div>
              
              {event.data && 'reason' in event.data && event.data.reason && (
                <div className="flex items-start space-x-2 text-sm text-gray-600">
                  <FileText className="w-4 h-4 mt-0.5" />
                  <span>{event.data.reason}</span>
                </div>
              )}
              
              {event.data && 'type' in event.data && (
                <div className="text-sm text-gray-500">
                  Tipo: {event.data.type}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
