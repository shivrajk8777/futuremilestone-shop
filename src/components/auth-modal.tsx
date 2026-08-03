'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';

export default function AuthModal() {
  const { isAuthModalOpen, setAuthModalOpen, login, signup } = useUser();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot_password'>('login');
  const [signupStep, setSignupStep] = useState<'form' | 'otp'>('form');
  const [resetStep, setResetStep] = useState<'email' | 'otp_reset'>('email');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // OTP resend timer countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setAuthModalOpen(false);
    setError('');
    setSuccessMessage('');
    setOtp('');
    setPassword('');
    setConfirmPassword('');
    setSignupStep('form');
    setResetStep('email');
  };

  const handleSendOTP = async (type: 'signup' | 'reset_password') => {
    setError('');
    setSuccessMessage('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`Verification code sent to ${email}`);
        setResendTimer(30);
        if (type === 'signup') {
          setSignupStep('otp');
        } else {
          setResetStep('otp_reset');
        }
      } else {
        setError(data.error || 'Failed to send verification code');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setSubmitting(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.success) {
          handleClose();
        } else {
          setError(res.error || 'Invalid email or password');
        }
      } else if (mode === 'signup') {
        if (signupStep === 'form') {
          if (!name) {
            setError('Name is required');
            setSubmitting(false);
            return;
          }
          await handleSendOTP('signup');
        } else {
          if (!otp) {
            setError('Verification code is required');
            setSubmitting(false);
            return;
          }
          const res = await signup(name, email, password, otp);
          if (res.success) {
            handleClose();
          } else {
            setError(res.error || 'Registration failed');
          }
        }
      } else if (mode === 'forgot_password') {
        if (resetStep === 'email') {
          await handleSendOTP('reset_password');
        } else {
          if (!otp || !password || !confirmPassword) {
            setError('All fields are required');
            setSubmitting(false);
            return;
          }
          if (password !== confirmPassword) {
            setError('Passwords do not match');
            setSubmitting(false);
            return;
          }
          if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            setSubmitting(false);
            return;
          }

          const res = await fetch('/api/auth/password/reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp, newPassword: password }),
          });
          const data = await res.json();
          if (data.success) {
            setSuccessMessage('Password reset successful! You can now log in.');
            setMode('login');
            setPassword('');
            setConfirmPassword('');
            setOtp('');
            setResetStep('email');
          } else {
            setError(data.error || 'Failed to reset password');
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMode = () => {
    if (mode === 'login') {
      setMode('signup');
      setSignupStep('form');
    } else {
      setMode('login');
    }
    setError('');
    setSuccessMessage('');
    setOtp('');
  };

  const showEmailInput =
    mode === 'login' ||
    (mode === 'signup' && signupStep === 'form') ||
    (mode === 'forgot_password' && resetStep === 'email');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="w-full max-w-md bg-bg-primary transition-theme border border-border-accent/80 rounded-2xl shadow-2xl overflow-hidden z-10 p-8 flex flex-col gap-6 relative select-text animate-fade-in">

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-fg-secondary hover:text-fg-primary rounded-full transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <h2 className="font-dm-sans text-2xl font-semibold tracking-tight text-fg-primary">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'signup' && (signupStep === 'form' ? 'Create Account' : 'Verify Email')}
            {mode === 'forgot_password' && (resetStep === 'email' ? 'Reset Password' : 'Set New Password')}
          </h2>
          <p className="text-xs text-fg-secondary">
            {mode === 'login' && 'Sign in to access your details and complete checkout.'}
            {mode === 'signup' && (signupStep === 'form' ? 'Sign up to manage your orders and speed up purchases.' : `We've sent a 6-digit verification code to ${email}.`)}
            {mode === 'forgot_password' && (resetStep === 'email' ? 'Enter your email to receive a password reset code.' : `Enter the verification code sent to ${email} and your new password.`)}
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-shake">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Success Notification */}
        {successMessage && (
          <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && signupStep === 'form' && (
            <div className="space-y-1">
              <label htmlFor="auth-name" className="text-[11px] font-bold uppercase tracking-wider text-fg-secondary">Name</label>
              <input
                id="auth-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-bg-secondary text-fg-primary placeholder:text-fg-secondary/40 border border-border-accent/40 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-fg-primary transition-colors font-medium"
              />
            </div>
          )}

          {showEmailInput && (
            <div className="space-y-1">
              <label htmlFor="auth-email" className="text-[11px] font-bold uppercase tracking-wider text-fg-secondary">Email</label>
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-bg-secondary text-fg-primary placeholder:text-fg-secondary/40 border border-border-accent/40 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-fg-primary transition-colors font-medium"
              />
            </div>
          )}

          {mode === 'login' && (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label htmlFor="auth-password" className="text-[11px] font-bold uppercase tracking-wider text-fg-secondary">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot_password');
                    setResetStep('email');
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="text-[10px] text-fg-secondary hover:text-fg-primary hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                id="auth-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-bg-secondary text-fg-primary placeholder:text-fg-secondary/40 border border-border-accent/40 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-fg-primary transition-colors font-medium"
              />
            </div>
          )}

          {mode === 'signup' && signupStep === 'form' && (
            <div className="space-y-1">
              <label htmlFor="auth-password" className="text-[11px] font-bold uppercase tracking-wider text-fg-secondary">Password</label>
              <input
                id="auth-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-bg-secondary text-fg-primary placeholder:text-fg-secondary/40 border border-border-accent/40 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-fg-primary transition-colors font-medium"
              />
            </div>
          )}

          {mode === 'signup' && signupStep === 'otp' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="auth-otp" className="text-[11px] font-bold uppercase tracking-wider text-fg-secondary">Verification Code</label>
                <input
                  id="auth-otp"
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full bg-bg-secondary text-fg-primary placeholder:text-fg-secondary/40 border border-border-accent/40 rounded-xl px-4 py-3 text-center text-xl tracking-[10px] font-mono focus:outline-none focus:border-fg-primary transition-colors font-semibold"
                />
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setSignupStep('form');
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="text-fg-secondary hover:text-fg-primary transition-colors cursor-pointer font-semibold"
                >
                  &larr; Go Back
                </button>
                <button
                  type="button"
                  disabled={resendTimer > 0 || submitting}
                  onClick={() => handleSendOTP('signup')}
                  className="text-fg-secondary hover:text-fg-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer font-semibold"
                >
                  {resendTimer > 0 ? `Resend Code (${resendTimer}s)` : 'Resend Code'}
                </button>
              </div>
            </div>
          )}

          {mode === 'forgot_password' && resetStep === 'otp_reset' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="auth-otp" className="text-[11px] font-bold uppercase tracking-wider text-fg-secondary">Verification Code</label>
                <input
                  id="auth-otp"
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full bg-bg-secondary text-fg-primary placeholder:text-fg-secondary/40 border border-border-accent/40 rounded-xl px-4 py-3 text-center text-xl tracking-[10px] font-mono focus:outline-none focus:border-fg-primary transition-colors font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="auth-new-password" className="text-[11px] font-bold uppercase tracking-wider text-fg-secondary">New Password</label>
                <input
                  id="auth-new-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-bg-secondary text-fg-primary placeholder:text-fg-secondary/40 border border-border-accent/40 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-fg-primary transition-colors font-medium"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="auth-confirm-password" className="text-[11px] font-bold uppercase tracking-wider text-fg-secondary">Confirm Password</label>
                <input
                  id="auth-confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-bg-secondary text-fg-primary placeholder:text-fg-secondary/40 border border-border-accent/40 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-fg-primary transition-colors font-medium"
                />
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setResetStep('email');
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="text-fg-secondary hover:text-fg-primary transition-colors cursor-pointer font-semibold"
                >
                  &larr; Go Back
                </button>
                <button
                  type="button"
                  disabled={resendTimer > 0 || submitting}
                  onClick={() => handleSendOTP('reset_password')}
                  className="text-fg-secondary hover:text-fg-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer font-semibold"
                >
                  {resendTimer > 0 ? `Resend Code (${resendTimer}s)` : 'Resend Code'}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-fg-primary text-bg-primary py-3.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-bg-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              <span>
                {mode === 'login' && 'Sign In'}
                {mode === 'signup' && (signupStep === 'form' ? 'Send Verification Code' : 'Verify & Sign Up')}
                {mode === 'forgot_password' && (resetStep === 'email' ? 'Send Reset Code' : 'Reset Password')}
              </span>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center pt-2 border-t border-border-accent/30">
          {mode === 'forgot_password' ? (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setSuccessMessage('');
              }}
              className="text-xs text-fg-secondary hover:text-fg-primary hover:underline cursor-pointer font-medium"
            >
              Back to Sign In
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleMode}
              className="text-xs text-fg-secondary hover:text-fg-primary hover:underline cursor-pointer font-medium"
            >
              {mode === 'login'
                ? "Don't have an account? Sign Up"
                : 'Already have an account? Sign In'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

