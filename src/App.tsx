import { useState, useEffect } from 'react';
import { HeroSection } from './components/Hero/HeroSection';
import { AboutSection } from './components/About/AboutSection';
import { ServicesSection } from './components/Services/ServicesSection';
import { AppointmentSection } from './components/Appointment/AppointmentSection';
import { DoctorsSection } from './components/Doctors/DoctorsSection';
import { ContactSection } from './components/Contact/ContactSection';
import { Footer } from './components/Footer/Footer';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import './App.css';

export function App() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Determine current view from URL pathname or hash
  const getCurrentRoute = (): 'home' | 'admin' => {
    if (typeof window === 'undefined') return 'home';
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();

    if (
      path === '/admin' ||
      path === '/admin/' ||
      hash === '#admin' ||
      hash === '#/admin' ||
      search.includes('view=admin') ||
      search.includes('route=admin')
    ) {
      return 'admin';
    }
    return 'home';
  };

  const [route, setRoute] = useState<'home' | 'admin'>(getCurrentRoute);

  useEffect(() => {
    const handleLocationChange = () => {
      setRoute(getCurrentRoute());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (newRoute: 'home' | 'admin') => {
    if (newRoute === 'admin') {
      window.history.pushState(null, '', '/admin');
    } else {
      window.history.pushState(null, '', '/');
    }
    setRoute(newRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  // Render Admin Dashboard if route is 'admin'
  if (route === 'admin') {
    return <AdminDashboard onNavigateHome={() => navigateTo('home')} />;
  }

  // Render Public Clinic Website
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
      <Footer onNavigateAdmin={() => navigateTo('admin')} />

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
