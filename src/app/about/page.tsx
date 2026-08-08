'use client';

import Link from 'next/link';
import LogoMarquee from '@/components/logo-marquee';
import { useRef, useEffect, useState } from 'react';

const DEFAULT_TEAM = [
  {
    name: 'Shrawan',
    role: 'Founder & Lead Artisan',
    image: '/images/Shrawan.webp',
    socials: { youtube: 'https://www.youtube.com/@futuremilestoneindia', instagram: 'https://www.instagram.com/fmfuturemilestone?igsh=Z2pmY2Y0dW1rZGtr', facebook: '#' }
  },
  {
    name: 'Team FM',
    role: 'Master Craftsmen',
    image: '/images/h1y6JnX5fmEv7JAvfZNIqpWM_3a8d82.webp',
    socials: { youtube: 'https://www.youtube.com/@futuremilestoneindia', instagram: 'https://www.instagram.com/fmfuturemilestone?igsh=Z2pmY2Y0dW1rZGtr', facebook: '#' }
  }
];

export default function About() {
  const [team, setTeam] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/team')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.team && data.team.length > 0) {
          setTeam(data.team);
        } else {
          setTeam(DEFAULT_TEAM);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch team members:', err);
        setTeam(DEFAULT_TEAM);
      });
  }, []);

  const socialCards = [
    { name: 'YouTube', href: 'https://www.youtube.com/@futuremilestoneindia' },
    { name: 'Instagram', href: 'https://www.instagram.com/fmfuturemilestone?igsh=Z2pmY2Y0dW1rZGtr' },
    { name: 'Pinterest', href: '/' },
    { name: 'Facebook', href: '/' }
  ];

  const rightColumnRef = useRef<HTMLDivElement>(null);
  const aboutSectionRef = useRef<HTMLDivElement>(null);

  const scrollToAbout = (e: React.MouseEvent) => {
    e.preventDefault();
    if (aboutSectionRef.current) {
      aboutSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Scroll priority:
  //  ↓ Down  → right column first → then page (footer/social appear)
  //  ↑ Up    → page first (footer/social disappear) → then right column
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (window.innerWidth < 1024) return;
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
      <section className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pl-3 lg:pr-0 flex items-stretch h-[350px] md:h-[500px] lg:h-full flex-shrink-0 transition-theme">
        <div className="h-full rounded-xl overflow-hidden relative border border-border-accent/40 w-full group shadow-sm">
          <img
            src="/images/about.png"
            alt="Future Milestone Furniture"
            className="absolute inset-0 w-full h-full object-cover brightness-[0.95] transition-transform duration-700 group-hover:scale-101"
          />
          <div className="absolute inset-0 bg-black/5" />

          {/* Floating Bottom-Right Tag with Inset Rounded Curves */}
          <div className="absolute bottom-0 right-0 bg-bg-primary pr-5 pb-3.5 pt-3.5 pl-6 rounded-tl-2xl select-none z-10 transition-theme border-t border-l border-border-accent/10">
            <span className="font-dm-sans font-bold text-fg-primary text-xs tracking-wider">
              Future Milestone
            </span>
          </div>
        </div>
      </section>

      {/* Right Column: Scrollable Content */}
      <div ref={rightColumnRef} className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pr-3 lg:pl-0 flex flex-col gap-3 transition-theme lg:h-full lg:overflow-y-auto scrollbar-none">

        {/* Right Top Section: Hero text card and client logos marquee */}
        <section className="w-full flex flex-col gap-3 lg:min-h-[calc(100vh-24px)]">
          {/* Hero text card */}
          <div className="w-full bg-bg-secondary rounded-xl p-6 md:p-10 lg:p-16 flex flex-col justify-between flex-1 min-h-0 border border-border-accent/40 transition-theme gap-8">
            <div className="space-y-6">
              <h1 className="font-dm-sans text-[28px] sm:text-[32px] md:text-[38px] lg:text-[48px] font-bold leading-[1.15] tracking-tight text-fg-primary max-w-[540px]">
                Crafting Timeless Wooden Artistry for Every Space
              </h1>
              <p className="text-xs md:text-sm text-fg-secondary leading-relaxed font-medium max-w-[480px]">
                Welcome to Future Milestone, a brand born from the passion, creativity, and craftsmanship of talented home-grown artists, Shrawan and team FM. Inspired by India&apos;s rich heritage of woodworking and handcrafted artistry, we create premium wooden products that bring warmth, functionality, and timeless beauty to homes and workplaces.
              </p>
            </div>
            <div>
              <a
                href="#about-content"
                onClick={scrollToAbout}
                className="bg-bg-primary text-fg-primary px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all inline-block shadow-md focus:outline-none border border-border-accent/40 cursor-pointer"
              >
                Explore Our Story
              </a>
            </div>
          </div>
          {/* Logo Marquee slider */}
          <LogoMarquee />
        </section>

        {/* Anchor for Explore button scroll */}
        <div id="about-content" className="scroll-mt-24" />

        {/* Right Bottom Section: Story, Mission and Team */}
        <div className="w-full flex flex-col gap-3">

          {/* About Section */}
          <section ref={aboutSectionRef} className="w-full flex flex-col gap-3" id="about-content">
            {/* Title Card */}
            <div className="w-full bg-bg-secondary border border-border-accent/40 rounded-xl py-5 flex items-center justify-center transition-theme">
              <h2 className="font-dm-sans text-xs font-bold text-fg-primary uppercase tracking-widest text-center">About Future Milestone</h2>
            </div>
            {/* Content Card */}
            <div className="w-full bg-bg-secondary border border-border-accent/40 rounded-xl p-8 md:p-12 lg:p-16 flex flex-col gap-6 transition-theme">
              <h3 className="font-dm-sans text-2xl md:text-3xl font-bold text-fg-primary tracking-tight leading-[1.25]">
                Handcrafted Excellence & Cultural Heritage
              </h3>
              <div className="text-xs md:text-sm text-fg-secondary leading-relaxed font-medium space-y-5">
                <p>
                  Welcome to Future Milestone, a brand born from the passion, creativity, and craftsmanship of talented home-grown artists, Shrawan and team FM. Inspired by India&apos;s rich heritage of woodworking and handcrafted artistry, we create premium wooden products that bring warmth, functionality, and timeless beauty to homes and workplaces.
                </p>
                <p>
                  At Future Milestone, every piece is thoughtfully designed and meticulously handcrafted to celebrate the natural elegance of wood. Our collection includes kitchenware, serveware, chopping boards, coasters, condiments, desk organizers, paperweights, wooden boxes, wall murals, swings, storage solutions, organizers, and a variety of home, restaurant, hotel and office utility and décor products that seamlessly blend traditional craftsmanship with contemporary design.
                </p>
                <p>
                  What began as a vision of Shrawan and team FM has grown into a commitment to creating products that are both beautiful and practical. Their dedication to quality, attention to detail, and love for authentic craftsmanship are reflected in every creation. Each product is carefully crafted to highlight the unique grains, textures, and character of natural wood, making every piece truly one of a kind.
                </p>
                <p>
                  We believe that handcrafted products tell a story—one of creativity, skill, and cultural heritage. Through Future Milestone, we strive to preserve traditional woodworking techniques while introducing designs that complement modern lifestyles. Our goal is to create meaningful products that become a cherished part of your everyday life, whether in your kitchen, living room, office, or workspace.
                </p>
                <p>
                  Quality, sustainability, and authenticity are at the heart of everything we do. By choosing Future Milestone, you are supporting Indian craftsmanship and the vision of artisans who believe that the finest products are made by hand, with passion and purpose. Beyond our signature collection, Future Milestone also specializes in bespoke and custom wooden products crafted to your unique vision. Whether you need personalized home décor, custom furniture, restaurant and hotel accessories, corporate gifts, branded merchandise, or exclusive wooden creations, our skilled artisans work closely with you to design handcrafted pieces that perfectly match your style, requirements, and space.
                </p>
              </div>

              {/* Highlight Quote Box */}
              <div className="mt-2 p-6 rounded-xl bg-bg-primary border border-border-accent/40 transition-theme">
                <p className="font-dm-sans text-xs md:text-sm font-semibold text-fg-primary leading-relaxed italic">
                  &ldquo;Future Milestone is more than a brand—it is a journey of craftsmanship, creativity, and a commitment to transforming natural wood into timeless works of art for homes and offices across India and beyond.&rdquo;
                </p>
              </div>
            </div>
          </section>

          {/* Our Mission Section */}
          <section className="w-full flex flex-col gap-3">
            {/* Title Card */}
            <div className="w-full bg-bg-secondary border border-border-accent/40 rounded-xl py-5 flex items-center justify-center transition-theme">
              <h2 className="font-dm-sans text-xs font-bold text-fg-primary uppercase tracking-widest text-center">Our Mission</h2>
            </div>
            {/* Mission Content Card */}
            <div className="w-full bg-bg-secondary border border-border-accent/40 rounded-xl p-8 md:p-12 lg:p-16 flex flex-col gap-6 transition-theme">
              <h3 className="font-dm-sans text-2xl md:text-3xl font-bold text-fg-primary tracking-tight leading-[1.25]">
                Preserving Heritage & Inspiring Modern Workspaces
              </h3>
              <div className="text-xs md:text-sm text-fg-secondary leading-relaxed font-medium space-y-5">
                <p>
                  At Future Milestone, our mission is to preserve and celebrate the rich heritage of Indian woodworking by creating premium handcrafted wooden handicrafts, furniture, and home décor that combine timeless craftsmanship with modern design. We are committed to delivering exceptional quality, sustainability, and authenticity in every product we create.
                </p>
                <p>
                  We strive to empower skilled Indian artisans, promote traditional woodworking techniques, and craft functional, elegant, and durable wooden products that enrich homes, offices, and everyday living. Through innovation, ethical craftsmanship, and customer satisfaction, we aim to become a trusted destination for handcrafted wooden products in India and across the world.
                </p>
              </div>

              {/* Purpose Box */}
              <div className="mt-2 p-6 rounded-xl bg-bg-primary border border-border-accent/40 transition-theme">
                <p className="font-dm-sans text-xs md:text-sm font-bold text-fg-primary leading-relaxed">
                  Our purpose is simple: to transform natural wood into meaningful creations that inspire, endure, and become a cherished part of every home and workspace.
                </p>
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section className="w-full flex flex-col gap-3">
            {/* Title Card */}
            <div className="w-full bg-bg-secondary border border-border-accent/40 rounded-xl py-5 flex items-center justify-center transition-theme">
              <h2 className="font-dm-sans text-xs font-bold text-fg-primary uppercase tracking-widest text-center">Our Artisans & Team</h2>
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
                      {/* YouTube */}
                      <a href={member.socials?.youtube || member.socials?.twitter || '#'} className="hover:text-fg-primary transition-colors p-1" aria-label="YouTube">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                      </a>
                      {/* Instagram */}
                      <a href={member.socials?.instagram || '#'} className="hover:text-fg-primary transition-colors p-1" aria-label="Instagram">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01" />
                        </svg>
                      </a>
                      {/* Facebook */}
                      <a href={member.socials?.facebook || member.socials?.behance || '#'} className="hover:text-fg-primary transition-colors p-1" aria-label="Facebook">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
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
