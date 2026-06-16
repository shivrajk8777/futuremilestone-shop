'use client';

import Link from 'next/link';
import LogoMarquee from '@/components/logo-marquee';
import { useRef, useEffect } from 'react';

export default function About() {
  const team = [
    {
      name: 'Erik Jansen',
      role: 'Head of Design',
      image: '/images/HuqNTe7ZlAoHRwcSqCGZZ9PGYQQ_df2789.webp',
      socials: { twitter: '#', instagram: '#', behance: '#' }
    },
    {
      name: 'Ingrid Dahl',
      role: 'Brand Director',
      image: '/images/h1y6JnX5fmEv7JAvfZNIqpWM_3a8d82.webp',
      socials: { twitter: '#', instagram: '#', behance: '#' }
    },
    {
      name: 'Lars Nielsen',
      role: 'Design Lead',
      image: '/images/2CRV7Lv7j9PMwzDEghUpkq1E_9cf406.webp',
      socials: { twitter: '#', instagram: '#', behance: '#' }
    },
    {
      name: 'Freja Lindberg',
      role: 'Product Manager',
      image: '/images/rvdz4HAqDoqO5NrNPW0qi7zWhg_4212c2.webp',
      socials: { twitter: '#', instagram: '#', behance: '#' }
    }
  ];

  const socialCards = [
    { name: 'Twitter', href: '/' },
    { name: 'Instagram', href: '/' },
    { name: 'Pinterest', href: '/' },
    { name: 'Behance', href: '/' }
  ];

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

  return (
    <div className="w-full flex flex-col lg:flex-row gap-3 bg-bg-primary select-text transition-theme relative lg:h-screen">

      {/* Left Column: Large Image (Stable on Desktop) */}
      <section className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pl-3 lg:pr-0 flex items-stretch h-[400px] md:h-[600px] lg:h-full flex-shrink-0 transition-theme">
        <div className="h-full rounded-xl overflow-hidden relative border border-border-accent/40 w-full group shadow-sm">
          <img
            src="/images/xz7hJ6ESQ5b48HiLq5UkSZLMyM_a48801.webp"
            alt="We are Future Milestone Furniture"
            className="absolute inset-0 w-full h-full object-cover brightness-[0.95] transition-transform duration-700 group-hover:scale-101"
          />
          <div className="absolute inset-0 bg-black/5" />

          {/* Floating Bottom-Right Tag with Inset Rounded Curves */}
          <div className="absolute bottom-0 right-0 bg-bg-primary pr-5 pb-3.5 pt-3.5 pl-6 rounded-tl-2xl select-none z-10 transition-theme border-t border-l border-border-accent/10">
            {/* Curved Edge SVG - Left */}
            <div className="absolute bottom-0 -left-[18px] w-[18px] h-[18px] pointer-events-none">
              <svg viewBox="0 0 18 18" className="w-[18px] h-[18px]" style={{ fill: 'var(--background-primary)' }}>
                <path d="M 0 18 L 18 18 C 8.059 18 0 9.941 0 0 Z" />
              </svg>
            </div>
            {/* Curved Edge SVG - Top */}
            <div className="absolute -top-[18px] right-0 w-[18px] h-[18px] pointer-events-none rotate-180">
              <svg viewBox="0 0 18 18" className="w-[18px] h-[18px]" style={{ fill: 'var(--background-primary)' }}>
                <path d="M 0 18 L 18 18 C 8.059 18 0 9.941 0 0 Z" />
              </svg>
            </div>
            <span className="font-dm-sans font-bold text-fg-primary text-xs uppercase tracking-wider">
              We are Future Milestone Furniture
            </span>
          </div>
        </div>
      </section>

      {/* Right Column: Scrollable Content */}
      <div ref={rightColumnRef} className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pr-3 lg:pl-0 flex flex-col gap-3 transition-theme lg:h-full lg:overflow-y-auto scrollbar-none">

        {/* Right Top Section: Hero text card and client logos marquee */}
        <section className="w-full flex flex-col gap-3 lg:min-h-[calc(100vh-24px)]">
          {/* Hero text card */}
          <div className="w-full bg-bg-secondary rounded-xl p-8 md:p-12 lg:p-16 flex flex-col justify-between flex-1 min-h-0 border border-border-accent/40 transition-theme gap-8">
            <div className="space-y-6">
              <h1 className="font-dm-sans text-[32px] md:text-[40px] lg:text-[48px] font-bold leading-[1.15] tracking-tight text-fg-primary max-w-[540px]">
                Things to Look for When Comparing Branding Alternatives
              </h1>
              <p className="text-xs md:text-sm text-fg-secondary leading-relaxed font-medium max-w-[480px]">
                Scandinavian design emphasizes simplicity, natural light, and clean lines. Explore how this minimalist style can transform your home into a calming, functional space that's both stylish and inviting.
              </p>
            </div>
            <div>
              <Link
                href="#about-content"
                className="bg-bg-primary text-fg-primary px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all inline-block shadow-md focus:outline-none border border-border-accent/40"
              >
                Explore
              </Link>
            </div>
          </div>
          {/* Logo Marquee slider */}
          <LogoMarquee />
        </section>

        {/* Anchor for Explore button scroll */}
        <div id="about-content" className="scroll-mt-24" />

        {/* Right Bottom Section: Mission and Team */}
        <div className="w-full flex flex-col gap-3">

          {/* Mission Section */}
          <section className="w-full flex flex-col gap-3">
            {/* Title Card */}
            <div className="w-full bg-bg-secondary border border-border-accent/40 rounded-xl py-5 flex items-center justify-center transition-theme">
              <h2 className="font-dm-sans text-xs font-bold text-fg-primary uppercase tracking-widest text-center">Our Mission</h2>
            </div>
            {/* Content Card */}
            <div className="w-full bg-bg-secondary border border-border-accent/40 rounded-xl p-8 md:p-12 lg:p-16 flex flex-col gap-6 transition-theme">
              <h3 className="font-dm-sans text-2xl md:text-3xl font-bold text-fg-primary tracking-tight leading-[1.25]">
                The Liberating Power of Minimalism
              </h3>
              <div className="text-xs md:text-sm text-fg-secondary leading-relaxed font-medium space-y-4">
                <p>
                  Decluttering begins with the act of letting go. It's about freeing ourselves from the weight of excess possessions that no longer serve us. By evaluating each item and asking ourselves whether it brings us joy or serves a practical purpose, we can make mindful decisions about what to keep and what to release. Letting go of the unnecessary allows us to create a physical and mental space that promotes clarity and tranquility.
                </p>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer facilisis lorem quis pretium posuere. Nam gravida orci in massa convallis vestibulum. Sed venenatis hendrerit gravida. In nec lectus diam. Sed tellus justo, aliquam id eros sit amet, condimentum ullamcorper justo. In lacinia, purus ut congue pharetra, elit sapien aliquam turpis, non viverra dui ante id orci. Nam laoreet ornare urna, in varius nibh finibus sit amet. Quisque sed.
                </p>
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section className="w-full flex flex-col gap-3">
            {/* Title Card */}
            <div className="w-full bg-bg-secondary border border-border-accent/40 rounded-xl py-5 flex items-center justify-center transition-theme">
              <h2 className="font-dm-sans text-xs font-bold text-fg-primary uppercase tracking-widest text-center">Our Team</h2>
            </div>
            {/* Team Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
              {team.map((member) => (
                <div key={member.name} className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-border-accent/40 bg-bg-secondary/40">
                  {/* Absolute Background Image */}
                  <img
                    src={member.image}
                    alt={member.name}
                    className="absolute inset-0 w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-103"
                  />

                  {/* Floating Name Tag (Top Left) */}
                  <div className="absolute top-0 left-0 bg-bg-primary pr-5 pb-2.5 pt-2.5 pl-4 rounded-br-2xl select-none z-10 transition-theme border-r border-b border-border-accent/10">
                    {/* Curved Edge SVG - Right */}
                    <div className="absolute top-0 -right-[18px] w-[18px] h-[18px] pointer-events-none rotate-90">
                      <svg viewBox="0 0 18 18" className="w-[18px] h-[18px]" style={{ fill: 'var(--background-primary)' }}>
                        <path d="M 0 18 L 18 18 C 8.059 18 0 9.941 0 0 Z" />
                      </svg>
                    </div>
                    {/* Curved Edge SVG - Bottom */}
                    <div className="absolute -bottom-[18px] left-0 w-[18px] h-[18px] pointer-events-none rotate-90">
                      <svg viewBox="0 0 18 18" className="w-[18px] h-[18px]" style={{ fill: 'var(--background-primary)' }}>
                        <path d="M 0 18 L 18 18 C 8.059 18 0 9.941 0 0 Z" />
                      </svg>
                    </div>
                    <span className="font-dm-sans font-bold text-fg-primary text-xs tracking-tight transition-colors">
                      {member.name}
                    </span>
                  </div>

                  {/* Sliding Hover Content Box (Bottom) - Always visible on mobile, hover-up on desktop */}
                  <div className="absolute left-4 right-4 bg-bg-primary rounded-xl p-4 flex items-center justify-between shadow-lg transition-all duration-300 ease-out z-10 bottom-4 lg:bottom-[-80px] lg:group-hover:bottom-4 border border-border-accent/20 transition-theme">
                    <div>
                      <p className="font-dm-sans font-bold text-fg-primary text-xs tracking-tight uppercase">{member.role}</p>
                    </div>
                    <div className="flex gap-2.5 text-fg-secondary">
                      {/* Twitter */}
                      <a href={member.socials.twitter} className="hover:text-fg-primary transition-colors p-1" aria-label="Twitter">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </a>
                      {/* Instagram */}
                      <a href={member.socials.instagram} className="hover:text-fg-primary transition-colors p-1" aria-label="Instagram">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01" />
                        </svg>
                      </a>
                      {/* Behance */}
                      <a href={member.socials.behance} className="hover:text-fg-primary transition-colors p-1" aria-label="Behance">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.2 17.93c-3.17-.4-5.83-2.31-7.14-5.06a8.96 8.96 0 005.15 1.54c.73 0 1.43-.1 2.1-.28a9.42 9.42 0 01-.11 3.8zm2.46-.8c.09-.79.13-1.63.11-2.51.69-.1 1.34-.23 1.94-.4a7.99 7.99 0 01-2.05 2.91zm-1.6-3.8c-.59.16-1.2.26-1.85.28A10.87 10.87 0 016.9 14.16a7.7 7.7 0 01-.84-2.28 10.15 10.15 0 004.99-.08 17.57 17.57 0 011.66 3.65 14.12 14.12 0 001.35-.12zm-3-4.9c-.31.39-.6.82-.87 1.28a8.2 8.2 0 01-4.14.07 7.96 7.96 0 012.38-3.5 12.18 12.18 0 002.63 2.15zm3.87.65a15.82 15.82 0 00-1.57-3.4 10.5 10.5 0 013.9 1.63 7.8 7.8 0 01-2.33 1.77zm-3.23-4.52a14.2 14.2 0 012.28 3.06c-.66.36-1.37.66-2.12.87A10.3 10.3 0 018.66 4.9c.75-.28 1.56-.44 2.4-.44z" clipRule="evenodd" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

      </div>

    </div>
  );
}
