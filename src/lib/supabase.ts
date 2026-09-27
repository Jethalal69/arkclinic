import { createClient } from '@supabase/supabase-js';

// Environment variables or fallback defaults for the ARK CLINIC project
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iceblexwwyccfrqxxwjq.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljZWJsZXh3d3ljY2ZycXh4d2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyNjYxODYsImV4cCI6MjEwNTg0MjE4Nn0.PRPH37WsFIFPBpF3TVwQ5fXJboXj4UigryRagAiVjGk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | string;
export type AppointmentType = 'video' | 'in_person' | 'home-visit' | 'telephonic' | string;

export interface Appointment {
  id: string;
  patient_name: string;
  phone: string | null;
  email: string | null;
  doctor: string | null;
  appointment_type: AppointmentType | null;
  date: string | null;
  time: string | null;
  message: string | null;
  status: AppointmentStatus;
  meeting_link: string | null;
  calendar_event_id?: string | null;
  prescription_path?: string | null;
  created_at: string;
}

/**
 * Fetch all appointments ordered by created_at DESC
 */
export async function fetchAppointments(): Promise<{ data: Appointment[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Update the status of an appointment
 */
export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err };
  }
}

/**
 * Update meeting link of an appointment
 */
export async function updateMeetingLink(
  id: string,
  meetingLink: string
): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await supabase
      .from('appointments')
      .update({ meeting_link: meetingLink })
      .eq('id', id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err };
  }
}
