'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableDayColumnProps {
  date: Date;
  children: React.ReactNode;
  className?: string;
}

export function DroppableDayColumn({ date, children, className = '' }: DroppableDayColumnProps) {
  const dateStr = date.toISOString().split('T')[0];
  const { setNodeRef, isOver } = useDroppable({
    id: dateStr,
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? 'bg-blue-50' : ''} transition-colors`}
      data-date={dateStr}
    >
      {children}
    </div>
  );
}
