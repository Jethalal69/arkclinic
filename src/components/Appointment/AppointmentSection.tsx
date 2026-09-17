import { useState, useEffect, useRef, FC, ChangeEvent, FormEvent, DragEvent } from 'react';
import {
  Sparkles,
  Building2,
  Video,
  Home,
  PhoneCall,
  MapPin,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  Lock,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  X,
} from 'lucide-react';
import './AppointmentSection.css';

interface ConsultationOption {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof Building2;
}

export const AppointmentSection: FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [consultationMode, setConsultationMode] = useState<string>('');
  const [physician, setPhysician] = useState<string>('');
  const [preferredDate, setPreferredDate] = useState<string>('');
  const [preferredTime, setPreferredTime] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [medicalFile, setMedicalFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // UI State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState<string>('');

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

  const todayStr = new Date().toISOString().split('T')[0];

  const consultationOptions: ConsultationOption[] = [
    {
      id: 'in-clinic',
      title: 'In-Clinic Consultation',
      subtitle: 'Visit ARK Clinic',
      icon: Building2,
    },
    {
      id: 'online-video',
      title: 'Online Video Consultation',
      subtitle: 'Secure video consultation',
      icon: Video,
    },
    {
      id: 'home-visit',
      title: 'Home Visit',
      subtitle: 'Care at your home',
      icon: Home,
    },
    {
      id: 'telephonic',
      title: 'Telephonic Consultation',
      subtitle: 'Consult by phone',
      icon: PhoneCall,
    },
  ];

  const physiciansList = [
    'Dr. Abhinav Chaudhary',
    'Dr. Ravi Dahiya',
    'Dr. Kapil Chauhan',
    'Any Available Physician',
  ];

  const timeSlots = [
    '09:30 AM',
    '11:00 AM',
    '12:30 PM',
    '02:30 PM',
    '04:00 PM',
    '05:30 PM',
    '07:00 PM',
  ];

  const handleConsultationModeSelect = (modeId: string) => {
    setConsultationMode(modeId);
    
    // If user switches away from Home Visit, clear address & error
    if (modeId !== 'home-visit') {
      setAddress('');
      if (errors.address) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.address;
          return next;
        });
      }
    }

    if (errors.consultationMode) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.consultationMode;
        return next;
      });
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        file: 'Please upload a PDF, JPG, or PNG file.',
      }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        file: 'File size exceeds 10MB limit.',
      }));
      return;
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next.file;
      return next;
    });
    setMedicalFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!consultationMode) {
      newErrors.consultationMode = 'Please select a consultation option.';
    }
    if (!physician) {
      newErrors.physician = 'Please choose a physician.';
    }
    if (!preferredDate) {
      newErrors.preferredDate = 'Please select your preferred date.';
    }
    if (!preferredTime) {
      newErrors.preferredTime = 'Please select your preferred time.';
    }
    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = 'Please enter your full name.';
    }

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number.';
    }

    // Home Visit requires address
    if (consultationMode === 'home-visit') {
      if (!address.trim() || address.trim().length < 5) {
        newErrors.address = 'Please enter your complete address for the home visit.';
      }
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate verified form submission
    setTimeout(() => {
      setIsSubmitting(false);
      const code = 'ARK-' + Math.floor(100000 + Math.random() * 900000);
      setConfirmationCode(code);
      setIsSuccess(true);
    }, 600);
  };

  const handleReset = () => {
    setConsultationMode('');
    setPhysician('');
    setPreferredDate('');
    setPreferredTime('');
    setFullName('');
    setPhoneNumber('');
    setAddress('');
    setEmail('');
    setReason('');
    setMedicalFile(null);
    setErrors({});
    setIsSuccess(false);
  };

  return (
    <section
      ref={sectionRef}
      className={`appointment-section ${isVisible ? 'appointment-visible' : ''}`}
      id="appointment"
      aria-label="Book Your Appointment"
    >
      <div className="container appointment-container">
        {/* Existing Centered Introductory Header (Exact Text Retained) */}
        <header className="appointment-header">
          <div className="appointment-eyebrow-wrap">
            <span className="appointment-eyebrow-pill">
              <Sparkles size={13} className="appointment-eyebrow-icon" />
              BOOK YOUR APPOINTMENT
            </span>
          </div>
          <h2 className="appointment-heading font-display">
            Your Care, Your Time.
          </h2>
          <p className="appointment-description">
            Choose your preferred consultation, select a convenient time, and take the next step toward better health.
          </p>
        </header>

        {/* Premium Appointment Booking Interface (Liquid Glass Design) */}
        <div className="appointment-form-card">
          {!isSuccess ? (
            <>
              {/* Form Title & Short Description */}
              <div className="appointment-card-header">
                <h3 className="appointment-card-title font-display">
                  Book Your Appointment
                </h3>
                <p className="appointment-card-desc">
                  Tell us a little about your visit and choose the consultation option that works best for you.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="appointment-booking-form">
                <div className="appointment-form-layout">
                  {/* LEFT COLUMN: GROUP 1 — CONSULTATION DETAILS */}
                  <div className="form-column">
                    <div className="form-column-header">
                      <span className="form-group-label">GROUP 1 — CONSULTATION DETAILS</span>
                    </div>

                    {/* 1. CONSULTATION MODE */}
                    <div className="form-group-block">
                      <label className="form-section-label">
                        1. Consultation Mode <span className="required-mark">*</span>
                      </label>
                      <div className="consultation-modes-grid" role="radiogroup" aria-label="Consultation Mode">
                        {consultationOptions.map((opt) => {
                          const Icon = opt.icon;
                          const isSelected = consultationMode === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              role="radio"
                              aria-checked={isSelected}
                              className={`mode-option-btn ${isSelected ? 'mode-selected' : ''}`}
                              onClick={() => handleConsultationModeSelect(opt.id)}
                            >
                              <div className="mode-icon-box" aria-hidden="true">
                                <Icon size={18} />
                              </div>
                              <div className="mode-text-box">
                                <span className="mode-title">{opt.title}</span>
                                <span className="mode-subtitle">{opt.subtitle}</span>
                              </div>
                              <div className="mode-radio-indicator" aria-hidden="true">
                                <span className="mode-radio-dot" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {errors.consultationMode && (
                        <p className="field-error-text" role="alert">{errors.consultationMode}</p>
                      )}
                    </div>

                    {/* 2. SELECT PHYSICIAN */}
                    <div className="form-group-block">
                      <label htmlFor="physician-select" className="form-section-label">
                        2. Select Physician <span className="required-mark">*</span>
                      </label>
                      <div className="input-with-icon-wrap">
                        <User size={16} className="input-prefix-icon" aria-hidden="true" />
                        <select
                          id="physician-select"
                          value={physician}
                          onChange={(e) => {
                            setPhysician(e.target.value);
                            if (errors.physician) {
                              setErrors((prev) => {
                                const next = { ...prev };
                                delete next.physician;
                                return next;
                              });
                            }
                          }}
                          className={`form-select ${errors.physician ? 'input-error' : ''}`}
                        >
                          <option value="">Choose a physician</option>
                          {physiciansList.map((doc) => (
                            <option key={doc} value={doc}>
                              {doc}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.physician && (
                        <p className="field-error-text" role="alert">{errors.physician}</p>
                      )}
                    </div>

                    {/* 3 & 4. PREFERRED DATE & PREFERRED TIME */}
                    <div className="form-row-two-col">
                      {/* Preferred Date */}
                      <div className="form-group-block">
                        <label htmlFor="preferred-date" className="form-section-label">
                          3. Preferred Date <span className="required-mark">*</span>
                        </label>
                        <div className="input-with-icon-wrap">
                          <Calendar size={16} className="input-prefix-icon" aria-hidden="true" />
                          <input
                            id="preferred-date"
                            type="date"
                            min={todayStr}
                            value={preferredDate}
                            onChange={(e) => {
                              setPreferredDate(e.target.value);
                              if (errors.preferredDate) {
                                setErrors((prev) => {
                                  const next = { ...prev };
                                  delete next.preferredDate;
                                  return next;
                                });
                              }
                            }}
                            className={`form-input ${errors.preferredDate ? 'input-error' : ''}`}
                          />
                        </div>
                        {errors.preferredDate && (
                          <p className="field-error-text" role="alert">{errors.preferredDate}</p>
                        )}
                      </div>

                      {/* Preferred Time */}
                      <div className="form-group-block">
                        <label htmlFor="preferred-time" className="form-section-label">
                          4. Preferred Time <span className="required-mark">*</span>
                        </label>
                        <div className="input-with-icon-wrap">
                          <Clock size={16} className="input-prefix-icon" aria-hidden="true" />
                          <select
                            id="preferred-time"
                            value={preferredTime}
                            onChange={(e) => {
                              setPreferredTime(e.target.value);
                              if (errors.preferredTime) {
                                setErrors((prev) => {
                                  const next = { ...prev };
                                  delete next.preferredTime;
                                  return next;
                                });
                              }
                            }}
                            className={`form-select ${errors.preferredTime ? 'input-error' : ''}`}
                          >
                            <option value="">Select preferred time</option>
                            {timeSlots.map((slot) => (
                              <option key={slot} value={slot}>
                                {slot}
                              </option>
                            ))}
                          </select>
                        </div>
                        {errors.preferredTime && (
                          <p className="field-error-text" role="alert">{errors.preferredTime}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: GROUP 2 — PATIENT INFORMATION */}
                  <div className="form-column">
                    <div className="form-column-header">
                      <span className="form-group-label">GROUP 2 — PATIENT INFORMATION</span>
                    </div>

                    {/* 5. PATIENT INFORMATION */}
                    <div className="form-group-block">
                      <label className="form-section-label">
                        5. Patient Information
                      </label>
                      <div className="patient-inputs-stack">
                        {/* Full Name */}
                        <div>
                          <label htmlFor="patient-fullname" className="form-sub-label">
                            Full Name <span className="required-mark">*</span>
                          </label>
                          <div className="input-with-icon-wrap">
                            <User size={16} className="input-prefix-icon" aria-hidden="true" />
                            <input
                              id="patient-fullname"
                              type="text"
                              placeholder="Enter your full name"
                              value={fullName}
                              onChange={(e) => {
                                setFullName(e.target.value);
                                if (errors.fullName) {
                                  setErrors((prev) => {
                                    const next = { ...prev };
                                    delete next.fullName;
                                    return next;
                                  });
                                }
                              }}
                              className={`form-input ${errors.fullName ? 'input-error' : ''}`}
                            />
                          </div>
                          {errors.fullName && (
                            <p className="field-error-text" role="alert">{errors.fullName}</p>
                          )}
                        </div>

                        {/* Phone Number */}
                        <div>
                          <label htmlFor="patient-phone" className="form-sub-label">
                            Phone Number <span className="required-mark">*</span>
                          </label>
                          <div className="input-with-icon-wrap">
                            <Phone size={16} className="input-prefix-icon" aria-hidden="true" />
                            <input
                              id="patient-phone"
                              type="tel"
                              placeholder="Enter your 10-digit phone number"
                              value={phoneNumber}
                              onChange={(e) => {
                                setPhoneNumber(e.target.value);
                                if (errors.phoneNumber) {
                                  setErrors((prev) => {
                                    const next = { ...prev };
                                    delete next.phoneNumber;
                                    return next;
                                  });
                                }
                              }}
                              className={`form-input ${errors.phoneNumber ? 'input-error' : ''}`}
                            />
                          </div>
                          {errors.phoneNumber && (
                            <p className="field-error-text" role="alert">{errors.phoneNumber}</p>
                          )}
                        </div>

                        {/* Dynamic Required Address Field for Home Visit */}
                        {consultationMode === 'home-visit' && (
                          <div className="address-dynamic-field">
                            <label htmlFor="patient-address" className="form-sub-label">
                              Complete Address <span className="required-mark">*</span>
                            </label>
                            <div className="input-with-icon-wrap textarea-icon-wrap">
                              <MapPin size={16} className="input-prefix-icon textarea-prefix-icon" aria-hidden="true" />
                              <textarea
                                id="patient-address"
                                rows={2}
                                placeholder="Enter your complete home address"
                                value={address}
                                onChange={(e) => {
                                  setAddress(e.target.value);
                                  if (errors.address) {
                                    setErrors((prev) => {
                                      const next = { ...prev };
                                      delete next.address;
                                      return next;
                                    });
                                  }
                                }}
                                className={`form-textarea form-address-input ${errors.address ? 'input-error' : ''}`}
                              />
                            </div>
                            {errors.address && (
                              <p className="field-error-text" role="alert">{errors.address}</p>
                            )}
                          </div>
                        )}

                        {/* Email Address */}
                        <div>
                          <label htmlFor="patient-email" className="form-sub-label">
                            Email Address <span className="optional-tag">(Optional)</span>
                          </label>
                          <div className="input-with-icon-wrap">
                            <Mail size={16} className="input-prefix-icon" aria-hidden="true" />
                            <input
                              id="patient-email"
                              type="email"
                              placeholder="Enter your email address"
                              value={email}
                              onChange={(e) => {
                                setEmail(e.target.value);
                                if (errors.email) {
                                  setErrors((prev) => {
                                    const next = { ...prev };
                                    delete next.email;
                                    return next;
                                  });
                                }
                              }}
                              className={`form-input ${errors.email ? 'input-error' : ''}`}
                            />
                          </div>
                          {errors.email && (
                            <p className="field-error-text" role="alert">{errors.email}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 6. REASON FOR CONSULTATION */}
                    <div className="form-group-block">
                      <label htmlFor="consultation-reason" className="form-section-label">
                        6. Reason for Consultation <span className="optional-tag">(Optional)</span>
                      </label>
                      <textarea
                        id="consultation-reason"
                        rows={2}
                        placeholder="Briefly describe your symptoms or reason for visit (optional)"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="form-textarea"
                      />
                    </div>

                    {/* 7. UPLOAD MEDICAL DOCUMENTS */}
                    <div className="form-group-block">
                      <label className="form-section-label">
                        7. Upload Medical Documents <span className="optional-tag">(Optional)</span>
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="hidden-file-input"
                        id="medical-file-upload"
                      />

                      {!medicalFile ? (
                        <div
                          className={`upload-dropzone ${isDragging ? 'dropzone-active' : ''}`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              fileInputRef.current?.click();
                            }
                          }}
                        >
                          <div className="upload-icon-circle" aria-hidden="true">
                            <UploadCloud size={20} />
                          </div>
                          <div className="upload-text-group">
                            <span className="upload-title">
                              Upload Prescription or Medical Reports
                            </span>
                            <span className="upload-subtitle">
                              PDF, JPG or PNG • Optional
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="uploaded-file-pill">
                          <FileText size={16} className="file-pill-icon" aria-hidden="true" />
                          <span className="file-pill-name">{medicalFile.name}</span>
                          <button
                            type="button"
                            className="file-remove-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMedicalFile(null);
                            }}
                            aria-label="Remove uploaded file"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                      {errors.file && (
                        <p className="field-error-text" role="alert">{errors.file}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* CONFIRM APPOINTMENT CTA & PRIVACY REASSURANCE */}
                <div className="form-submit-footer">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="appointment-submit-btn"
                  >
                    <span>{isSubmitting ? 'Confirming Appointment...' : 'Confirm Appointment'}</span>
                    <ArrowRight size={16} className="submit-arrow" />
                  </button>
                  <p className="form-security-reassurance">
                    <Lock size={13} className="security-lock-icon" aria-hidden="true" />
                    <span>Your information is kept private and secure.</span>
                  </p>
                </div>
              </form>
            </>
          ) : (
            /* Polished Prototype Confirmation State */
            <div className="appointment-success-state" role="status">
              <div className="success-icon-badge" aria-hidden="true">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="success-title font-display">
                Appointment Request Confirmed
              </h3>
              <p className="success-message">
                Thank you, <strong>{fullName}</strong>. Your consultation request has been received. Our clinical coordinator will reach out to you shortly on <strong>{phoneNumber}</strong> to confirm your slot.
              </p>

              <div className="success-summary-card">
                <div className="summary-row">
                  <span className="summary-label">Reference ID:</span>
                  <span className="summary-value summary-highlight">{confirmationCode}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Patient Name:</span>
                  <span className="summary-value">{fullName}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Consultation Mode:</span>
                  <span className="summary-value">
                    {consultationOptions.find((o) => o.id === consultationMode)?.title || consultationMode}
                  </span>
                </div>
                {consultationMode === 'home-visit' && address && (
                  <div className="summary-row">
                    <span className="summary-label">Visit Address:</span>
                    <span className="summary-value">{address}</span>
                  </div>
                )}
                <div className="summary-row">
                  <span className="summary-label">Physician:</span>
                  <span className="summary-value">{physician}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Preferred Date:</span>
                  <span className="summary-value">{preferredDate}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Preferred Time:</span>
                  <span className="summary-value">{preferredTime}</span>
                </div>
              </div>

              <p className="demo-notice-text">
                Demo Prototype • No real medical records or external appointments have been created.
              </p>

              <button
                type="button"
                onClick={handleReset}
                className="appointment-another-btn"
              >
                Book Another Appointment
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AppointmentSection;
