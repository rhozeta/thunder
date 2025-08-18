'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format } from 'date-fns'
import { Appointment } from '@/types/appointment'
import { StatusChip } from '@/components/ui/StatusChip'
import { getAppointmentTypeColor } from '@/utils/appointmentColors'

interface DraggableAppointmentCardProps {
  appointment: Appointment
  onClick: () => void
}

export function DraggableAppointmentCard({ appointment, onClick }: DraggableAppointmentCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: appointment.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }



  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all duration-200 ${
        isDragging ? 'opacity-50 shadow-lg scale-105' : ''
      }`}
      onClick={onClick}
    >
      <h5 className="font-medium text-gray-900 text-sm">{appointment.title}</h5>
      {appointment.description && (
        <p className="text-gray-600 text-xs mt-1 line-clamp-2">{appointment.description}</p>
      )}
      
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          {appointment.start_datetime && (
            <span>📅 {format(new Date(appointment.start_datetime), 'MMM dd, HH:mm')}</span>
          )}
          {appointment.location && (
            <span>📍 {appointment.location}</span>
          )}
        </div>
        
        {appointment.appointment_type && (
          <StatusChip
            value={appointment.appointment_type}
            color="#6B7280"
            bgColor="#F3F4F615"
            textColor="#6B7280"
            size="sm"
          />
        )}
      </div>
    </div>
  )
}
