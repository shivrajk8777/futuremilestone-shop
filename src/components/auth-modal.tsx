'use client';

import { useState } from 'react';
import { useUser } from '@/context/UserContext';

export default function AuthModal() {
  const { isAuthModalOpen, setAuthModalOpen, login, signup } = useUser();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.success) {
          setAuthModalOpen(false);
          setEmail('');
          setPassword('');
        } else {
          setError(res.error || 'Invalid email or password');
        }
      } else {
        if (!name) {
          setError('Name is required');
          setSubmitting(false);
          return;
        }
        const res = await signup(name, email, password);
        if (res.success) {
          setAuthModalOpen(false);
          setName('');
          setEmail('');
          setPassword('');
        } else {
          setError(res.error || 'Registration failed');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={() => setAuthModalOpen(false)} 
      />

      {/* Modal Container */}
      <div className="w-full max-w-md bg-bg-primary transition-theme border border-border-accent/80 rounded-2xl shadow-2xl overflow-hidden z-10 p-8 flex flex-col gap-6 relative select-text animate-fade-in">
        
        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
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
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-xs text-fg-secondary">
            {mode === 'login' 
              ? 'Sign in to access your details and complete checkout.' 
              : 'Sign up to manage your orders and speed up purchases.'}
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

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
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

          <div className="space-y-1">
            <label htmlFor="auth-email" className="text-[11px] font-bold uppercase tracking-wider text-fg-secondary">Email</label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@fjord.com"
              className="w-full bg-bg-secondary text-fg-primary placeholder:text-fg-secondary/40 border border-border-accent/40 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-fg-primary transition-colors font-medium"
            />
          </div>

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
              <span>{mode === 'login' ? 'Sign In' : 'Sign Up'}</span>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center pt-2 border-t border-border-accent/30">
          <button
            type="button"
            onClick={toggleMode}
            className="text-xs text-fg-secondary hover:text-fg-primary hover:underline cursor-pointer font-medium"
          >
            {mode === 'login' 
              ? "Don't have an account? Sign Up" 
              : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
