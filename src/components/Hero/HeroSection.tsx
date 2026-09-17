import { FC } from 'react';
import heroVideo from '../../../assets/ark-hero-bg-loop.mp4';
import { Header } from '../Header/Header';
import './HeroSection.css';

interface HeroSectionProps {
  onBookAppointment?: () => void;
  onVideoConsultation?: () => void;
}

export const HeroSection: FC<HeroSectionProps> = ({
  onBookAppointment,
  onVideoConsultation,
}) => {
  const handleBookClick = () => {
    if (onBookAppointment) {
      onBookAppointment();
    } else {
      const el = document.getElementById('appointment');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleVideoClick = () => {
    if (onVideoConsultation) {
      onVideoConsultation();
    } else {
      const el = document.getElementById('appointment');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleScrollDown = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const aboutEl = document.getElementById('about') || document.getElementById('services');
    if (aboutEl) {
      aboutEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="hero-section" id="home">
      {/* Background Biotech / DNA Loop Video (Smooth ping-pong loop) */}
      <video
        className="hero-video-bg"
        src={heroVideo}
        poster="/images/services-dna-bg.jpeg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        controls={false}
        aria-hidden="true"
      />

      {/* Optical Contrast Vignette Gradient Overlay */}
      <div className="hero-vignette-overlay" aria-hidden="true" />

      {/* Header Navigation */}
      <Header onBookAppointment={onBookAppointment} />

      {/* Main Centered Hero Content */}
      <div className="hero-content-wrapper container">
        <div className="hero-content-inner">
          {/* Eyebrow */}
          <div className="hero-eyebrow-wrap">
            <span className="hero-eyebrow">
              PERSONALIZED CARE. FOR A HEALTHIER YOU.
            </span>
          </div>

          {/* Main Headline: 3-Line Editorial Composition */}
          <h1 className="hero-headline font-display">
            <span className="hero-headline-line1">Better Health</span>
            <span className="hero-headline-line2">for a Brighter</span>
            <span className="hero-headline-line3">Tomorrow.</span>
          </h1>

          {/* Supporting Text */}
          <p className="hero-description">
            Quality healthcare, wherever you need it — in clinic, online, or at home.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="hero-cta-group">
            <button
              type="button"
              className="hero-btn-primary"
              onClick={handleBookClick}
              aria-label="Book an Appointment"
            >
              <span>Book an Appointment</span>
              <span className="hero-btn-arrow" aria-hidden="true">→</span>
            </button>

            <button
              type="button"
              className="hero-btn-secondary"
              onClick={handleVideoClick}
              aria-label="Schedule Video Consultation"
            >
              <span>Video Consultation</span>
            </button>
          </div>

          {/* Trust / Statistics Row */}
          <div className="hero-trust-row" aria-label="Key Clinic Information">
            <div className="trust-item">
              <span className="trust-stat">3</span>
              <span className="trust-label">Experienced Physicians</span>
            </div>

            <div className="trust-divider" aria-hidden="true" />

            <div className="trust-item">
              <span className="trust-stat">28+</span>
              <span className="trust-label">Years Combined Experience</span>
            </div>

            <div className="trust-divider" aria-hidden="true" />

            <div className="trust-item">
              <span className="trust-stat trust-stat-text">3 Ways to Care</span>
              <span className="trust-label">Clinic • Online • Home Visits</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Scroll Indicator */}
      <a
        href="#about"
        className="hero-scroll-indicator"
        onClick={handleScrollDown}
        aria-label="Scroll to explore"
      >
        <span className="scroll-indicator-text">Scroll to explore</span>
        <span className="scroll-indicator-arrow" aria-hidden="true">↓</span>
      </a>
    </main>
  );
};

