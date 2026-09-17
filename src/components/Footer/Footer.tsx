import { useState, useEffect, useRef, FC, FormEvent } from 'react';
import { ArrowRight, Check, MapPin, Phone } from 'lucide-react';
import './Footer.css';

// Clean inline SVG social outline icons matching site design
const InstagramIcon: FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon: FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const WhatsAppIcon: FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

export const Footer: FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef<HTMLElement>(null);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.08 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setIsSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setIsSubscribed(false);
    }, 4000);
  };

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer
      ref={footerRef}
      className={`footer-section ${isVisible ? 'footer-visible' : ''}`}
      aria-label="ARK Clinic Footer"
    >
      <div className="container footer-container">
        {/* Main 5-Column Content Grid */}
        <div className="footer-main-grid">
          {/* 1. BRAND COLUMN */}
          <div className="footer-col footer-col-brand">
            <div className="footer-brand-header">
              <a href="#home" onClick={(e) => handleScrollTo(e, 'home')} className="footer-logo-link">
                <span className="footer-logo-title font-display">ARK CLINIC</span>
              </a>
              <span className="footer-logo-tagline">YOUR HEALTH, OUR FIRST PRIORITY</span>
            </div>
            <p className="footer-brand-desc">
              Compassionate care, experienced medical professionals, and a commitment to healthier tomorrows.
            </p>
            <div className="footer-social-links" aria-label="ARK Clinic Social Media">
              <a
                href="https://www.instagram.com/arkclinicroorkee/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-icon-btn"
                aria-label="Instagram profile"
              >
                <InstagramIcon size={17} />
              </a>
              <a
                href="https://www.facebook.com/people/Arkclinicroorkee/61592919297480/?ref=PROFILE_EDIT_xav_ig_profile_page_web#"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-icon-btn"
                aria-label="Facebook page"
              >
                <FacebookIcon size={17} />
              </a>
              <a
                href="https://wa.me/919258750828?text=Hello%20ARK%20Clinic%2C%20I%20have%20an%20inquiry."
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-icon-btn"
                aria-label="WhatsApp chat"
              >
                <WhatsAppIcon size={17} />
              </a>
            </div>
          </div>

          {/* 2. QUICK LINKS */}
          <div className="footer-col footer-col-links">
            <h4 className="footer-col-title font-display">Quick Links</h4>
            <ul className="footer-links-list">
              <li>
                <a href="#home" onClick={(e) => handleScrollTo(e, 'home')} className="footer-nav-link">
                  Home
                </a>
              </li>
              <li>
                <a href="#about" onClick={(e) => handleScrollTo(e, 'about')} className="footer-nav-link">
                  About
                </a>
              </li>
              <li>
                <a href="#services" onClick={(e) => handleScrollTo(e, 'services')} className="footer-nav-link">
                  Services
                </a>
              </li>
              <li>
                <a href="#doctors" onClick={(e) => handleScrollTo(e, 'doctors')} className="footer-nav-link">
                  Doctors
                </a>
              </li>
              <li>
                <a href="#contact" onClick={(e) => handleScrollTo(e, 'contact')} className="footer-nav-link">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* 3. OUR SERVICES */}
          <div className="footer-col footer-col-services">
            <h4 className="footer-col-title font-display">Our Services</h4>
            <ul className="footer-links-list">
              <li>
                <a href="#appointment" onClick={(e) => handleScrollTo(e, 'appointment')} className="footer-nav-link">
                  In-Clinic Consultation
                </a>
              </li>
              <li>
                <a href="#appointment" onClick={(e) => handleScrollTo(e, 'appointment')} className="footer-nav-link">
                  Online Video Consultation
                </a>
              </li>
              <li>
                <a href="#appointment" onClick={(e) => handleScrollTo(e, 'appointment')} className="footer-nav-link">
                  Home Visit
                </a>
              </li>
              <li>
                <a href="#appointment" onClick={(e) => handleScrollTo(e, 'appointment')} className="footer-nav-link">
                  Telephonic Consultation
                </a>
              </li>
              <li>
                <a href="#appointment" onClick={(e) => handleScrollTo(e, 'appointment')} className="footer-nav-link">
                  Family Healthcare
                </a>
              </li>
              <li>
                <a href="#appointment" onClick={(e) => handleScrollTo(e, 'appointment')} className="footer-nav-link">
                  Preventive Healthcare
                </a>
              </li>
            </ul>
          </div>

          {/* 4. CONTACT US */}
          <div className="footer-col footer-col-contact">
            <h4 className="footer-col-title font-display">Contact Us</h4>
            <div className="footer-contact-items">
              <div className="footer-contact-item">
                <span className="footer-item-label">
                  <Phone size={13} className="footer-item-icon" aria-hidden="true" />
                  Call / WhatsApp
                </span>
                <div className="footer-contact-links">
                  <a href="tel:9258750828" className="footer-contact-val">
                    9258750828
                  </a>
                </div>
              </div>

              <div className="footer-contact-item">
                <span className="footer-item-label">
                  <MapPin size={13} className="footer-item-icon" aria-hidden="true" />
                  Visit Us
                </span>
                <a
                  href="https://maps.google.com/?q=ARK+Clinic+Lane+No.+8+Ramnagar+Roorkee+Uttarakhand"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-contact-val footer-address-val"
                >
                  Lane No. 8, Ramnagar, Roorkee, Uttarakhand
                </a>
              </div>
            </div>
          </div>

          {/* 5. STAY CONNECTED */}
          <div className="footer-col footer-col-newsletter">
            <h4 className="footer-col-title font-display">Stay Connected</h4>
            <p className="footer-newsletter-text">
              Get the latest health tips, updates and announcements from ARK Clinic.
            </p>

            <form className="footer-newsletter-form" onSubmit={handleSubscribe}>
              <div className="footer-input-wrap">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="footer-email-input"
                  required
                />
                <button
                  type="submit"
                  className="footer-submit-btn"
                  aria-label="Subscribe to newsletter"
                >
                  {isSubscribed ? <Check size={14} /> : <ArrowRight size={14} />}
                </button>
              </div>
              {isSubscribed && (
                <span className="footer-subscribed-msg" role="status">
                  Thank you for subscribing!
                </span>
              )}
            </form>

            <span className="footer-privacy-note">We respect your privacy.</span>
          </div>
        </div>

        {/* BOTTOM BAR WITH GOLD HEARTBEAT DIVIDER */}
        <div className="footer-bottom-wrap">
          {/* Subtle gold heartbeat / medical pulse divider line */}
          <div className="footer-divider-container" aria-hidden="true">
            <div className="footer-divider-line" />
            <div className="footer-pulse-badge">
              <svg width="44" height="18" viewBox="0 0 44 18" fill="none" className="footer-ecg-svg">
                <path
                  d="M0 9 H13 L16 3 L20 15 L24 1 L28 13 L31 7 L34 9 H44"
                  stroke="#D4AF37"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="footer-divider-line" />
          </div>

          {/* Bottom Bar Content */}
          <div className="footer-bottom-bar">
            <p className="footer-copyright">
              © 2026 ARK Clinic. All rights reserved.
            </p>
            <div className="footer-legal-links">
              <a href="#privacy" onClick={(e) => e.preventDefault()} className="footer-legal-link">
                Privacy Policy
              </a>
              <span className="footer-legal-dot" aria-hidden="true">•</span>
              <a href="#terms" onClick={(e) => e.preventDefault()} className="footer-legal-link">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
