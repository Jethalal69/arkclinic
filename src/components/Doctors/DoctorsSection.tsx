import { useState, useEffect, useRef, FC } from 'react';
import { Award, Building, ArrowRight, Stethoscope } from 'lucide-react';
import './DoctorsSection.css';

interface DoctorItem {
  id: string;
  name: string;
  qualifications: string;
  role: string;
  experience: string;
  hospitals: string[];
}

export const DoctorsSection: FC = () => {
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

  const doctors: DoctorItem[] = [
    {
      id: 'dr-abhinav-chaudhary',
      name: 'Dr. Abhinav Chaudhary',
      qualifications: 'MBBS, MEM, MSc.',
      role: 'Consultant Physician',
      experience: '10 Years Experience',
      hospitals: [
        'Countess of Chester, England',
        'Graphic Era Hospital, Dehradun',
        'Hindurao Hospital, Delhi',
        'Max Hospital, Dehradun',
      ],
    },
    {
      id: 'dr-ravi-dahiya',
      name: 'Dr. Ravi Dahiya',
      qualifications: 'MBBS, MEM',
      role: 'Consultant Physician',
      experience: '8 Years Experience',
      hospitals: [
        'RML Hospital, Delhi',
        'Safdarjung Hospital, Delhi',
        'Max Hospital, Dehradun',
      ],
    },
    {
      id: 'dr-kapil-chauhan',
      name: 'Dr. Kapil Chauhan',
      qualifications: 'MBBS, MEM',
      role: 'Consultant Physician',
      experience: '10 Years Experience',
      hospitals: [
        'Hindu Rao Hospital, Delhi',
        'Sanjay Gandhi Hospital, Delhi',
        'Max Hospital, Dehradun',
      ],
    },
  ];

  const handleBookWithDoctor = (e: React.MouseEvent<HTMLAnchorElement>, doctorName: string) => {
    e.preventDefault();
    const appointmentElement = document.getElementById('appointment');
    if (appointmentElement) {
      appointmentElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.open(
        `https://wa.me/919258750828?text=Hello%20ARK%20Clinic%2C%20I%20would%20like%20to%20consult%20with%20${encodeURIComponent(
          doctorName
        )}.`,
        '_blank'
      );
    }
  };

  return (
    <section
      ref={sectionRef}
      className={`doctors-section ${isVisible ? 'doctors-visible' : ''}`}
      id="doctors"
      aria-label="Our Physicians"
    >
      <div className="container doctors-container">
        {/* Section Header */}
        <header className="doctors-header">
          <div className="doctors-eyebrow-wrap">
            <span className="doctors-eyebrow">OUR PHYSICIANS</span>
          </div>
          <h2 className="doctors-heading font-display">
            Meet Our Doctors.
          </h2>
          <p className="doctors-description">
            Experienced physicians dedicated to providing thoughtful, personalised care for you and your family.
          </p>
        </header>

        {/* 3 Doctor Cards Grid */}
        <div className="doctors-grid" role="list">
          {doctors.map((doctor, index) => (
            <article
              key={doctor.id}
              className="doctor-card"
              style={{ '--card-delay': `${index * 80}ms` } as React.CSSProperties}
              role="listitem"
            >
              <div className="doctor-card-inner">
                {/* 1. Photo Area Placeholder (Future Real Photo Ready Container) */}
                <div className="doctor-photo-frame">
                  <div className="doctor-photo-placeholder" aria-label={`Portrait placeholder for ${doctor.name}`}>
                    <div className="photo-placeholder-ambient" aria-hidden="true" />
                    <div className="photo-placeholder-icon-wrap" aria-hidden="true">
                      <Stethoscope size={30} className="photo-placeholder-icon" strokeWidth={1.5} />
                    </div>
                  </div>
                  {/* Experience Badge Overlay */}
                  <div className="doctor-experience-tag">
                    <Award size={12} className="exp-tag-icon" aria-hidden="true" />
                    <span>{doctor.experience}</span>
                  </div>
                </div>

                {/* 2. Doctor Details */}
                <div className="doctor-details-body">
                  <div className="doctor-primary-info">
                    <h3 className="doctor-name font-display">{doctor.name}</h3>
                    <div className="doctor-meta-line">
                      <span className="doctor-qualifications">{doctor.qualifications}</span>
                      <span className="doctor-meta-dot" aria-hidden="true">•</span>
                      <span className="doctor-role">{doctor.role}</span>
                    </div>
                  </div>

                  {/* 3. Professional Background */}
                  <div className="doctor-background-block">
                    <span className="background-section-title">Professional Background</span>
                    <ul className="hospitals-list">
                      {doctor.hospitals.map((hosp, idx) => (
                        <li key={idx} className="hospital-item">
                          <Building size={13} className="hospital-item-icon" aria-hidden="true" />
                          <span className="hospital-item-text">{hosp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 4. Card Action CTA */}
                <div className="doctor-card-footer">
                  <a
                    href="#appointment"
                    className="doctor-cta-link"
                    onClick={(e) => handleBookWithDoctor(e, doctor.name)}
                    aria-label={`View profile and book consultation with ${doctor.name}`}
                  >
                    <span className="doctor-cta-text">View Profile</span>
                    <ArrowRight size={14} className="doctor-cta-arrow" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DoctorsSection;
