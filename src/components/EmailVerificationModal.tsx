import React, { useState, useEffect, useRef } from 'react';
import { Mail, ShieldCheck, RefreshCw, KeyRound, CheckCircle2, AlertCircle, ArrowLeft, X } from 'lucide-react';

interface EmailVerificationModalProps {
  isOpen: boolean;
  email: string;
  verificationCode: string;
  mode: 'register' | 'login' | 'admin_2fa';
  onVerify: (code: string) => boolean;
  onResend: () => void;
  onClose: () => void;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  email,
  verificationCode,
  mode,
  onVerify,
  onResend,
  onClose
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(45);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on open
  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '', '', '']);
      setError(null);
      setIsSuccess(false);
      setResendCooldown(45);
      setTimeLeft(600);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [isOpen, email, verificationCode]);

  // Expiry countdown timer
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  // Resend cooldown timer
  useEffect(() => {
    if (!isOpen || resendCooldown <= 0) return;
    const cooldownTimer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(cooldownTimer);
  }, [isOpen, resendCooldown]);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, val: string) => {
    setError(null);
    const cleaned = val.replace(/\D/g, ''); // Numbers only

    if (!cleaned) {
      const nextDigits = [...digits];
      nextDigits[index] = '';
      setDigits(nextDigits);
      return;
    }

    // If user pasted or typed multiple digits
    if (cleaned.length > 1) {
      const nextDigits = [...digits];
      for (let i = 0; i < cleaned.length && index + i < 6; i++) {
        nextDigits[index + i] = cleaned[i];
      }
      setDigits(nextDigits);
      const nextFocus = Math.min(index + cleaned.length, 5);
      inputRefs.current[nextFocus]?.focus();

      // Check if complete
      if (nextDigits.every((d) => d !== '')) {
        verifyCode(nextDigits.join(''));
      }
      return;
    }

    const nextDigits = [...digits];
    nextDigits[index] = cleaned[0];
    setDigits(nextDigits);

    // Auto-advance
    if (index < 5 && cleaned[0]) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if all 6 filled
    if (nextDigits.every((d) => d !== '')) {
      verifyCode(nextDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (!pasteData) return;

    const nextDigits = [...digits];
    for (let i = 0; i < 6 && i < pasteData.length; i++) {
      nextDigits[i] = pasteData[i];
    }
    setDigits(nextDigits);
    const nextFocus = Math.min(pasteData.length, 5);
    inputRefs.current[nextFocus]?.focus();

    if (nextDigits.every((d) => d !== '')) {
      verifyCode(nextDigits.join(''));
    }
  };

  const verifyCode = (codeToVerify: string) => {
    if (timeLeft <= 0) {
      setError('⚠️ This verification code has expired. Please request a new one.');
      return;
    }

    const ok = onVerify(codeToVerify);
    if (ok) {
      setIsSuccess(true);
      setError(null);
    } else {
      setError('❌ Invalid verification code. Please check your email inbox and enter the 6-digit code.');
      // shake/clear
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }
    verifyCode(code);
  };



  const handleResendClick = () => {
    if (resendCooldown > 0) return;
    onResend();
    setResendCooldown(45);
    setTimeLeft(600);
    setDigits(['', '', '', '', '', '']);
    setError(null);
    inputRefs.current[0]?.focus();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isComplete = digits.every((d) => d !== '');

  const titleText =
    mode === 'admin_2fa'
      ? 'Admin Security 2FA Verification'
      : mode === 'login'
      ? 'Verify Your Email to Continue'
      : 'Verify Your Email Address';

  const subtitleText =
    mode === 'admin_2fa'
      ? `A high-security 6-digit authorization code was dispatched to ${email}. Confirm identity to access administrative features.`
      : `We sent a 6-digit confirmation code to ${email}. Enter the code below to complete account onboarding.`;

  return (
    <div className="modal-overlay">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-card modal-verification" style={{ maxWidth: '540px' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className={`verification-badge-icon ${mode === 'admin_2fa' ? 'admin' : ''}`}>
              {mode === 'admin_2fa' ? <ShieldCheck size={26} /> : <Mail size={26} />}
            </div>
            <div>
              <h2 className="modal-title">{titleText}</h2>
              <p className="modal-subtitle">{subtitleText}</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close" type="button">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.5rem 1.75rem' }}>
          {/* Authentic Production Email Dispatch Notice */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              marginBottom: '1.25rem'
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Mail size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                  Verification Code Dispatched
                </span>
                <span
                  style={{
                    background: '#dcfce7',
                    color: '#15803d',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#16a34a'
                    }}
                  ></span>
                  SENT VIA SMTP
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
                A 6-digit confirmation code has been emailed to{' '}
                <strong style={{ color: '#0f172a' }}>{email}</strong>. Please check your inbox (or spam folder) and enter it below.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ marginTop: '0.75rem' }}>
            <label className="form-label text-center" style={{ display: 'block', marginBottom: '0.75rem' }}>
              Enter 6-Digit Verification Code
            </label>

            <div className="otp-inputs-grid" onPaste={handlePaste}>
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  disabled={isSuccess}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className={`otp-digit-box ${digit ? 'filled' : ''} ${error ? 'error' : ''} ${
                    isSuccess ? 'success' : ''
                  }`}
                  aria-label={`Digit ${idx + 1}`}
                />
              ))}
            </div>

            {/* Error or Success Notice */}
            {error && (
              <div className="verification-alert error" style={{ marginTop: '1rem' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {isSuccess && (
              <div className="verification-alert success" style={{ marginTop: '1rem' }}>
                <CheckCircle2 size={16} />
                <span>
                  {mode === 'admin_2fa'
                    ? '✓ Admin identity authorized! Loading control center...'
                    : '✓ Email successfully verified! Welcome to Music Marshall.'}
                </span>
              </div>
            )}

            {/* Timers & Resend */}
            <div className="otp-meta-row" style={{ marginTop: '1.25rem' }}>
              <div className="otp-expiry-timer">
                <KeyRound size={14} />
                <span>
                  Expires in: <strong>{formatTime(timeLeft)}</strong>
                </span>
              </div>

              <button
                type="button"
                className="otp-resend-btn"
                disabled={resendCooldown > 0 || isSuccess}
                onClick={handleResendClick}
              >
                <RefreshCw size={13} className={resendCooldown > 0 ? '' : 'spin-on-hover'} />
                <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
              </button>
            </div>

            {/* Submit Button */}
            <div style={{ marginTop: '1.75rem', display: 'flex', gap: '0.85rem' }}>
              <button
                type="button"
                className="btn btn-outline btn-lg"
                style={{ flex: 1, minHeight: '50px', fontSize: '0.96rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                onClick={onClose}
              >
                <ArrowLeft size={18} />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ flex: 2, minHeight: '50px', fontSize: '1rem', fontWeight: 700 }}
                disabled={!isComplete || isSuccess}
              >
                {isSuccess ? 'Verified ✓' : mode === 'admin_2fa' ? 'Authorize Admin Access' : 'Verify & Continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
