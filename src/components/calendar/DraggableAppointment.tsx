'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { format, addMinutes, differenceInMinutes, addDays } from 'date-fns';
import { Edit } from 'lucide-react';
import { Appointment } from '@/types/appointment';
import { getAppointmentTypeColor } from '@/utils/appointmentColors';

interface DraggableAppointmentProps {
  appointment: Appointment;
  position: { top: number; height: number };
  onEdit: (appointment: Appointment) => void;
  onUpdate: (id: string, updates: Partial<Appointment>) => void;
  timeSlotHeight?: number; // Height of each hour slot in pixels
}

export function DraggableAppointment({ 
  appointment, 
  position, 
  onEdit, 
  onUpdate,
  timeSlotHeight = 60 
}: DraggableAppointmentProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [originalPosition, setOriginalPosition] = useState(position);
  const [previewTime, setPreviewTime] = useState('');
  const [currentDragPosition, setCurrentDragPosition] = useState({ top: 0, height: 0, left: 0 });

  const appointmentRef = useRef<HTMLDivElement>(null);
  const visualPositionRef = useRef(position);

  // Initialize visual position ref on mount
  useEffect(() => {
    visualPositionRef.current = position;
    setOriginalPosition(position);
    setCurrentDragPosition({ ...position, left: 0 });
  }, []);

  // Update visual position ref when not dragging/resizing
  useEffect(() => {
    if (!isDragging && !isResizing) {
      visualPositionRef.current = position;
    }
  }, [position, isDragging, isResizing]);
  const dragStateRef = useRef({
    isDragging: false,
    isResizing: false,
    dragStart: { x: 0, y: 0 },
    originalPosition: position
  });

  const [isDndDragging, setIsDndDragging] = useState(false);

  const colors = getAppointmentTypeColor(appointment.appointment_type);

  // Sync position with parent when appointment data changes
  useEffect(() => {
    if (!isDragging && !isResizing) {
      // Always use the stable visual position from ref
      setOriginalPosition(position);
      setCurrentDragPosition({ ...position, left: 0 });
      // Update the visual position ref to maintain stability
      visualPositionRef.current = position;
    }
  }, [position, isDragging, isResizing]);

  // Update ref when state changes
  dragStateRef.current = { isDragging, isResizing, dragStart, originalPosition };

  // Calculate time from pixel position
  const pixelsToMinutes = useCallback((pixels: number) => {
    return Math.round((pixels / timeSlotHeight) * 60);
  }, [timeSlotHeight]);

  // Calculate pixel position from time
  const minutesToPixels = useCallback((minutes: number) => {
    return (minutes / 60) * timeSlotHeight;
  }, [timeSlotHeight]);

  // Snap minutes to 15-minute intervals
  const snapToFifteenMinutes = useCallback((minutes: number) => {
    return Math.round(minutes / 15) * 15;
  }, []);

  // Get day column width for cross-day calculations
  const getDayColumnWidth = useCallback(() => {
    // Try to get actual width from the calendar grid - support different views
    let calendarGrid = document.querySelector('.grid-cols-7'); // WeekView
    let columnCount = 7;
    
    if (!calendarGrid) {
      calendarGrid = document.querySelector('.grid-cols-3'); // ThreeDayView
      columnCount = 3;
    }
    
    if (!calendarGrid) {
      calendarGrid = document.querySelector('.grid-cols-1'); // DayView
      columnCount = 1;
    }
    
    if (calendarGrid) {
      const gridWidth = calendarGrid.clientWidth;
      return gridWidth / columnCount;
    }
    return 200; // Fallback approximate width
  }, []);



  // Snap time to 15-minute intervals
  const snapTimeToFifteenMinutes = useCallback((date: Date) => {
    const minutes = date.getMinutes();
    const snappedMinutes = snapToFifteenMinutes(minutes);
    const newDate = new Date(date);
    newDate.setMinutes(snappedMinutes, 0, 0); // Also reset seconds and milliseconds
    return newDate;
  }, [snapToFifteenMinutes]);

  // Calculate snapped position based on drag delta
  const calculateSnappedPosition = useCallback((deltaY: number, isResize: boolean = false) => {
    // If no movement yet, keep current position to prevent jumping
    if (deltaY === 0) {
      return {
        top: originalPosition.top,
        height: originalPosition.height
      };
    }

    if (isResize) {
      // For resizing, snap the height change
      const heightChange = deltaY;
      const minutesChange = pixelsToMinutes(heightChange);
      const snappedMinutesChange = snapToFifteenMinutes(minutesChange);
      const snappedHeightChange = minutesToPixels(snappedMinutesChange);
      const newHeight = Math.max(15, originalPosition.height + snappedHeightChange); // Minimum 15px (15 minutes)
      
      return {
        top: originalPosition.top,
        height: newHeight
      };
    } else {
      // For dragging, snap the position
      const minutesMoved = pixelsToMinutes(deltaY);
      const snappedMinutesMoved = snapToFifteenMinutes(minutesMoved);
      const snappedDeltaY = minutesToPixels(snappedMinutesMoved);
      const newTop = Math.max(0, originalPosition.top + snappedDeltaY);
      
      return {
        top: newTop,
        height: originalPosition.height
      };
    }
  }, [pixelsToMinutes, minutesToPixels, snapToFifteenMinutes, originalPosition]);

  // Calculate preview time for display (must match handleMouseUp logic exactly)
  const calculatePreviewTime = useCallback((deltaY: number, isResize: boolean = false) => {
    const currentStart = new Date(appointment.start_datetime);
    
    if (isResize) {
      // Show new end time (match handleMouseUp resize logic)
      const minutesChange = pixelsToMinutes(deltaY);
      const currentEnd = appointment.end_datetime ? new Date(appointment.end_datetime) : addMinutes(currentStart, 60);
      const tentativeNewEnd = addMinutes(currentEnd, minutesChange);
      const snappedNewEnd = snapTimeToFifteenMinutes(tentativeNewEnd);
      
      return `${format(currentStart, 'HH:mm')} - ${format(snappedNewEnd, 'HH:mm')}`;
    } else {
      // Show new start time (match handleMouseUp drag logic exactly)
      const minutesMoved = pixelsToMinutes(deltaY);
      const tentativeNewStart = addMinutes(currentStart, minutesMoved);
      const snappedNewStart = snapTimeToFifteenMinutes(tentativeNewStart);
      
      // Calculate new end time (maintain duration)
      const currentEnd = appointment.end_datetime ? new Date(appointment.end_datetime) : null;
      const duration = currentEnd ? differenceInMinutes(currentEnd, currentStart) : 60;
      const snappedNewEnd = addMinutes(snappedNewStart, duration);
      
      return `${format(snappedNewStart, 'HH:mm')} - ${format(snappedNewEnd, 'HH:mm')}`;
    }
  }, [appointment, pixelsToMinutes, snapTimeToFifteenMinutes]);

  // Handle mouse move during drag/resize
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const { isDragging, isResizing, dragStart, originalPosition } = dragStateRef.current;
    if (!isDragging && !isResizing) return;

    const deltaY = e.clientY - dragStart.y;
    const deltaX = e.clientX - dragStart.x;
    
    if (isDragging) {
      // Follow cursor smoothly (no jumping)
      const newTop = Math.max(0, originalPosition.top + deltaY);
      
      // Calculate cross-day movement for visual positioning
      const dayColumnWidth = getDayColumnWidth();
      const visualDayOffset = deltaX; // Use raw deltaX for smooth visual following
      
      // Calculate snapped preview time for tooltip
      const preview = calculatePreviewTime(deltaY, false);
      setPreviewTime(preview);
      
      // Update visual position state with cross-day offset
      setCurrentDragPosition({ 
        top: newTop, 
        height: originalPosition.height,
        left: visualDayOffset // Add horizontal offset for cross-day dragging
      });
      
      // Update DOM element position for immediate visual feedback
      if (appointmentRef.current) {
        appointmentRef.current.style.transform = `translateX(${visualDayOffset}px)`;
      }
    } else if (isResizing) {
      // For resize, snap the height
      const snapped = calculateSnappedPosition(deltaY, true);
      const preview = calculatePreviewTime(deltaY, true);
      
      setPreviewTime(preview);
      
      // Update visual position state
      setCurrentDragPosition({ top: originalPosition.top, height: snapped.height, left: 0 });
    }
  }, [calculateSnappedPosition, calculatePreviewTime, getDayColumnWidth]);

  // Handle mouse up (end drag/resize)
  const handleMouseUp = useCallback((e: MouseEvent) => {
    const { isDragging, isResizing, dragStart } = dragStateRef.current;
    if (!isDragging && !isResizing) return;

    const deltaY = e.clientY - dragStart.y;
    const deltaX = e.clientX - dragStart.x;
    
    let finalTop = position.top;
    let finalHeight = position.height;

    if (isDragging) {
      // Calculate new start time with 15-minute snapping
      const minutesMoved = pixelsToMinutes(deltaY);
      const currentStart = new Date(appointment.start_datetime);
      const tentativeNewStart = addMinutes(currentStart, minutesMoved);
      const snappedNewStart = snapTimeToFifteenMinutes(tentativeNewStart);
      
      // Calculate new end time (maintain duration)
      const currentEnd = appointment.end_datetime ? new Date(appointment.end_datetime) : null;
      const duration = currentEnd ? differenceInMinutes(currentEnd, currentStart) : 60;
      const snappedNewEnd = addMinutes(snappedNewStart, duration);
      
      // Calculate final visual position based on snapped time
      const startOfDay = new Date(snappedNewStart);
      startOfDay.setHours(0, 0, 0, 0);
      const minutesFromStart = differenceInMinutes(snappedNewStart, startOfDay);
      finalTop = minutesToPixels(minutesFromStart);
      
      // Check for cross-day movement with better boundary detection
      const dayColumnWidth = getDayColumnWidth();
      
      // More precise day calculation that accounts for column boundaries
      // Only switch days when we're clearly past the center of the adjacent column
      let daysMoved = 0;
      if (Math.abs(deltaX) > dayColumnWidth * 0.3) { // 30% threshold to avoid edge sensitivity
        daysMoved = Math.round(deltaX / dayColumnWidth);
      }
      
      const newStart = snapTimeToFifteenMinutes(snappedNewStart);
      const newEnd = addMinutes(newStart, duration);
      
      if (daysMoved !== 0) {
        // Cross-day movement - update date but keep time
        const finalDate = addDays(newStart, daysMoved);
        const finalEnd = addDays(newEnd, daysMoved);
        
        onUpdate(appointment.id, {
          start_datetime: finalDate.toISOString(),
          end_datetime: finalEnd.toISOString()
        });
      } else {
        // Same day movement
        onUpdate(appointment.id, {
          start_datetime: newStart.toISOString(),
          end_datetime: newEnd.toISOString()
        });
      }
    } else if (isResizing) {
      // Calculate new end time based on new height with 15-minute snapping
      const heightChange = deltaY;
      const minutesChange = pixelsToMinutes(heightChange);
      const currentStart = new Date(appointment.start_datetime);
      const currentEnd = appointment.end_datetime ? new Date(appointment.end_datetime) : addMinutes(currentStart, 60);
      const tentativeNewEnd = addMinutes(currentEnd, minutesChange);
      const snappedNewEnd = snapTimeToFifteenMinutes(tentativeNewEnd);
      
      // Ensure minimum 15-minute duration
      const newDuration = differenceInMinutes(snappedNewEnd, currentStart);
      if (newDuration >= 15) {
        // Calculate final visual height based on snapped duration
        finalHeight = minutesToPixels(newDuration);
        
        onUpdate(appointment.id, {
          end_datetime: snappedNewEnd.toISOString()
        });
      }
    }

    // Update visual position ref to prevent flicker
    visualPositionRef.current = { top: finalTop, height: finalHeight };
    
    setIsDragging(false);
    setIsResizing(false);
    setPreviewTime('');
    setCurrentDragPosition({ top: finalTop, height: finalHeight, left: 0 });
    
    // Reset transform on drag end
    if (appointmentRef.current) {
      appointmentRef.current.style.transform = '';
    }
    
    // Set final snapped position to prevent jump back
    if (appointmentRef.current) {
      appointmentRef.current.style.top = `${finalTop}px`;
      appointmentRef.current.style.height = `${finalHeight}px`;
    }
    
    // Remove event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [pixelsToMinutes, appointment, onUpdate, position]);

  // Handle appointment drag start
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Don't start drag if clicking on edit button or resize handle
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button') || target.classList.contains('cursor-ns-resize')) {
      return;
    }
    
    e.preventDefault();
    
    // Update both state and ref immediately using current visual position
    const newDragStart = { x: e.clientX, y: e.clientY };
    const newOriginalPosition = { top: visualPositionRef.current.top, height: visualPositionRef.current.height };
    
    setIsDragging(true);
    setDragStart(newDragStart);
    setOriginalPosition(newOriginalPosition);
    setCurrentDragPosition({ ...newOriginalPosition, left: 0 });
    
    // Update ref immediately for mouse move handler
    dragStateRef.current = {
      isDragging: true,
      isResizing: false,
      dragStart: newDragStart,
      originalPosition: newOriginalPosition
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [position, handleMouseMove, handleMouseUp]);

  // Handle resize start (bottom edge)
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Update both state and ref immediately using current visual position
    const newDragStart = { x: e.clientX, y: e.clientY };
    const newOriginalPosition = { top: visualPositionRef.current.top, height: visualPositionRef.current.height };
    
    setIsResizing(true);
    setDragStart(newDragStart);
    setOriginalPosition(newOriginalPosition);
    setCurrentDragPosition({ ...newOriginalPosition, left: 0 });
    
    // Update ref immediately for mouse move handler
    dragStateRef.current = {
      isDragging: false,
      isResizing: true,
      dragStart: newDragStart,
      originalPosition: newOriginalPosition
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [position, handleMouseMove, handleMouseUp]);



  // Format time for display
  const formatTime = (datetime: string) => {
    return format(new Date(datetime), 'HH:mm');
  };

  // Always use visualPositionRef as the stable source of truth
  const visualTop = isDragging || isResizing ? currentDragPosition.top : visualPositionRef.current.top;
  const visualHeight = isDragging || isResizing ? currentDragPosition.height : visualPositionRef.current.height;
  
  return (
    <div
      ref={appointmentRef}
      className={`absolute left-1 right-1 rounded-md shadow-sm ${
        isDragging ? 'opacity-75 ring-2 ring-blue-500 z-50' : 'hover:shadow-md'
      } ${colors.bg} ${colors.text}`}
      style={{
        top: `${visualTop}px`,
        height: `${visualHeight}px`,
        minHeight: '20px',
        transition: isDragging || isResizing ? 'none' : 'all 200ms ease-out',
        // Ensure visibility during cross-day dragging
        overflow: 'visible',
        zIndex: isDragging ? 1000 : 'auto'
      }}
    >
      <div 
        className="p-1 h-full flex flex-col justify-between text-xs cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="flex justify-between items-start">
          <span className="font-medium truncate">{appointment.title}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(appointment);
            }}
            className="ml-1 p-0.5 rounded hover:bg-black hover:bg-opacity-10 flex-shrink-0"
          >
            <Edit size={12} />
          </button>
        </div>
        <div className="text-xs opacity-75">
          {previewTime || `${formatTime(appointment.start_datetime)} - ${formatTime(appointment.end_datetime || appointment.start_datetime)}`}
        </div>
        
        {/* Location - only show if there's space */}
        {appointment.location && (
          <div className={`${colors.text} text-xs opacity-60 truncate leading-tight flex-shrink-0`}>
            📍 {appointment.location}
          </div>
        )}
      </div>
      
      {/* Resize handle */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-black hover:bg-opacity-20"
        onMouseDown={handleResizeStart}
        title="Drag to resize appointment duration"
      />
      
      {/* Tooltip - positioned to stay visible during cross-day dragging */}
      {(isDragging || isResizing) && previewTime && (
        <div 
          className="absolute bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap"
          style={{
            top: '-32px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1001
          }}
        >
          {previewTime}
        </div>
      )}
    </div>
  );
}
