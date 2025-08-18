import { DEFAULT_APPOINTMENT_TYPES } from '@/types/appointment';

// Color mapping for appointment types
export const APPOINTMENT_TYPE_COLORS: Record<string, { bg: string; border: string; text: string; hover: string }> = {
  'Property Showing': { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-900', hover: 'hover:bg-blue-200' },
  'Listing Appointment': { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-900', hover: 'hover:bg-green-200' },
  'Buyer Consultation': { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-900', hover: 'hover:bg-purple-200' },
  'Seller Consultation': { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-900', hover: 'hover:bg-orange-200' },
  'Home Inspection': { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-900', hover: 'hover:bg-red-200' },
  'Appraisal Meeting': { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-900', hover: 'hover:bg-yellow-200' },
  'Closing Meeting': { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-900', hover: 'hover:bg-emerald-200' },
  'Open House': { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-900', hover: 'hover:bg-pink-200' },
  'Market Analysis Meeting': { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-900', hover: 'hover:bg-indigo-200' },
  'Contract Review': { bg: 'bg-teal-100', border: 'border-teal-300', text: 'text-teal-900', hover: 'hover:bg-teal-200' },
  'Photography Session': { bg: 'bg-cyan-100', border: 'border-cyan-300', text: 'text-cyan-900', hover: 'hover:bg-cyan-200' },
  'Client Follow-up': { bg: 'bg-lime-100', border: 'border-lime-300', text: 'text-lime-900', hover: 'hover:bg-lime-200' },
  'Networking Event': { bg: 'bg-violet-100', border: 'border-violet-300', text: 'text-violet-900', hover: 'hover:bg-violet-200' },
  'Training/Education': { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-900', hover: 'hover:bg-amber-200' },
  'Administrative Meeting': { bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-900', hover: 'hover:bg-slate-200' },
};

// Default color for unknown appointment types
export const DEFAULT_APPOINTMENT_COLOR = {
  bg: 'bg-gray-100',
  border: 'border-gray-300', 
  text: 'text-gray-900',
  hover: 'hover:bg-gray-200'
};

/**
 * Get color classes for an appointment type
 */
export function getAppointmentTypeColor(appointmentType?: string) {
  if (!appointmentType) return DEFAULT_APPOINTMENT_COLOR;
  return APPOINTMENT_TYPE_COLORS[appointmentType] || DEFAULT_APPOINTMENT_COLOR;
}

/**
 * Get all available appointment type colors for UI display
 */
export function getAllAppointmentTypeColors() {
  return DEFAULT_APPOINTMENT_TYPES.map(type => ({
    type,
    ...APPOINTMENT_TYPE_COLORS[type]
  }));
}
