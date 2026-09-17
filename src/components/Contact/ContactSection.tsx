import { useState, useEffect, useRef, FC, FormEvent } from 'react';
import { Phone, MessageSquare, MapPin, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import './ContactSection.css';

const InstagramIcon: FC<{ size?: number; className?: string }> = ({ size = 19, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
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

const FacebookIcon: FC<{ size?: number; className?: string }> = ({ size = 19, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

interface ContactFormData {
  fullName: string;
  phone: string;
  email: string;
  message: string;
}

export const ContactSection: FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    phone: '',
    email: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.08 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.message.trim()) {
      setErrorMsg('Please fill in all required fields (Name, Phone, and Message).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    // Simulate polished async submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);

      // Reset form after short delay
      setTimeout(() => {
        setFormData({
          fullName: '',
          phone: '',
          email: '',
          message: '',
        });
      }, 500);
    }, 800);
  };

  return (
    <section
      ref={sectionRef}
      className={`contact-section ${isVisible ? 'contact-visible' : ''}`}
      id="contact"
      aria-label="Contact ARK Clinic"
    >
      <div className="container contact-container">
        {/* Section Header */}
        <header className="contact-header">
          <div className="contact-eyebrow-wrap">
            <span className="contact-eyebrow">
              <Sparkles size={12} className="contact-eyebrow-icon" aria-hidden="true" />
              GET IN TOUCH
            </span>
          </div>
          <h2 className="contact-heading font-display">
            Here When You Need Us.
          </h2>
          <p className="contact-description">
            Have a question or need help with your consultation? Our team is here to assist you.
          </p>
        </header>

        {/* Two-Column Content Layout */}
        <div className="contact-content-grid">
          {/* LEFT COLUMN: Contact Information */}
          <div className="contact-info-col">
            <div className="contact-info-header">
              <h3 className="contact-info-heading font-display">
                Let's Talk About Your Care
              </h3>
              <p className="contact-info-subtext">
                Whether you have a question about our services, need help with an appointment, or want to know more about ARK Clinic, we're here to help.
              </p>
            </div>

            {/* 4 Contact Cards */}
            <div className="contact-cards-stack">
              {/* 1. MERGED CALL OR WHATSAPP CARD */}
              <div className="contact-card contact-card-dual">
                <div className="contact-card-main-link">
                  <div className="contact-card-icon-box" aria-hidden="true">
                    <Phone size={19} className="contact-card-icon" />
                  </div>
                  <div className="contact-card-text">
                    <span className="contact-card-label">CALL OR WHATSAPP</span>
                    <a href="tel:9258750828" className="contact-card-value contact-clickable-value" aria-label="Call 9258750828">
                      9258750828
                    </a>
                  </div>
                </div>
                <div className="contact-dual-actions">
                  <a
                    href="tel:9258750828"
                    className="contact-action-btn call-action-btn"
                    title="Call 9258750828"
                    aria-label="Call 9258750828"
                  >
                    <Phone size={13} aria-hidden="true" />
                    <span>Call</span>
                  </a>
                  <a
                    href="https://wa.me/919258750828?text=Hello%20ARK%20Clinic%2C%20I%20have%20an%20inquiry."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-action-btn whatsapp-action-btn"
                    title="WhatsApp 9258750828"
                    aria-label="WhatsApp chat with ARK Clinic"
                  >
                    <MessageSquare size={13} aria-hidden="true" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* 2. VISIT US CARD */}
              <a
                href="https://maps.google.com/?q=ARK+Clinic+Lane+No.+8+Ramnagar+Roorkee+Uttarakhand"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-card"
                aria-label="Visit Us: Lane No. 8, Ramnagar, Roorkee, Uttarakhand"
              >
                <div className="contact-card-icon-box" aria-hidden="true">
                  <MapPin size={19} className="contact-card-icon" />
                </div>
                <div className="contact-card-text">
                  <span className="contact-card-label">VISIT US</span>
                  <span className="contact-card-value">Lane No. 8, Ramnagar, Roorkee, Uttarakhand</span>
                </div>
                <div className="contact-card-arrow-wrap" aria-hidden="true">
                  <ArrowRight size={15} className="contact-card-arrow" />
                </div>
              </a>

              {/* 3. INSTAGRAM CARD */}
              <a
                href="https://www.instagram.com/arkclinicroorkee/"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-card"
                aria-label="Instagram: @arkclinicroorkee"
              >
                <div className="contact-card-icon-box" aria-hidden="true">
                  <InstagramIcon size={19} className="contact-card-icon" />
                </div>
                <div className="contact-card-text">
                  <span className="contact-card-label">INSTAGRAM</span>
                  <span className="contact-card-value">@arkclinicroorkee</span>
                </div>
                <div className="contact-card-arrow-wrap" aria-hidden="true">
                  <ArrowRight size={15} className="contact-card-arrow" />
                </div>
              </a>

              {/* 4. FACEBOOK CARD */}
              <a
                href="https://www.facebook.com/people/Arkclinicroorkee/61592919297480/?ref=PROFILE_EDIT_xav_ig_profile_page_web#"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-card"
                aria-label="Facebook: ARK Clinic Roorkee"
              >
                <div className="contact-card-icon-box" aria-hidden="true">
                  <FacebookIcon size={19} className="contact-card-icon" />
                </div>
                <div className="contact-card-text">
                  <span className="contact-card-label">FACEBOOK</span>
                  <span className="contact-card-value">ARK Clinic Roorkee</span>
                </div>
                <div className="contact-card-arrow-wrap" aria-hidden="true">
                  <ArrowRight size={15} className="contact-card-arrow" />
                </div>
              </a>
            </div>
          </div>

          {/* RIGHT COLUMN: Liquid Glass Contact Form */}
          <div className="contact-form-col">
            <div className="contact-form-glass-card">
              <div className="contact-form-inner">
                <h3 className="contact-form-title font-display">
                  Send Us a Message
                </h3>

                {isSubmitted ? (
                  <div className="contact-success-state" role="status">
                    <div className="success-icon-wrap" aria-hidden="true">
                      <CheckCircle2 size={44} className="success-icon" />
                    </div>
                    <h4 className="success-heading font-display">Message Sent Successfully</h4>
                    <p className="success-message">
                      Thank you for contacting ARK Clinic. Our medical team will get back to you promptly.
                    </p>
                    <button
                      type="button"
                      className="contact-reset-btn"
                      onClick={() => setIsSubmitted(false)}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form className="contact-form" onSubmit={handleSubmit} noValidate>
                    {errorMsg && (
                      <div className="contact-error-alert" role="alert">
                        {errorMsg}
                      </div>
                    )}

                    {/* Full Name */}
                    <div className="contact-field-group">
                      <label htmlFor="contact-full-name" className="contact-field-label">
                        Full Name <span className="field-required">*</span>
                      </label>
                      <input
                        id="contact-full-name"
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="contact-input"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="contact-field-group">
                      <label htmlFor="contact-phone" className="contact-field-label">
                        Phone Number <span className="field-required">*</span>
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your 10-digit phone number"
                        className="contact-input"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Email Address */}
                    <div className="contact-field-group">
                      <label htmlFor="contact-email" className="contact-field-label">
                        Email Address <span className="field-optional">(Optional)</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="name@example.com"
                        className="contact-input"
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Message */}
                    <div className="contact-field-group">
                      <label htmlFor="contact-message" className="contact-field-label">
                        Message <span className="field-required">*</span>
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="How can our physicians help you today?"
                        className="contact-textarea"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="contact-submit-btn"
                      disabled={isSubmitting}
                    >
                      <span>{isSubmitting ? 'Sending Message...' : 'Send Message'}</span>
                      <ArrowRight size={16} className="contact-submit-arrow" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
