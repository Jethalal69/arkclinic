import { useState, useEffect, useRef, FC, Fragment } from 'react';
import { Stethoscope, Award, MapPin, Heart } from 'lucide-react';
import './TrustStrip.css';

export const TrustStrip: FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (stripRef.current) {
      observer.observe(stripRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const trustItems = [
    {
      id: 'physicians',
      icon: Stethoscope,
      highlight: '3',
      title: 'Experienced Physicians',
      subtitle: 'Dedicated to your well-being',
    },
    {
      id: 'experience',
      icon: Award,
      highlight: '28+',
      title: 'Years Combined Experience',
      subtitle: 'Trusted by generations',
    },
    {
      id: 'modes',
      icon: MapPin,
      highlight: null,
      title: 'Clinic • Online • Home Visits',
      subtitle: 'Care where you need it',
    },
    {
      id: 'family-care',
      icon: Heart,
      highlight: null,
      title: 'Personalised Family Care',
      subtitle: 'For all age groups',
    },
  ];

  return (
    <div
      ref={stripRef}
      className={`trust-strip-wrapper ${isVisible ? 'trust-visible' : ''}`}
      aria-label="Clinic Trust Highlights"
    >
      <div className="trust-strip-card">
        {trustItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Fragment key={item.id}>
              <div
                className="trust-item"
                style={{ '--trust-delay': `${index * 80 + 120}ms` } as React.CSSProperties}
              >
                <div className="trust-icon-box">
                  <Icon className="trust-icon" size={18} />
                </div>
                <div className="trust-content">
                  {item.highlight ? (
                    <div className="trust-stat-group">
                      <span className="trust-stat-number">{item.highlight}</span>
                      <div className="trust-stat-text-col">
                        <span className="trust-stat-label">{item.title}</span>
                        {item.subtitle && (
                          <span className="trust-secondary-text">{item.subtitle}</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="trust-text-group">
                      <span className="trust-primary-text">{item.title}</span>
                      {item.subtitle && (
                        <span className="trust-secondary-text">{item.subtitle}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {index < trustItems.length - 1 && <div className="trust-divider" aria-hidden="true" />}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};
