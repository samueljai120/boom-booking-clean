import React from 'react';
import { Calendar } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { format, startOfWeek, endOfWeek, addDays, isSameDay, isBefore, isAfter, addWeeks } from 'date-fns';

const DatePicker = ({ selectedDate, onDateChange }) => {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // Sunday
  const weekEnd = endOfWeek(today, { weekStartsOn: 0 });

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      days.push(day);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  const isToday = (date) => {
    return isSameDay(date, today);
  };

  const isSelected = (date) => {
    return isSameDay(date, selectedDate);
  };

  const isPast = (date) => {
    return isBefore(date, today);
  };

  const handleDateClick = (date) => {
    if (!isPast(date)) {
      onDateChange(date);
    }
  };

  const goToToday = () => {
    onDateChange(today);
  };

  const goToPreviousDay = () => {
    const prevDay = addDays(selectedDate, -1);
    onDateChange(prevDay);
  };

  const goToNextDay = () => {
    const nextDay = addDays(selectedDate, 1);
    onDateChange(nextDay);
  };

  return (
    <Card className="w-80">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Calendar className="w-5 h-5" />
          <span>Calendar</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousDay}
            className="p-2"
          >
            ←
          </Button>
          
          <div className="text-center">
            <div className="font-medium text-gray-900">
              {format(selectedDate, 'MMMM yyyy')}
            </div>
            <div className="text-sm text-gray-500">
              {format(selectedDate, 'EEEE, MMM d')}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextDay}
            className="p-2"
          >
            →
          </Button>
        </div>

        {/* Today Button */}
        <Button
          variant="secondary"
          onClick={goToToday}
          className="w-full"
        >
          Today
        </Button>

        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div
                key={index}
                className="text-center text-xs font-medium text-gray-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <button
                key={index}
                onClick={() => handleDateClick(day)}
                disabled={isPast(day)}
                className={`
                  aspect-square flex items-center justify-center text-sm font-medium rounded-lg transition-colors
                  ${isSelected(day)
                    ? 'bg-primary-600 text-white'
                    : isToday(day)
                    ? 'bg-primary-100 text-primary-700 font-semibold'
                    : isPast(day)
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                {format(day, 'd')}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Date Navigation */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Quick Jump
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDateChange(addDays(today, 1))}
              className="text-xs"
            >
              Tomorrow
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDateChange(addDays(today, 7))}
              className="text-xs"
            >
              Next Week
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatePicker;
