import { useState, useEffect, useRef, FC } from 'react';
import { Phone, ArrowRight, Menu, X } from 'lucide-react';
import './Header.css';

interface HeaderProps {
  onBookAppointment?: () => void;
}

export const Header: FC<HeaderProps> = ({ onBookAppointment }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sliding hover highlight pill state
  const [hoverStyle, setHoverStyle] = useState<{
    left: number;
    width: number;
    opacity: number;
  }>({ left: 0, width: 0, opacity: 0 });

  const navListRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // 5 navigation items: Home, About, Services, Doctors, Contact
  const navItems = [
    { id: 'home', label: 'Home', href: '#home' },
    { id: 'about', label: 'About', href: '#about' },
    { id: 'services', label: 'Services', href: '#services' },
    { id: 'doctors', label: 'Doctors', href: '#doctors' },
    { id: 'contact', label: 'Contact', href: '#contact' },
  ];

  const handleNavMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const linkEl = e.currentTarget;
    const navList = navListRef.current;
    if (navList) {
      const linkRect = linkEl.getBoundingClientRect();
      const navRect = navList.getBoundingClientRect();
      setHoverStyle({
        left: linkRect.left - navRect.left,
        width: linkRect.width,
        opacity: 1,
      });
    }
  };

  const handleNavMouseLeave = () => {
    setHoverStyle((prev) => ({
      ...prev,
      opacity: 0,
    }));
  };

  const handleNavLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    setMobileMenuOpen(false);
    if (href.startsWith('#')) {
      const targetId = href.replace('#', '');
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleBookClick = () => {
    setMobileMenuOpen(false);
    if (onBookAppointment) {
      onBookAppointment();
    } else {
      const el = document.getElementById('appointment');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      className={`site-header ${isScrolled ? 'scrolled' : ''}`}
      role="banner"
    >
      <div className="header-container container">
        {/* LEFT: ARK CLINIC Logo / Wordmark */}
        <a
          href="#home"
          className="brand-lockup"
          onClick={(e) => handleNavLinkClick(e, '#home')}
          aria-label="ARK Clinic Home"
        >
          <div className="logo-emblem-wrap">
            <img
              src="/images/ark-logo.png"
              alt="ARK Clinic Emblem"
              className="logo-emblem"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="brand-text">
            <span className="brand-name">ARK CLINIC</span>
            <span className="brand-tagline">YOUR HEALTH, OUR FIRST PRIORITY</span>
          </div>
        </a>

        {/* CENTER: Navigation Links floating directly over animated background */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          <ul
            className="nav-list"
            ref={navListRef}
            onMouseLeave={handleNavMouseLeave}
          >
            {/* Smooth Sliding Hover Pill (Appears only on hover) */}
            <li
              className="nav-hover-pill"
              aria-hidden="true"
              style={{
                transform: `translateX(${hoverStyle.left}px) translateY(-50%)`,
                width: `${hoverStyle.width}px`,
                opacity: hoverStyle.opacity,
              }}
            />

            {navItems.map((item) => (
              <li key={item.id} className="nav-item">
                <a
                  href={item.href}
                  className="nav-link"
                  onMouseEnter={handleNavMouseEnter}
                  onClick={(e) => handleNavLinkClick(e, item.href)}
                >
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* RIGHT: Subtle Phone Number + Primary "Book an Appointment →" CTA */}
        <div className="header-actions">
          {/* Subtle direct phone link on desktop - soft opacity so main CTA shines */}
          <a
            href="tel:9258750828"
            className="contact-direct"
            aria-label="Call ARK Clinic at 9258750828"
            title="Call 9258750828"
          >
            <Phone className="contact-icon" size={14} />
            <span className="contact-number">9258750828</span>
          </a>

          {/* Primary CTA: "Book an Appointment →" */}
          <button
            type="button"
            className="header-cta-btn"
            onClick={handleBookClick}
            aria-label="Book an Appointment"
          >
            <span className="cta-text">Book an Appointment</span>
            <span className="cta-arrow" aria-hidden="true">→</span>
          </button>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            type="button"
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer Overlay */}
      <div
        className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}
        aria-hidden={!mobileMenuOpen}
      >
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
        <div className="mobile-drawer-panel" role="dialog" aria-modal="true">
          <div className="drawer-header">
            <div className="brand-lockup">
              <div className="logo-emblem-wrap small">
                <img
                  src="/images/ark-logo.png"
                  alt="ARK Clinic"
                  className="logo-emblem"
                />
              </div>
              <div className="brand-text">
                <span className="brand-name">ARK CLINIC</span>
                <span className="brand-tagline">YOUR HEALTH, OUR FIRST PRIORITY</span>
              </div>
            </div>
            <button
              type="button"
              className="drawer-close-btn"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="mobile-nav" aria-label="Mobile Navigation">
            <ul className="mobile-nav-list">
              {navItems.map((item) => (
                <li key={item.id} className="mobile-nav-item">
                  <a
                    href={item.href}
                    className="mobile-nav-link"
                    onClick={(e) => handleNavLinkClick(e, item.href)}
                  >
                    <span>{item.label}</span>
                    <ArrowRight size={15} className="mobile-link-arrow" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mobile-drawer-footer">
            <a
              href="tel:9258750828"
              className="mobile-contact-card"
              aria-label="Call 9258750828"
            >
              <div className="mobile-contact-icon">
                <Phone size={14} />
              </div>
              <div className="mobile-contact-info">
                <span className="mobile-contact-title">Direct Call / WhatsApp</span>
                <span className="mobile-contact-number">9258750828</span>
              </div>
            </a>

            <button
              type="button"
              className="mobile-cta-btn"
              onClick={handleBookClick}
            >
              <span>Book an Appointment</span>
              <span className="cta-arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

