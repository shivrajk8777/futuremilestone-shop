'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { products } from '@/data/products';

interface Hotspot {
  top: string;
  left: string;
  text: string;
  image: string;
}

interface Slide {
  slug: string;
  name: string;
  tagline: string;
  price: number;
  bgImage: string;
  hotspots: Hotspot[];
}

// Sale badge per slug — matches reference image (50% OFF shown on Sage)
const saleBadges: Record<string, string> = {
  sage: '50% OFF',
  skala: '50% OFF',
};

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const favoritesCarouselRef = useRef<HTMLDivElement>(null);

  // Slideshow config with hotspots coordinates and images extracted from index.html
  const slides: Slide[] = [
    {
      slug: 'sona',
      name: 'Crafting Comfort, Inspired by the North',
      tagline: 'Crafted for style and lasting durability, perfect for any space.',
      price: 650,
      bgImage: '/images/s1Gw9pyuUEC9vViCqmou6hRgI_bc9f50.webp',
      hotspots: [
        { top: '51%', left: '66.2%', text: 'Soft leather, durable cushioning.', image: '/images/1c3s4XR0YhiP5U0jMudG8pcXqDA_692e67.webp' },
        { top: '39%', left: '55.8%', text: 'Handcrafted wood finish.', image: '/images/vb8XKVhsi1CNqzR5Bozhb2yTXeo_ca005a.webp' },
        { top: '27.7%', left: '38.4%', text: 'Ergonomic and supportive.', image: '/images/GbiVrsgrVhulfQoqpcQTKA1u4_a30742.webp' },
      ],
    },
    {
      slug: 'sage',
      name: 'Natural Elegance in Every Detail',
      tagline: 'Crafted from solid oak with a smooth finish, timeless and durable.',
      price: 380,
      bgImage: '/images/M8cpp44fcecDccZvJuknm85uc_a5408b.webp',
      hotspots: [
        { top: '24.9%', left: '55.8%', text: 'Smooth, curved wood for support.', image: '/images/ppC0TOwOtlTewHNf7WaCGikU_0452aa.webp' },
        { top: '46.1%', left: '45.9%', text: 'Soft padding for added comfort.', image: '/images/iDjFIbeOY7plKQSKHHFlkGVJyg_cf2b8d.webp' },
      ],
    },
    {
      slug: 'nest',
      name: 'Modern Minimalism, Maximum Comfort',
      tagline: 'Simple, sleek, and built for a cozy, stylish lifestyle.',
      price: 360,
      bgImage: '/images/yWfiT9hCK49Xggoq1k9TvLHyUY_7361e6.webp',
      hotspots: [
        { top: '23.1%', left: '54.3%', text: 'Solid wood with metal accents.', image: '/images/VoEmH1ywV91w47wrTCDlGjxtk_682c4e.webp' },
        { top: '46.4%', left: '41.9%', text: 'Sleek, minimalist tubular design.', image: '/images/AkTgfzbvVkgxks7FPF6tzFzn9E_c95bb0.webp' },
      ],
    },
  ];


  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Section Products: 8 Favorites (Skala, Nest, Runa, Lykke, Holt, Kapp, Sol, Elm)
  const favorites = products.filter(p => ['skala', 'nest', 'runa', 'lykke', 'holt', 'kapp', 'sol', 'elm'].includes(p.slug));

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (favoritesCarouselRef.current) {
      const scrollAmount = favoritesCarouselRef.current.clientWidth;
      favoritesCarouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };



  return (
    <div className="flex flex-col gap-3 pb-3">

      {/* 1. Top Announcement Marquee */}
      <section className="w-full overflow-hidden bg-fg-primary text-bg-primary py-2.5 rounded-xl border border-border-accent/40 select-none transition-theme">
        <div className="flex whitespace-nowrap animate-marquee">
          <div className="flex gap-8 px-4 text-xs font-bold uppercase tracking-wider">
            <span>Save 20% on your first order</span>
            <span>-</span>
            <span>Save 20% on your first order</span>
            <span>-</span>
            <span>Save 20% on your first order</span>
            <span>-</span>
            <span>Save 20% on your first order</span>
            <span>-</span>
          </div>
          <div className="flex gap-8 px-4 text-xs font-bold uppercase tracking-wider" aria-hidden="true">
            <span>Save 20% on your first order</span>
            <span>-</span>
            <span>Save 20% on your first order</span>
            <span>-</span>
            <span>Save 20% on your first order</span>
            <span>-</span>
            <span>Save 20% on your first order</span>
            <span>-</span>
          </div>
        </div>
      </section>

      {/* 2. Section Hero (Slideshow) */}
      <section className="relative h-[100vh] md:h-[720px] w-full overflow-hidden group rounded-xl border border-border-accent/40">
        {/* Slides */}
        <div className="absolute inset-0 flex transition-transform duration-1000 ease-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {slides.map((slide) => (
            <div key={slide.slug} className="relative w-full h-full flex-shrink-0">
              <img
                src={slide.bgImage}
                alt={slide.name}
                className="absolute inset-0 w-full h-full object-cover brightness-[0.8] dark:brightness-[0.7]"
              />
              <div className="absolute inset-0 bg-black/10" />

              {/* Hotspot Pins */}
              {slide.hotspots.map((hotspot, idx) => (
                <div
                  key={idx}
                  className="absolute group/pin z-20 -translate-x-1/2 -translate-y-1/2"
                  style={{ top: hotspot.top, left: hotspot.left }}
                >
                  {/* + icon with expanding aura, rotates to × on hover */}
                  <div className="relative flex items-center justify-center cursor-pointer">
                    {/* Aura ring — small by default, grows on hover */}
                    <span className="absolute rounded-full bg-white/25 transition-all duration-300 ease-out w-9 h-9 group-hover/pin:w-14 group-hover/pin:h-14" />
                    {/* Button circle */}
                    <button className="relative w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg focus:outline-none">
                      <span
                        className="text-black font-light transition-transform duration-300 group-hover/pin:rotate-45 select-none leading-none"
                        style={{ fontSize: '20px', lineHeight: 1 }}
                      >+</span>
                    </button>
                  </div>

                  {/* Tooltip Card (Hover-triggered) */}
                  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-56 bg-bg-primary/95 backdrop-blur-md rounded-xl border border-border-accent p-3 flex gap-3 shadow-xl opacity-0 group-hover/pin:opacity-100 pointer-events-none group-hover/pin:pointer-events-auto transition-all duration-300 transform translate-y-2 group-hover/pin:translate-y-0 transition-theme">
                    <div className="w-12 h-12 bg-bg-secondary rounded-lg overflow-hidden flex-shrink-0 relative border border-border-accent/40">
                      <img src={hotspot.image} alt={hotspot.text} className="object-cover w-full h-full" />
                    </div>
                    <div className="flex-1 flex items-center">
                      <p className="text-[11px] font-bold text-fg-primary leading-tight">{hotspot.text}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Product Content Card (Bottom-Left) */}
              <div className="absolute bottom-12 left-6 md:left-12 max-w-[calc(100%-48px)] md:max-w-[400px] bg-bg-primary rounded-xl p-8 md:p-10 flex flex-col gap-6 md:gap-8 shadow-2xl transition-theme">
                <div className="flex flex-col gap-2">
                  <h2 className="font-dm-sans text-2xl md:text-[32px] font-bold leading-[1.2] text-fg-primary tracking-tight">{slide.name}</h2>
                  <p className="text-xs md:text-base text-fg-secondary leading-[1.6]">{slide.tagline}</p>
                </div>
                <div>
                  <Link
                    href={`/shop/${slide.slug}`}
                    className="relative pb-0.5 text-xs md:text-sm font-bold uppercase tracking-wider text-fg-primary hover:text-fg-secondary transition-colors inline-block group/btn"
                  >
                    View Product
                    <span className="absolute bottom-0 left-0 w-full h-[1px] bg-fg-primary transition-colors group-hover/btn:bg-fg-secondary" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Slide navigation controls */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 -translate-y-1/2 bg-bg-primary/90 text-fg-primary p-3 rounded-full border border-border-accent shadow-md opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none z-30 transition-theme"
          aria-label="Previous Slide"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 -translate-y-1/2 bg-bg-primary/90 text-fg-primary p-3 rounded-full border border-border-accent shadow-md opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none z-30 transition-theme"
          aria-label="Next Slide"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dot Indicators — bottom center */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`rounded-full transition-all duration-300 focus:outline-none ${idx === currentSlide
                ? 'w-2.5 h-2.5 bg-white'
                : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
            />
          ))}
        </div>
      </section>

      {/* 3. Section Benefits (Hidden on mobile) */}
      <section className="hidden md:flex bg-fg-primary text-bg-primary rounded-xl px-12 py-6 justify-center gap-16 items-center shadow-sm transition-theme">
        {/* Benefit 1 */}
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <span className="text-xs font-bold tracking-wider uppercase">Free Shipping over 500€</span>
        </div>
        {/* Benefit 2 */}
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9h18" />
          </svg>
          <span className="text-xs font-bold tracking-wider uppercase">Worldwide Shipping</span>
        </div>
        {/* Benefit 3 */}
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
          </svg>
          <span className="text-xs font-bold tracking-wider uppercase">Free Returns</span>
        </div>
        {/* Benefit 4 */}
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-xs font-bold tracking-wider uppercase">5-Year Warranty</span>
        </div>
      </section>

      {/* 4. Section Products Header Card */}
      <div className="w-full bg-bg-secondary border border-border-accent/40 rounded-xl py-6 flex items-center justify-center transition-theme">
        <h2 className="font-dm-sans text-base font-bold text-fg-primary tracking-tight">Our Favorites</h2>
      </div>

      {/* 5. Section Products Carousel */}
      <section className="w-full relative px-0">
        {/* Scroll Buttons - Overlay Floating on Carousel */}
        <div className="absolute top-1/2 -translate-y-1/2 left-4 z-20 hidden md:block">
          <button
            onClick={() => scrollCarousel('left')}
            className="p-3 rounded-full border border-border-accent hover:border-fg-primary transition-colors bg-bg-primary/90 text-fg-primary shadow-md"
            aria-label="Previous Products"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 right-4 z-20 hidden md:block">
          <button
            onClick={() => scrollCarousel('right')}
            className="p-3 rounded-full border border-border-accent hover:border-fg-primary transition-colors bg-bg-primary/90 text-fg-primary shadow-md"
            aria-label="Next Products"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Carousel Grid wrapper */}
        <div
          ref={favoritesCarouselRef}
          className="flex gap-3 overflow-x-auto pb-4 scroll-smooth scrollbar-none snap-x snap-mandatory w-full"
        >
          {favorites.map((product) => (
            <div
              key={product.slug}
              className="w-[calc(100%-24px)] sm:w-[calc(50%-6px)] lg:w-[calc(25%-9px)] flex-shrink-0 snap-start bg-bg-secondary/40 rounded-xl overflow-hidden group h-[600px] relative border border-border-accent/40"
            >
              {/* Product Background Image */}
              <img
                src={product.images[0]}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover transition-[transform,filter] duration-700 group-hover:scale-[1.03] group-hover:blur-md"
              />

              {/* Top-Right Sale Badge */}
              {saleBadges[product.slug] && (
                <div className="absolute top-3 right-3 bg-white text-black text-[10px] font-bold px-2.5 py-1 rounded-lg z-10 tracking-wider uppercase">
                  {saleBadges[product.slug]}
                </div>
              )}

              {/* Floating Top-Left Title Tab */}
              <div className="absolute top-0 left-0 bg-bg-primary pr-6 pb-3 pt-3 pl-4 rounded-br-2xl select-none z-10 transition-all duration-300">
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
                <span className="font-dm-sans font-bold text-fg-primary text-sm tracking-tight flex items-center transition-all duration-300">
                  <span>{product.name}</span>
                  <span className="opacity-0 max-w-0 inline-block overflow-hidden translate-x-[-4px] group-hover:opacity-100 group-hover:max-w-[20px] group-hover:translate-x-0 group-hover:ml-1.5 transition-all duration-300 ease-out">
                    ↗
                  </span>
                </span>
              </div>

              {/* Animated Pop-up Bottom Price Bar */}
              <div className="absolute left-3 right-3 bottom-3 bg-bg-primary rounded-xl p-5 flex items-center justify-between shadow-xl z-10 border border-border-accent/20 transition-all duration-500 [transition-timing-function:cubic-bezier(0.34,1.42,0.64,1)] opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 max-md:opacity-100 max-md:translate-y-0">
                <span className="text-sm font-bold text-fg-primary">${product.price}</span>
                <Link
                  href={`/shop/${product.slug}`}
                  className="bg-fg-primary text-bg-primary px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Section Collections Header Card */}
      <div className="w-full bg-bg-secondary border border-border-accent/40 rounded-xl py-6 flex items-center justify-center transition-theme">
        <h2 className="font-dm-sans text-base font-bold text-fg-primary tracking-tight">Collections</h2>
      </div>

      {/* 7. Section Collections (Asymmetric layout) */}
      <section className="w-full flex flex-col md:flex-row gap-3">
        {/* Left Column - Wood collection (Large Card) */}
        <div className="w-full md:w-1/2 h-[450px] md:h-[776px] rounded-xl overflow-hidden relative border border-border-accent/40 group">
          <img
            src="/images/4edEXYzlI9czhhBmZMvj3fhSs_7dc234.webp"
            alt="Wood Collection"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
          />
          <div className="absolute inset-0 bg-black/5" />

          {/* Floating Bottom-Left Card */}
          <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 w-[260px] bg-bg-primary rounded-xl p-8 flex flex-col gap-6 shadow-xl transition-theme">
            <div className="flex flex-col gap-2">
              <h3 className="font-dm-sans text-xl font-bold text-fg-primary">Wood</h3>
              <p className="text-xs text-fg-secondary leading-[1.6]">Our Wood Collection celebrates the natural beauty of wood.</p>
            </div>
            <div>
              <Link
                href="/shop?category=wood"
                className="relative pb-0.5 text-xs font-bold uppercase tracking-wider text-fg-primary hover:text-fg-secondary transition-colors inline-block group/link"
              >
                View Collection
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-fg-primary transition-colors group-hover/link:bg-fg-secondary" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column - Dark and Modern (2 rows of side-by-side) */}
        <div className="w-full md:w-1/2 flex flex-col gap-3 justify-between">

          {/* Row 1 - Dark Collection (Image left, Card right) */}
          <div className="flex flex-col sm:flex-row gap-3 h-auto sm:h-[382px] w-full">
            {/* Image (Left) */}
            <div className="w-full sm:w-1/1 h-[250px] sm:h-full rounded-xl overflow-hidden relative border border-border-accent/40 group">
              <img
                src="/images/oaJMCWVJsdqXc6aQzq9Tl9QeDAc_24347b.webp"
                alt="Dark Collection"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
              />
            </div>
            {/* Card Content (Right - Solid Dark Inverse background) */}
            <div className="w-full sm:w-1/2 h-auto sm:h-full bg-fg-primary text-bg-primary rounded-xl p-8 sm:p-10 flex flex-col justify-center gap-2 relative border border-border-accent/40 transition-theme">
              <h3 className="font-dm-sans text-xl font-bold text-bg-primary">Dark</h3>
              <p className="text-xs text-bg-secondary/80 leading-[1.6]">Rrefined finishes bring an air of sophistication and drama to any room.</p>
              <div className="mt-4">
                <Link
                  href="/shop?category=dark"
                  className="relative pb-0.5 text-xs font-bold uppercase tracking-wider text-bg-primary hover:text-bg-secondary transition-colors inline-block group/link"
                >
                  View Collection
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-bg-primary transition-colors group-hover/link:bg-bg-secondary" />
                </Link>
              </div>
            </div>
          </div>

          {/* Row 2 - Modern Collection (Card left, Image right) */}
          <div className="flex flex-col sm:flex-row gap-3 h-auto sm:h-[382px] w-full">
            {/* Card Content (Left - Solid Dark Inverse background) */}
            <div className="w-full sm:w-1/2 h-auto sm:h-full bg-fg-primary text-bg-primary rounded-xl p-8 sm:p-10 flex flex-col justify-center gap-2 relative border border-border-accent/40 order-last sm:order-first transition-theme">
              <h3 className="font-dm-sans text-xl font-bold text-bg-primary">Modern</h3>
              <p className="text-xs text-bg-secondary/80 leading-[1.6]">The Modern Collection brings together graceful lines and luxurious finishes.</p>
              <div className="mt-4">
                <Link
                  href="/shop?category=modern"
                  className="relative pb-0.5 text-xs font-bold uppercase tracking-wider text-bg-primary hover:text-bg-secondary transition-colors inline-block group/link"
                >
                  View Collection
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-bg-primary transition-colors group-hover/link:bg-bg-secondary" />
                </Link>
              </div>
            </div>
            {/* Image (Right) */}
            <div className="w-full sm:w-1/1 h-[250px] sm:h-full rounded-xl overflow-hidden relative border border-border-accent/40 group">
              <img
                src="/images/w5m4XOOnjmRFKQEUeSndBEswbw4_d8f1da.webp"
                alt="Modern Collection"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
              />
            </div>
          </div>

        </div>
      </section>

      {/* 8. Section About Header Card */}
      <div className="w-full bg-bg-secondary border border-border-accent/40 rounded-xl py-6 flex items-center justify-center transition-theme">
        <h2 className="font-dm-sans text-base font-bold text-fg-primary tracking-tight">About Us</h2>
      </div>

      {/* 9. Section About Us (Split Card Layout) */}
      <section className="w-full flex flex-col md:flex-row gap-3 h-auto md:h-[600px] items-stretch">
        {/* Left Card content (Light gray background) */}
        <div className="w-full md:w-[40%] bg-bg-secondary border border-border-accent/40 rounded-xl p-8 md:p-16 flex flex-col justify-between gap-12 order-last md:order-none h-auto md:h-full transition-theme">
          <h3 className="font-dm-sans text-[28px] md:text-[32px] font-bold text-fg-primary leading-[1.2] tracking-tight">
            Designing Spaces, <br className="hidden md:inline" />Inspiring Connection
          </h3>
          <div className="flex flex-col gap-6">
            <p className="text-sm md:text-base text-fg-secondary leading-[1.6]">
              At Hanssen, our mission is to create furniture that brings people together, inspired by the simplicity and warmth of Scandinavian design.
            </p>
            <div>
              <Link
                href="/about"
                className="relative pb-0.5 text-xs font-bold uppercase tracking-wider text-fg-primary hover:text-fg-secondary transition-colors inline-block group/link"
              >
                More About Us
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-fg-primary transition-colors group-hover/link:bg-fg-secondary" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right staged Image card */}
        <div className="w-full md:w-[60%] h-[300px] md:h-full rounded-xl overflow-hidden relative border border-border-accent/40 order-first md:order-none">
          <img
            src="/images/TRNAt6di5Swwdq8nGr6m4FLg4AU_76cb7c.webp"
            alt="Staged Interior Design"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

    </div>
  );
}
