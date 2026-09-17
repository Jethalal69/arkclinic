import { useState, useEffect, useRef, FC } from 'react';
import {
  Building2,
  Video,
  PhoneCall,
  Home,
  Users,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import './ServicesSection.css';

interface ServiceItem {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: typeof Building2;
  row: number;
}

export const ServicesSection: FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // 6 Services arranged in three intentionally varied, asymmetric rows
  const services: ServiceItem[] = [
    // ROW 1: In-Clinic Consultation (~58%) + Online Video Consultation (~42%)
    {
      id: 'in-clinic',
      number: '01',
      title: 'In-Clinic Consultation',
      description:
        'Personalised medical consultation with our experienced physicians at ARK Clinic.',
      icon: Building2,
      row: 1,
    },
    {
      id: 'online-video',
      number: '02',
      title: 'Online Video Consultation',
      description:
        'Consult with our physicians remotely through a secure and convenient video consultation.',
      icon: Video,
      row: 1,
    },
    // ROW 2: Telephonic Consultation (~38%) + Home Visit (~62%)
    {
      id: 'telephonic',
      number: '03',
      title: 'Telephonic Consultation',
      description:
        'Speak with our medical team when an in-person visit is not convenient.',
      icon: PhoneCall,
      row: 2,
    },
    {
      id: 'home-visit',
      number: '04',
      title: 'Home Visit',
      description:
        'Receive medical consultation and care from the comfort of your home.',
      icon: Home,
      row: 2,
    },
    // ROW 3: Family Healthcare (~46%) + Preventive Healthcare (~54%)
    {
      id: 'family-care',
      number: '05',
      title: 'Family Healthcare',
      description:
        'Thoughtful medical care designed around the health needs of you and your family.',
      icon: Users,
      row: 3,
    },
    {
      id: 'preventive-care',
      number: '06',
      title: 'Preventive Healthcare',
      description:
        'Focused guidance to help you stay informed about your health and support long-term well-being.',
      icon: ShieldCheck,
      row: 3,
    },
  ];

  const handleLearnMore = (
    e: React.MouseEvent<HTMLAnchorElement>,
    serviceTitle: string
  ) => {
    e.preventDefault();
    const appointmentElement = document.getElementById('appointment');
    if (appointmentElement) {
      appointmentElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.open(
        `https://wa.me/919258750828?text=Hello%20ARK%20Clinic%2C%20I%20would%20like%20to%20know%20more%20about%20${encodeURIComponent(
          serviceTitle
        )}.`,
        '_blank'
      );
    }
  };

  return (
    <section
      ref={sectionRef}
      className={`services-section ${isVisible ? 'services-visible' : ''}`}
      id="services"
      aria-label="ARK Clinic Medical Services"
    >
      <div className="container services-container">
        {/* Section Header */}
        <header className="services-header">
          <div className="services-eyebrow-wrap">
            <span className="services-eyebrow">OUR SERVICES</span>
          </div>
          <h2 className="services-heading font-display">
            Care Designed Around You.
          </h2>
          <p className="services-description">
            From in-clinic consultations to care at home, ARK Clinic makes
            quality medical care more convenient and accessible for you and your
            family.
          </p>
        </header>

        {/* Intentionally Asymmetric Editorial Grid (Distinct Proportions per Row) */}
        <div className="services-asymmetric-grid" role="list">
          {services.map((service, index) => {
            const Icon = service.icon;

            return (
              <article
                key={service.id}
                className={`service-card card-${service.id} row-${service.row}`}
                style={{ '--card-delay': `${index * 75}ms` } as React.CSSProperties}
                role="listitem"
              >
                <div className="service-card-inner">
                  {/* Card Top: Icon & Subtle Index Number */}
                  <div className="service-card-top">
                    <div className="service-icon-box" aria-hidden="true">
                      <Icon size={20} className="service-icon" />
                    </div>
                    <span className="service-card-number font-display" aria-hidden="true">
                      {service.number}
                    </span>
                  </div>

                  {/* Card Body: Title & Description */}
                  <div className="service-card-body">
                    <h3 className="service-card-title font-display">
                      {service.title}
                    </h3>
                    <p className="service-card-desc">{service.description}</p>
                  </div>

                  {/* Card Footer: Learn More CTA */}
                  <div className="service-card-footer">
                    <a
                      href="#appointment"
                      className="service-learn-more"
                      onClick={(e) => handleLearnMore(e, service.title)}
                      aria-label={`Learn more about ${service.title}`}
                    >
                      <span className="learn-more-text">Learn More</span>
                      <ArrowRight size={15} className="learn-more-arrow" />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};


