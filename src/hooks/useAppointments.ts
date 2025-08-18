import { useState, useEffect } from 'react';
import { Appointment } from '@/types/appointment';
import { AppointmentService } from '@/services/appointments';
import { supabase } from '@/lib/supabase';

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!userId) {
        setAppointments([]);
        return;
      }

      const data = await AppointmentService.getAppointments(userId);
      setAppointments(data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchAppointments();
    }
  }, [userId]);

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      if (!userId) throw new Error('User not authenticated');
      if (!id) throw new Error('Appointment ID is required');
      
      await AppointmentService.updateAppointment(id, updates);
      await fetchAppointments(); // Refresh the list
    } catch (err) {
      console.error('Error updating appointment:', err);
      setError(err instanceof Error ? err.message : 'Failed to update appointment');
      throw err;
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      if (!userId) throw new Error('User not authenticated');
      
      await AppointmentService.deleteAppointment(id);
      await fetchAppointments(); // Refresh the list
    } catch (err) {
      console.error('Error deleting appointment:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete appointment');
      throw err;
    }
  };

  const createAppointment = async (appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (!userId) throw new Error('User not authenticated');
      
      const newAppointment = await AppointmentService.createAppointment({
        ...appointment,
        assigned_user_id: userId
      });
      await fetchAppointments(); // Refresh the list
      return newAppointment;
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError(err instanceof Error ? err.message : 'Failed to create appointment');
      throw err;
    }
  };

  return {
    appointments,
    loading,
    error,
    updateAppointment,
    deleteAppointment,
    createAppointment,
    refetch: fetchAppointments
  };
}
