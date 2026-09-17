import { useState, useEffect, useRef, FC } from 'react';
import {
  ArrowRight,
  UserCheck,
  HeartHandshake,
  Clock,
  Home,
} from 'lucide-react';
import './AboutSection.css';

export const AboutSection: FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const supportingPoints = [
    {
      id: 'physicians',
      title: 'Experienced Physicians',
      icon: UserCheck,
    },
    {
      id: 'care',
      title: 'Personalised Care',
      icon: HeartHandshake,
    },
    {
      id: 'consultations',
      title: 'Convenient Consultations',
      icon: Clock,
    },
    {
      id: 'beyond',
      title: 'Care Beyond the Clinic',
      icon: Home,
    },
  ];

  const handleDoctorsClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const targetElement = document.getElementById('doctors');
    if (targetElement) {
      e.preventDefault();
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={sectionRef}
      className={`about-section ${isVisible ? 'about-visible' : ''}`}
      id="about"
      aria-label="About ARK Clinic"
    >
      {/* Light 3D DNA Helix Background with Subtle Soft-Light Veil */}
      <div className="about-bg-layer" aria-hidden="true">
        <img
          src="/images/DNA_helix_floating_in_studio_2K_20260916222953.jpeg"
          alt=""
          className="about-bg-image"
          loading="lazy"
        />
        <div className="about-light-veil" />
      </div>

      <div className="container about-container">
        <div className="about-grid">
          {/* LEFT SIDE: Narrative Content, Supporting Points & CTA */}
          <div className="about-content-col">
            {/* Small Eyebrow */}
            <div className="about-eyebrow-wrap">
              <span className="about-eyebrow">ABOUT ARK CLINIC</span>
            </div>

            {/* Main Serif Heading */}
            <h2 className="about-heading font-display">
              Healthcare That <br className="heading-br" />
              Puts You First.
            </h2>

            {/* Body Copy */}
            <p className="about-body">
              At ARK Clinic, we believe quality healthcare should be accessible,
              personalised, and built around your needs. Our experienced
              physicians provide thoughtful medical care through in-clinic
              consultations, online consultations, and home visits.
            </p>

            {/* Four Supporting Points (Clean, minimal 2x2 grid) */}
            <div className="about-points-grid">
              {supportingPoints.map((point, index) => {
                const IconComponent = point.icon;
                return (
                  <div
                    key={point.id}
                    className="about-point-item"
                    style={{ '--point-delay': `${index * 80 + 120}ms` } as React.CSSProperties}
                  >
                    <div className="point-icon-box" aria-hidden="true">
                      <IconComponent size={16} className="point-icon" />
                    </div>
                    <span className="point-title">{point.title}</span>
                  </div>
                );
              })}
            </div>

            {/* CTA to Doctors Section */}
            <div className="about-cta-wrap">
              <a
                href="#doctors"
                className="about-cta-btn"
                onClick={handleDoctorsClick}
                aria-label="Meet Our Doctors"
              >
                <span>Meet Our Doctors</span>
                <ArrowRight className="about-cta-arrow" size={16} />
              </a>
            </div>
          </div>

          {/* RIGHT SIDE: Premium Architectural Clinic Visual & Editorial Experience Accent */}
          <div className="about-visual-col">
            <div className="about-visual-frame">
              <img
                src="/images/ark-about-clinic.jpg"
                alt="ARK Clinic Modern Consultation Suite"
                className="about-visual-image"
                loading="lazy"
              />
              <div className="about-visual-overlay" aria-hidden="true" />
            </div>

            {/* Integrated Experience Highlight: 28+ Years Combined Experience */}
            <div
              className="about-experience-accent"
              aria-label="28+ Years of Combined Experience"
            >
              <div className="experience-stat font-display">28+</div>
              <div className="experience-divider" aria-hidden="true" />
              <div className="experience-text">
                <span className="experience-title">Years of Combined</span>
                <span className="experience-subtitle">Experience</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
