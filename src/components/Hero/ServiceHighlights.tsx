import { FC } from 'react';
import { Building2, Video, Home, Users } from 'lucide-react';
import './ServiceHighlights.css';

interface ServiceHighlightsProps {
  isVisible?: boolean;
}

export const ServiceHighlights: FC<ServiceHighlightsProps> = ({ isVisible = true }) => {
  const highlights = [
    {
      id: 'in-clinic',
      label: 'In-Clinic Consultation',
      icon: Building2,
    },
    {
      id: 'online',
      label: 'Online Consultation',
      icon: Video,
    },
    {
      id: 'home-visit',
      label: 'Home Visit Available',
      icon: Home,
    },
    {
      id: 'family-care',
      label: 'Personalised Family Care',
      icon: Users,
    },
  ];

  return (
    <div
      className={`service-highlights-grid ${isVisible ? 'highlights-visible' : ''}`}
      aria-label="Key Service Highlights"
    >
      {highlights.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            className="highlight-pill"
            style={{ '--stagger-delay': `${index * 80 + 400}ms` } as React.CSSProperties}
          >
            <div className="highlight-icon-box">
              <Icon size={14} className="highlight-icon-svg" />
            </div>
            <span className="highlight-label">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};
