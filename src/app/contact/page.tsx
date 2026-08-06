'use client';

import { useState, useRef, useEffect } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to send message. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const rightColumnRef = useRef<HTMLDivElement>(null);

  // Scroll priority:
  //  ↓ Down  → right column first → then page (footer/social appear)
  //  ↑ Up    → page first (footer/social disappear) → then right column
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const el = rightColumnRef.current;
      if (!el) return;

      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
      const atTop = el.scrollTop <= 0;
      const pageAtTop = (window.scrollY || document.documentElement.scrollTop) <= 0;

      if (e.deltaY > 0) {
        // ↓ Scrolling DOWN — right column has priority
        if (!atBottom) {
          e.preventDefault();
          el.scrollTop += e.deltaY;
        }
        // right column at bottom → let page scroll naturally (footer/social visible)
      } else if (e.deltaY < 0) {
        // ↑ Scrolling UP — page has priority (to scroll footer back out first)
        if (!pageAtTop) {
          // Page still scrolled → don't intercept, let page scroll up
          return;
        }
        // Page is fully at top → now scroll right column up
        if (!atTop) {
          e.preventDefault();
          el.scrollTop += e.deltaY;
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  const showrooms = [
    {
      city: 'Jaipur Office',
      address: 'A-50, Kanaram Nagar,\nSikar Road,\nJaipur - 302039',
      mapUrl: 'https://maps.google.com/?q=A-50,+Kanaram+Nagar,+Sikar+Road,+Jaipur+-+302039'
    },
    {
      city: 'Get In Touch',
      isContactDetails: true,
      phone: '+91-7073803090',
      email: 'support@futuremilestone.shop'
    }
  ];

  const socialCards = [
    { name: 'YouTube', href: 'https://www.youtube.com/@futuremilestoneindia' },
    { name: 'Instagram', href: '/' },
    { name: 'Pinterest', href: '/' },
    { name: 'Facebook', href: '/' }
  ];

  return (
    <div className="w-full flex flex-col lg:flex-row gap-3 bg-bg-primary select-text transition-theme relative lg:h-screen">

      {/* Left Column: Studio Image */}
      <section className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pl-3 lg:pr-0 flex items-stretch h-[400px] md:h-[600px] lg:h-[calc(100vh-24px)] lg:max-h-[calc(100vh-24px)] flex-shrink-0 transition-theme">
        <div className="h-full rounded-xl overflow-hidden relative border border-border-accent/40 w-full group shadow-sm">
          <img
            src="/images/tTnxI9bEGHuPLga5HlUAYCJjneY_bc98a1.webp"
            alt="Future Milestone Furniture Studio"
            className="absolute inset-0 w-full h-full object-cover brightness-[0.95]"
          />
          <div className="absolute inset-0 bg-black/5" />
        </div>
      </section>

      {/* Right Column: Scrollable Content */}
      <div ref={rightColumnRef} className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pr-3 lg:pl-0 flex flex-col gap-3 transition-theme lg:h-[calc(100vh-24px)] lg:max-h-[calc(100vh-24px)] lg:overflow-y-auto scrollbar-none">

        {/* Contact Form Card */}
        <div className="bg-bg-secondary p-8 md:p-12 rounded-xl border border-border-accent/40 transition-theme flex-1 flex flex-col justify-between gap-8">
          <div className="space-y-6">
            <h1 className="font-dm-sans text-3xl md:text-[40px] font-medium tracking-tight text-fg-primary leading-[1.15]">
              Let's Talk
            </h1>
          </div>

          {submitted ? (
            <div className="bg-green-500/10 text-green-500 border border-green-500/20 px-6 py-8 rounded-xl text-center space-y-3 animate-fade-in my-auto">
              <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-bold text-base">Message Sent Successfully!</h3>
              <p className="text-xs text-fg-secondary">Thank you for reaching out. We will get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 w-full">
              {error && (
                <div className="bg-red-500/10 text-red-500 border border-red-500/20 px-5 py-3.5 rounded-xl text-xs font-semibold animate-fade-in flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 2a10 10 0 110 20A10 10 0 0112 2z" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  disabled={submitting}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your Name"
                  className="w-full bg-bg-primary text-fg-primary placeholder:text-fg-secondary/60 border border-border-accent/40 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-fg-primary transition-colors font-medium disabled:opacity-60"
                />
                <input
                  type="email"
                  required
                  disabled={submitting}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Your Email"
                  className="w-full bg-bg-primary text-fg-primary placeholder:text-fg-secondary/60 border border-border-accent/40 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-fg-primary transition-colors font-medium disabled:opacity-60"
                />
              </div>

              <div>
                <textarea
                  required
                  rows={6}
                  disabled={submitting}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Your Message"
                  className="w-full bg-bg-primary text-fg-primary placeholder:text-fg-secondary/60 border border-border-accent/40 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-fg-primary transition-colors resize-none font-medium disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-fg-primary text-bg-primary py-4 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-bg-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Sending Message...</span>
                  </>
                ) : (
                  <span>Send Message</span>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Showrooms Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {showrooms.map((showroom) => (
            <div
              key={showroom.city}
              className="bg-bg-secondary border border-border-accent/40 p-8 rounded-xl transition-theme flex flex-col justify-between gap-6 min-h-[220px]"
            >
              {showroom.isContactDetails ? (
                <>
                  <div className="space-y-4">
                    <h2 className="font-dm-sans text-xl md:text-2xl font-medium text-fg-primary tracking-tight">
                      {showroom.city}
                    </h2>
                    <div className="space-y-2 text-sm">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-fg-secondary font-medium">Call Us</span>
                        <a href={`tel:${showroom.phone}`} className="text-fg-primary hover:underline font-semibold transition-all">
                          {showroom.phone}
                        </a>
                      </div>
                      <div className="flex flex-col gap-0.5 pt-1">
                        <span className="text-xs text-fg-secondary font-medium">Email Us</span>
                        <a href={`mailto:${showroom.email}`} className="text-fg-primary hover:underline font-semibold transition-all break-all">
                          {showroom.email}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`mailto:${showroom.email}`}
                      className="inline-flex items-center bg-fg-primary text-bg-primary px-4 py-2 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity shadow-sm"
                    >
                      Email Now ↗
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <h2 className="font-dm-sans text-xl md:text-2xl font-medium text-fg-primary tracking-tight">
                      {showroom.city}
                    </h2>
                    <p className="text-sm text-fg-secondary leading-relaxed font-normal whitespace-pre-line">
                      {showroom.address}
                    </p>
                  </div>
                  <div>
                    <a
                      href={showroom.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-fg-primary text-bg-primary px-4 py-2 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity shadow-sm"
                    >
                      Get Direction ↗
                    </a>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
