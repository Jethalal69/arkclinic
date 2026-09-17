import { useState } from 'react';
import { HeroSection } from './components/Hero/HeroSection';
import { AboutSection } from './components/About/AboutSection';
import { ServicesSection } from './components/Services/ServicesSection';
import { AppointmentSection } from './components/Appointment/AppointmentSection';
import { DoctorsSection } from './components/Doctors/DoctorsSection';
import { ContactSection } from './components/Contact/ContactSection';
import { Footer } from './components/Footer/Footer';
import './App.css';

export function App() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleBookAppointment = () => {
    const appointmentElement = document.getElementById('appointment');
    if (appointmentElement) {
      appointmentElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.open(
        'https://wa.me/919258750828?text=Hello%20ARK%20Clinic%2C%20I%20would%20like%20to%20book%20an%20appointment.',
        '_blank'
      );
    }
  };

  const handleVideoConsultation = () => {
    const appointmentElement = document.getElementById('appointment');
    if (appointmentElement) {
      appointmentElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      showToast('Opening video consultation scheduler...');
    }
  };

  return (
    <div className="app-wrapper">
      {/* Background ambient lighting effects */}
      <div className="ambient-decor-bl" aria-hidden="true" />

      {/* Hero Section */}
      <HeroSection
        onBookAppointment={handleBookAppointment}
        onVideoConsultation={handleVideoConsultation}
      />

      {/* About Section */}
      <AboutSection />

      {/* Services Section */}
      <ServicesSection />

      {/* Appointment Booking Section */}
      <AppointmentSection />

      {/* Doctors Section */}
      <DoctorsSection />

      {/* Contact Section */}
      <ContactSection />

      {/* Footer Section */}
      <Footer />

      {/* Interactive Toast Notification */}
      {toastMessage && (
        <div className="global-toast" role="alert">
          <span>{toastMessage}</span>
          <button
            type="button"
            className="toast-close"
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
