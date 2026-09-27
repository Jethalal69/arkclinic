import React, { useState, useEffect, useRef, FC } from 'react';
import {
  Shield,
  Mail,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import {
  sendAdminOtp,
  verifyAdminOtp,
  getAuthorizedAdminEmail,
} from '../../lib/auth';
import './AdminLogin.css';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onNavigateHome: () => void;
}

export const AdminLogin: FC<AdminLoginProps> = ({ onLoginSuccess, onNavigateHome }) => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  // Handle Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your administrator email address.');
      return;
    }

    const authorizedAdmin = getAuthorizedAdminEmail();
    if (trimmedEmail !== authorizedAdmin) {
      setErrorMessage('Access Denied: This email address is not authorized for Admin access.');
      return;
    }

    setIsLoading(true);
    const { success, error } = await sendAdminOtp(trimmedEmail);
    setIsLoading(false);

    if (success) {
      setStep('otp');
      setCooldown(60);
      setSuccessMessage(`A 6-digit verification code was sent to ${trimmedEmail}.`);
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } else {
      setErrorMessage(error || 'Failed to send verification code. Please try again.');
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const token = otpDigits.join('').trim();
    if (token.length < 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    const { success, error } = await verifyAdminOtp(email, token);
    setIsLoading(false);

    if (success) {
      setSuccessMessage('Verification successful. Launching Admin Command Center...');
      setTimeout(() => {
        onLoginSuccess();
      }, 500);
    } else {
      setErrorMessage(error || 'Invalid or expired verification code. Please try again.');
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    // If user pasted a string longer than 1
    if (value.length > 1) {
      const cleanDigits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newDigits = [...otpDigits];
      cleanDigits.forEach((digit, i) => {
        if (i < 6) newDigits[i] = digit;
      });
      setOtpDigits(newDigits);
      const nextFocus = Math.min(cleanDigits.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    // Only allow numbers
    const cleanChar = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = cleanChar;
    setOtpDigits(newDigits);

    // Auto-advance to next input if digit entered
    if (cleanChar && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace and Arrow keys in OTP inputs
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Paste event on OTP input
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pastedData[i] || '';
    }
    setOtpDigits(newDigits);
    const nextFocus = Math.min(pastedData.length, 5);
    otpInputRefs.current[nextFocus]?.focus();
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (cooldown > 0 || isLoading) return;
    await handleSendOtp();
  };

  // Back to Email Step
  const handleBackToEmail = () => {
    setStep('email');
    setErrorMessage(null);
    setSuccessMessage(null);
    setOtpDigits(['', '', '', '', '', '']);
  };

  return (
    <div className="admin-login-root">
      {/* Background ambient lighting */}
      <div className="login-ambient-glow" aria-hidden="true" />

      {/* Top Navbar */}
      <header className="login-top-nav">
        <div className="login-nav-container">
          <button
            type="button"
            className="login-back-btn"
            onClick={onNavigateHome}
            title="Return to ARK Clinic website"
          >
            <ArrowLeft size={16} />
            <span>Back to Website</span>
          </button>

          <div className="login-nav-secure-badge">
            <Lock size={13} />
            <span>256-Bit Encrypted Portal</span>
          </div>
        </div>
      </header>

      {/* Login Main Container */}
      <main className="login-main-container">
        <div className="login-card-wrapper">
          {/* Brand Header */}
          <div className="login-brand-header">
            <div className="login-crest">
              <span className="login-crest-ark">ARK</span>
            </div>
            <div className="login-title-row">
              <h1 className="login-brand-title">ARK CLINIC</h1>
              <span className="login-admin-tag">
                <Shield size={12} />
                <span>Admin Portal</span>
              </span>
            </div>
            <p className="login-brand-subtitle">
              Secure Clinical Management & Appointment Portal
            </p>
          </div>

          {/* Form Card */}
          <div className="login-card">
            {/* Feedback Alerts */}
            {errorMessage && (
              <div className="login-alert alert-error" role="alert">
                <AlertCircle size={18} className="alert-icon" />
                <div className="alert-content">
                  <strong>Authentication Notice</strong>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="login-alert alert-success" role="alert">
                <CheckCircle2 size={18} className="alert-icon" />
                <div className="alert-content">
                  <span>{successMessage}</span>
                </div>
              </div>
            )}

            {step === 'email' ? (
              /* STEP 1: Email Form */
              <form onSubmit={handleSendOtp} className="login-form">
                <div className="login-step-intro">
                  <h2 className="login-step-title">Clinical Administrator Sign-In</h2>
                  <p className="login-step-desc">
                    Enter your authorized administrative email address. We will send a secure one-time verification code to verify your identity.
                  </p>
                </div>

                <div className="form-group">
                  <label htmlFor="admin-email" className="form-label">
                    Administrator Email Address
                  </label>
                  <div className="input-with-icon">
                    <Mail size={18} className="input-icon" />
                    <input
                      id="admin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="form-input"
                      disabled={isLoading}
                      required
                      autoFocus
                      autoComplete="email"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-login-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={18} className="spinning" />
                      <span>Sending Verification Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send One-Time Code</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* STEP 2: OTP Verification Form */
              <form onSubmit={handleVerifyOtp} className="login-form">
                <div className="login-step-intro">
                  <div className="otp-email-badge">
                    <Mail size={14} />
                    <span>{email}</span>
                  </div>
                  <h2 className="login-step-title">Enter Verification Code</h2>
                  <p className="login-step-desc">
                    Please enter the 6-digit one-time code sent to your authorized email address.
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label text-center">
                    6-Digit Security Code
                  </label>
                  <div className="otp-input-group" onPaste={handlePaste}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpInputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className={`otp-digit-box ${digit ? 'filled' : ''}`}
                        disabled={isLoading}
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-login-primary"
                  disabled={isLoading || otpDigits.join('').length < 6}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={18} className="spinning" />
                      <span>Verifying Security Code...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound size={18} />
                      <span>Verify & Access Dashboard</span>
                    </>
                  )}
                </button>

                <div className="otp-actions-footer">
                  <button
                    type="button"
                    className="btn-link-action"
                    onClick={handleBackToEmail}
                    disabled={isLoading}
                  >
                    <ArrowLeft size={14} />
                    <span>Change Email</span>
                  </button>

                  <button
                    type="button"
                    className="btn-link-action"
                    onClick={handleResendOtp}
                    disabled={isLoading || cooldown > 0}
                  >
                    <RefreshCw size={14} className={cooldown > 0 ? '' : ''} />
                    <span>
                      {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend Code'}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Security Notice Footer */}
          <div className="login-security-footer">
            <div className="security-item">
              <Shield size={14} className="security-icon" />
              <span>Protected by Supabase Auth with Row-Level Security</span>
            </div>
            <p className="security-disclaimer">
              Unauthorized access attempts are logged and monitored in compliance with clinical data privacy protocols.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
