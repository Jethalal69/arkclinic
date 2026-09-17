import { useState, FC, FormEvent } from 'react';
import { Calendar as CalendarIcon, Clock, UserCheck, ArrowRight } from 'lucide-react';
import './AppointmentBar.css';

interface AppointmentBarProps {
  onCheckAvailability?: (details: { doctor: string; date: string; time: string }) => void;
}

export const AppointmentBar: FC<AppointmentBarProps> = ({ onCheckAvailability }) => {
  const [doctor, setDoctor] = useState('All Specialists & General Medicine');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('Morning (09:00 AM - 01:00 PM)');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (onCheckAvailability) {
      onCheckAvailability({ doctor, date, time: timeSlot });
    } else {
      const msg = encodeURIComponent(
        `Hello ARK Clinic, I would like to check appointment availability.\n• Department/Doctor: ${doctor}\n• Date: ${date}\n• Preferred Time: ${timeSlot}`
      );
      window.open(`https://wa.me/919258750828?text=${msg}`, '_blank');
    }
  };

  return (
    <div className="appointment-bar-section" id="booking-bar">
      <div className="appointment-bar-card">
        {/* Header messaging */}
        <div className="appointment-bar-header">
          <div className="appointment-title-wrap">
            <span className="appointment-badge">EASY SCHEDULING</span>
            <h3 className="appointment-title font-display">Find a suitable time</h3>
          </div>
          <p className="appointment-subtitle">
            Book your appointment in a few clicks
          </p>
        </div>

        {/* Interactive Booking Form */}
        <form className="appointment-form" onSubmit={handleSubmit}>
          {/* Field 1: Doctor / Department */}
          <div className="form-group">
            <label htmlFor="doctor-select" className="form-label">
              <UserCheck size={14} className="label-icon" />
              <span>Select Doctor / Department</span>
            </label>
            <div className="select-wrapper">
              <select
                id="doctor-select"
                className="form-select"
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
              >
                <option value="All Specialists & General Medicine">All Doctors / General Medicine</option>
                <option value="Senior Physician Consultation">Senior Physician Consultation</option>
                <option value="Pediatrics & Family Care">Pediatrics & Family Care</option>
                <option value="Home Visit Doctor">Home Visit Physician</option>
                <option value="Online Video Consultation">Online Video Consultation</option>
              </select>
            </div>
          </div>

          {/* Field 2: Date */}
          <div className="form-group">
            <label htmlFor="date-select" className="form-label">
              <CalendarIcon size={14} className="label-icon" />
              <span>Select Date</span>
            </label>
            <input
              id="date-select"
              type="date"
              className="form-input"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Field 3: Time Slot */}
          <div className="form-group">
            <label htmlFor="time-select" className="form-label">
              <Clock size={14} className="label-icon" />
              <span>Select Time</span>
            </label>
            <div className="select-wrapper">
              <select
                id="time-select"
                className="form-select"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
              >
                <option value="Morning (09:00 AM - 01:00 PM)">Morning (09:00 AM - 01:00 PM)</option>
                <option value="Afternoon (01:00 PM - 05:00 PM)">Afternoon (01:00 PM - 05:00 PM)</option>
                <option value="Evening (05:00 PM - 09:00 PM)">Evening (05:00 PM - 09:00 PM)</option>
                <option value="Immediate / First Available">Immediate / First Available</option>
              </select>
            </div>
          </div>

          {/* Action Button */}
          <div className="form-action">
            <button type="submit" className="appointment-submit-btn">
              <span>Check Availability</span>
              <ArrowRight size={16} className="btn-arrow" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
