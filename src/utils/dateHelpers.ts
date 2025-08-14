import { format, parseISO, startOfDay } from 'date-fns';

export function formatDateString(date: Date): string {
  // Format date as YYYY-MM-DD in local timezone
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateString(dateStr: string): Date {
  // Parse YYYY-MM-DD string as local midnight
  return new Date(dateStr + 'T00:00:00');
}

export function getDisplayDateString(dateStr: string): string {
  // Parse and reformat for consistent display
  const date = parseDateString(dateStr);
  return format(date, 'yyyy-MM-dd');
}

export function isSameDay(date1: Date, date2Str: string): boolean {
  const date2 = parseDateString(date2Str);
  return format(date1, 'yyyy-MM-dd') === format(date2, 'yyyy-MM-dd');
}
