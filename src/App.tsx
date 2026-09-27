import { useState, useEffect } from 'react';
import { HeroSection } from './components/Hero/HeroSection';
import { AboutSection } from './components/About/AboutSection';
import { ServicesSection } from './components/Services/ServicesSection';
import { AppointmentSection } from './components/Appointment/AppointmentSection';
import { DoctorsSection } from './components/Doctors/DoctorsSection';
import { ContactSection } from './components/Contact/ContactSection';
import { Footer } from './components/Footer/Footer';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { AdminLogin } from './components/Admin/AdminLogin';
import { getAdminSession, isAuthorizedAdminEmail } from './lib/auth';
import { supabase } from './lib/supabase';
import './App.css';

export function App() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

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

  // 1. Listen to URL/route changes
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

  // 2. Check and listen to Supabase Auth State
  useEffect(() => {
    let isMounted = true;

    const checkInitialSession = async () => {
      try {
        const { isAuthorized } = await getAdminSession();
        if (isMounted) {
          setIsAuthenticated(isAuthorized);
          setIsCheckingAuth(false);
        }
      } catch {
        if (isMounted) {
          setIsAuthenticated(false);
          setIsCheckingAuth(false);
        }
      }
    };

    checkInitialSession();

    // Subscribe to auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user && isAuthorizedAdminEmail(session.user.email)) {
        if (isMounted) setIsAuthenticated(true);
      } else {
        if (isMounted) setIsAuthenticated(false);
      }
      if (isMounted) setIsCheckingAuth(false);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
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

  // Render Admin View if route is 'admin'
  if (route === 'admin') {
    if (isCheckingAuth) {
      return (
        <div className="admin-auth-loading">
          <div className="admin-loading-spinner" />
          <span>Verifying Admin Authorization...</span>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <AdminLogin
          onLoginSuccess={() => setIsAuthenticated(true)}
          onNavigateHome={() => navigateTo('home')}
        />
      );
    }

    return (
      <AdminDashboard
        onNavigateHome={() => navigateTo('home')}
        onLogout={() => setIsAuthenticated(false)}
      />
    );
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
