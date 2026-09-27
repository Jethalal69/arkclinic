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
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './AppointmentSection.css';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

const generateUniqueId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
};

const sanitizeFileName = (fileName: string): string => {
  const lastDotIndex = fileName.lastIndexOf('.');
  const ext = lastDotIndex !== -1 ? fileName.slice(lastDotIndex).toLowerCase() : '';
  const baseName = lastDotIndex !== -1 ? fileName.slice(0, lastDotIndex) : fileName;

  const cleanBase = baseName
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '') || 'prescription';

  return `${cleanBase}${ext}`;
};

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
  const [submitError, setSubmitError] = useState<string | null>(null);
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
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    const isAllowedType = ALLOWED_MIME_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(fileExt);

    if (!isAllowedType) {
      setErrors((prev) => ({
        ...prev,
        file: 'Please upload a valid PDF, JPG, JPEG, or PNG file.',
      }));
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrors((prev) => ({
        ...prev,
        file: 'File size exceeds the 5MB limit. Please choose a smaller file.',
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

  const handleRemoveFile = () => {
    setMedicalFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next.file;
      return next;
    });
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

  const formatTimeTo24Hour = (timeStr: string): string => {
    if (!timeStr) return '';
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = match[2];
      const period = match[3].toUpperCase();
      if (period === 'AM') {
        if (hours === 12) hours = 0;
      } else if (period === 'PM') {
        if (hours !== 12) hours += 12;
      }
      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }
    if (/^\d{1,2}:\d{2}$/.test(timeStr.trim())) {
      const [h, m] = timeStr.trim().split(':');
      return `${h.padStart(2, '0')}:${m}`;
    }
    return timeStr.trim();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const appointmentType = consultationMode === 'online-video' ? 'video' : 'in_person';
    const formattedTime = formatTimeTo24Hour(preferredTime);

    let formattedMessage = reason.trim();
    if (consultationMode === 'home-visit' && address.trim()) {
      formattedMessage = formattedMessage
        ? `Home Visit Address: ${address.trim()}\nNotes: ${formattedMessage}`
        : `Home Visit Address: ${address.trim()}`;
    }

    let uploadedPrescriptionPath: string | null = null;

    // Optional prescription upload to private Supabase Storage bucket
    if (medicalFile) {
      try {
        const uniqueId = generateUniqueId();
        const cleanFileName = sanitizeFileName(medicalFile.name);
        const objectPath = `${uniqueId}/${cleanFileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('prescriptions')
          .upload(objectPath, medicalFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Supabase storage upload error:', uploadError);
          setSubmitError('Failed to upload prescription. Please verify the file is under 5MB and in PDF/JPG/PNG format, then try again.');
          setIsSubmitting(false);
          return;
        }

        // Store path identifier: 'prescriptions/<unique-id>/<sanitized-filename>'
        uploadedPrescriptionPath = `prescriptions/${uploadData?.path || objectPath}`;
      } catch (uploadErr) {
        console.error('Unexpected upload error:', uploadErr);
        setSubmitError('Unable to upload prescription file at this moment. Please try again.');
        setIsSubmitting(false);
        return;
      }
    }

    const payload = {
      name: fullName.trim(),
      phone: phoneNumber.trim(),
      email: email.trim(),
      doctor: physician,
      appointment_type: appointmentType,
      date: preferredDate,
      time: formattedTime,
      message: formattedMessage || '',
      prescription_path: uploadedPrescriptionPath,
    };

    try {
      const response = await fetch('https://taranjeet09.app.n8n.cloud/webhook/8913a5d7-22ab-4384-b00a-cb00902e01ae', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server returned error status (${response.status}). Please try again.`);
      }

      let code = 'ARK-' + Math.floor(100000 + Math.random() * 900000);
      try {
        const data = await response.json();
        if (data && typeof data === 'object') {
          const potentialCode =
            data.referenceId ||
            data.confirmationCode ||
            data.id ||
            data.bookingId ||
            data.reference_id ||
            data.code;
          if (potentialCode && typeof potentialCode === 'string') {
            code = potentialCode;
          }
        }
      } catch {
        // Plain text or empty response on 200 OK
      }

      setConfirmationCode(code);
      setIsSuccess(true);
    } catch (error: any) {
      console.error('Failed to submit appointment to webhook:', error);
      setSubmitError(
        error.message && typeof error.message === 'string' && !error.message.includes('Failed to fetch')
          ? error.message
          : 'Unable to process your appointment request at this moment. Please check your internet connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setErrors({});
    setSubmitError(null);
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

                    {/* 7. UPLOAD PRESCRIPTION */}
                    <div className="form-group-block">
                      <label htmlFor="medical-file-upload" className="form-section-label">
                        7. Upload Prescription <span className="optional-tag">(Optional)</span>
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
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
                          aria-label="Upload Prescription (Optional). Accepts PDF, JPG, JPEG or PNG up to 5MB."
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
                              Upload Prescription (Optional)
                            </span>
                            <span className="upload-subtitle">
                              PDF, JPG, JPEG or PNG • Max 5 MB
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="uploaded-file-pill">
                          <FileText size={18} className="file-pill-icon" aria-hidden="true" />
                          <div className="file-pill-info">
                            <span className="file-pill-name">{medicalFile.name}</span>
                            <span className="file-pill-size">
                              {medicalFile.size < 1024 * 1024
                                ? `${(medicalFile.size / 1024).toFixed(1)} KB`
                                : `${(medicalFile.size / (1024 * 1024)).toFixed(2)} MB`}
                            </span>
                          </div>
                          <div className="file-pill-actions">
                            <button
                              type="button"
                              className="file-change-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.click();
                              }}
                              aria-label="Change selected file"
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              className="file-remove-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFile();
                              }}
                              aria-label="Remove uploaded file"
                              title="Remove file"
                            >
                              <X size={14} />
                            </button>
                          </div>
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
                  {submitError && (
                    <div className="appointment-error-alert" role="alert">
                      <AlertCircle size={18} className="error-alert-icon" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="appointment-submit-btn"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="submit-spinner" />
                        <span>Confirming Appointment...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm Appointment</span>
                        <ArrowRight size={16} className="submit-arrow" />
                      </>
                    )}
                  </button>
                  <p className="form-security-reassurance">
                    <Lock size={13} className="security-lock-icon" aria-hidden="true" />
                    <span>Your information is kept private and secure.</span>
                  </p>
                </div>
              </form>
            </>
          ) : (
            /* Polished Confirmation State */
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
                {medicalFile && (
                  <div className="summary-row">
                    <span className="summary-label">Prescription:</span>
                    <span className="summary-value" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <FileText size={13} aria-hidden="true" />
                      <span>{medicalFile.name} (Attached)</span>
                    </span>
                  </div>
                )}
              </div>

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
