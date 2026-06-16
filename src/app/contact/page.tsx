'use client';

import { useState, useRef, useEffect } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
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
      city: 'Prague',
      address: 'Vinohradská 121,\n130 00 Praha 3,\nCzech Republic',
      mapUrl: 'https://maps.google.com/'
    },
    {
      city: 'Hamburg',
      address: 'Gänsemarkt 2,\n20354 Hamburg,\nGermany',
      mapUrl: 'https://maps.google.com/'
    }
  ];

  const socialCards = [
    { name: 'Twitter', href: '/' },
    { name: 'Instagram', href: '/' },
    { name: 'Pinterest', href: '/' },
    { name: 'Behance', href: '/' }
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your Name"
                  className="w-full bg-bg-primary text-fg-primary placeholder:text-fg-secondary/60 border border-border-accent/40 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-fg-primary transition-colors font-medium"
                />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Your Email"
                  className="w-full bg-bg-primary text-fg-primary placeholder:text-fg-secondary/60 border border-border-accent/40 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-fg-primary transition-colors font-medium"
                />
              </div>

              <div>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Your Message"
                  className="w-full bg-bg-primary text-fg-primary placeholder:text-fg-secondary/60 border border-border-accent/40 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-fg-primary transition-colors resize-none font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-fg-primary text-bg-primary py-4 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Send Message
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
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
