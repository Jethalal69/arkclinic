/**
 * Utility functions for consistent 12-hour time formatting across ARK Clinic
 */

export const formatTimeTo12Hour = (timeStr: string | null | undefined): string => {
  if (!timeStr) return '';
  const trimmed = timeStr.trim();
  if (!trimmed) return '';

  // Case 1: 12-hour format with AM/PM (e.g., "9:30 AM", "09:30 am", "02:30 PM", "2:30PM", "11:00 AM")
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
  if (match12) {
    const hours = parseInt(match12[1], 10);
    const minutes = match12[2];
    const period = match12[3].toUpperCase();
    return `${hours.toString().padStart(2, '0')}:${minutes} ${period}`;
  }

  // Case 2: 24-hour time format (e.g., "14:30", "09:00", "9:00", "00:30", "14:30:00")
  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (match24) {
    let hours = parseInt(match24[1], 10);
    const minutes = match24[2];
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${hours.toString().padStart(2, '0')}:${minutes} ${period}`;
  }

  return trimmed;
};
