'use client';

import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';

interface CalendarHeaderProps {
  view: 'month' | 'week' | '3day' | 'day';
  setView: (view: 'month' | 'week' | '3day' | 'day') => void;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export function CalendarHeader({ view, setView, selectedDate, onDateSelect }: CalendarHeaderProps) {
  const handlePrevious = () => {
    switch (view) {
      case 'month':
        onDateSelect(subMonths(selectedDate, 1));
        break;
      case 'week':
        onDateSelect(subWeeks(selectedDate, 1));
        break;
      case '3day':
        onDateSelect(subDays(selectedDate, 3));
        break;
      case 'day':
        onDateSelect(subDays(selectedDate, 1));
        break;
    }
  };

  const handleNext = () => {
    switch (view) {
      case 'month':
        onDateSelect(addMonths(selectedDate, 1));
        break;
      case 'week':
        onDateSelect(addWeeks(selectedDate, 1));
        break;
      case '3day':
        onDateSelect(addDays(selectedDate, 3));
        break;
      case 'day':
        onDateSelect(addDays(selectedDate, 1));
        break;
    }
  };

  const handleToday = () => {
    onDateSelect(new Date());
  };

  const getDateDisplay = () => {
    switch (view) {
      case 'month':
        return format(selectedDate, 'MMMM yyyy');
      case 'week':
        return `Week of ${format(selectedDate, 'MMM d, yyyy')}`;
      case '3day':
        return `${format(selectedDate, 'MMM d')} - ${format(addDays(selectedDate, 2), 'MMM d, yyyy')}`;
      case 'day':
        return format(selectedDate, 'EEEE, MMMM d, yyyy');
      default:
        return '';
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevious}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              title="Previous"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Today
            </button>
            
            <button
              onClick={handleNext}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <h2 className="text-lg font-semibold text-gray-700">{getDateDisplay()}</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setView('day')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              view === 'day' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setView('3day')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              view === '3day' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            3-Day
          </button>
          <button
            onClick={() => setView('week')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              view === 'week' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setView('month')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              view === 'month' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Month
          </button>
        </div>
      </div>
    </div>
  );
}
