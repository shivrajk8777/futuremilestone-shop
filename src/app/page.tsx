'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { products } from '@/data/products';
import { useCollections } from '@/context/CollectionContext';
import { useProducts } from '@/context/ProductContext';
import { useSettings } from '@/context/SettingsContext';



// Sale badge per slug — matches reference image (50% OFF shown on Sage)
const saleBadges: Record<string, string> = {
  sage: '50% OFF',
  skala: '50% OFF',
};

export default function Home() {
  const { settings, loading: settingsLoading } = useSettings();
  const [currentSlide, setCurrentSlide] = useState(0);
  const favoritesCarouselRef = useRef<HTMLDivElement>(null);


  const { state: { collections, loading, error, fetched } } = useCollections();
  const { state: productState } = useProducts();

  const activeSlides = settings.slides && settings.slides.length > 0 ? settings.slides : [];

  const nextSlide = () => {
    if (activeSlides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  };

  const prevSlide = () => {
    if (activeSlides.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  // Section Products: latest 8 products dynamically
  const dynamicProducts = productState.productsByCategory['all'] || [];
  const favorites = dynamicProducts.slice(0, 8);
  const isProductsLoading = productState.loading['all'] || !productState.initialFetched;

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (favoritesCarouselRef.current) {
      const scrollAmount = favoritesCarouselRef.current.clientWidth;
      favoritesCarouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };



  const showMarquee = !settingsLoading && settings.marqueeVisible;

  return (
    <div className={`flex flex-col gap-3 pb-3 ${showMarquee ? '' : 'pt-3'}`}>

      {/* 1. Top Announcement Marquee */}
      {showMarquee && (
        <section className="overflow-hidden bg-fg-primary text-bg-primary py-2.5 rounded-xl border border-border-accent/40 select-none transition-theme">
          <div className="w-[95%] md:w-1/2 mx-auto overflow-hidden ">
            <div className="flex whitespace-nowrap animate-marquee">
              <div className="flex gap-8 px-4 text-xs  tracking-wider shrink-0 min-w-max">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <React.Fragment key={idx}>
                    <span>{settings.marqueeText}</span>
                    <span>-</span>
                  </React.Fragment>
                ))}
              </div>
              <div className="flex gap-8 px-4 text-xs  tracking-wider shrink-0 min-w-max" aria-hidden="true">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <React.Fragment key={idx}>
                    <span>{settings.marqueeText}</span>
                    <span>-</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Section Hero (Slideshow) */}
      {!settingsLoading && settings.carouselVisible && activeSlides.length > 0 && (
        <section className="relative h-[450px] md:h-[calc(99vh-76px)] w-full overflow-hidden group rounded-xl border border-border-accent/40">
          {/* Slides */}
          <div className="absolute inset-0 flex transition-transform duration-1000 ease-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {activeSlides.map((slide: any) => (
              <div key={slide.slug} className="relative w-full h-full flex-shrink-0">
                <img
                  src={slide.bgImage}
                  alt={slide.name}
                  className="absolute inset-0 w-full h-full object-cover brightness-[0.8] dark:brightness-[0.7]"
                />
                <div className="absolute inset-0 bg-black/10" />

                {/* Product Content Card (Bottom-Center on mobile, Bottom-Left on md) */}
                <div className="absolute bottom-6 left-4 right-4 md:right-auto md:bottom-12 md:left-12 md:max-w-[400px] bg-bg-primary rounded-xl p-5 md:p-10 flex flex-col md:gap-8 shadow-2xl transition-theme">
                  <div className="flex flex-row md:flex-col justify-between items-end md:items-start gap-4 md:gap-2">
                    <h2 className="font-dm-sans text-lg md:text-[32px] font-bold leading-[1.3] md:leading-[1.2] text-fg-primary tracking-tight flex-1">{slide.name}</h2>
                    <Link
                      href={`/shop/${slide.slug}`}
                      className="relative pb-0.5 text-xs md:text-sm font-bold uppercase tracking-wider text-fg-primary hover:text-fg-secondary transition-colors inline-block group/btn flex-shrink-0 mb-1 md:mb-0"
                    >
                      View <span className="hidden md:inline">Product</span>
                      <span className="absolute bottom-0 left-0 w-full h-[1px] bg-fg-primary transition-colors group-hover/btn:bg-fg-secondary" />
                    </Link>
                  </div>
                  <p className="hidden md:block text-xs md:text-base text-fg-secondary leading-[1.6]">{slide.tagline}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Slide navigation controls */}
          <button
            onClick={prevSlide}
            className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 md:bg-bg-primary/90 text-white md:text-fg-primary p-2 md:p-3 md:rounded-full md:border md:border-border-accent md:shadow-md opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none z-30 transition-theme"
            aria-label="Previous Slide"
          >
            <svg className="w-8 h-8 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 md:bg-bg-primary/90 text-white md:text-fg-primary p-2 md:p-3 md:rounded-full md:border md:border-border-accent md:shadow-md opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none z-30 transition-theme"
            aria-label="Next Slide"
          >
            <svg className="w-8 h-8 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dot Indicators — bottom center */}
          <div className="absolute bottom-28 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {activeSlides.map((_: any, idx: number) => (
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
      )}

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
        {isProductsLoading ? (
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none w-full">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="w-[calc(100%-24px)] sm:w-[calc(50%-6px)] lg:w-[calc(25%-9px)] flex-shrink-0 rounded-xl overflow-hidden h-[600px] relative border border-border-accent/40 animate-wave"
              >
                {/* Floating Top-Left Title Tab Skeleton */}
                <div className="absolute top-0 left-0 bg-bg-primary pr-6 pb-3 pt-3 pl-4 rounded-br-2xl w-36 h-12 select-none z-10">
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
                  <div className="h-4 bg-border-accent/30 rounded w-24 mt-1" />
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <>
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
          </>
        ) : (
          <div className="text-center py-20 border border-dashed border-border-accent rounded-xl">
            <h3 className="text-lg font-bold text-fg-primary">No products found</h3>
            <p className="text-sm text-fg-secondary mt-1">Try adding products to the database.</p>
          </div>
        )}
      </section>

      {/* 6 & 7. Dynamic Section Collections (Asymmetric layout) */}
      {(!fetched || loading) && collections.length === 0 ? (
        <>
          {/* 6. Section Collections Header Card Skeleton */}
          <div className="w-full bg-bg-secondary border border-border-accent/40 rounded-xl py-6 flex items-center justify-center transition-theme animate-pulse">
            <div className="h-5 bg-border-accent/30 rounded w-28" />
          </div>

          {/* 7. Section Collections (Asymmetric layout) Skeleton */}
          <section className="w-full flex flex-col md:flex-row gap-3">
            {/* Left Column Skeleton */}
            <div className="w-full md:w-1/2 h-[450px] md:h-[776px] rounded-xl overflow-hidden relative border border-border-accent/40 animate-wave">
              {/* Floating Bottom-Left Card Skeleton */}
              <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 w-[260px] bg-bg-primary rounded-xl p-8 flex flex-col gap-6 shadow-xl transition-theme animate-pulse">
                <div className="flex flex-col gap-2">
                  <div className="h-5 bg-border-accent/30 rounded w-24" />
                  <div className="h-3 bg-border-accent/20 rounded w-full" />
                  <div className="h-3 bg-border-accent/20 rounded w-5/6" />
                </div>
                <div className="h-3 bg-border-accent/30 rounded w-28 mt-2" />
              </div>
            </div>

            {/* Right Column Skeleton */}
            <div className="w-full md:w-1/2 flex flex-col gap-3 justify-between">
              {/* Row 1 Skeleton */}
              <div className="flex flex-col sm:flex-row gap-3 h-auto sm:h-[382px] w-full">
                <div className="w-full sm:w-1/2 h-[250px] sm:h-full rounded-xl overflow-hidden relative border border-border-accent/40 animate-wave" />
                <div className="w-full sm:w-1/2 h-auto sm:h-full bg-[#0e1011] rounded-xl p-8 sm:p-10 flex flex-col justify-center gap-2 relative border border-white/5 animate-pulse">
                  <div className="h-5 w-20 bg-white/10 rounded-md" />
                  <div className="h-3 w-full bg-white/10 rounded-md mt-2" />
                  <div className="h-3 w-4/5 bg-white/10 rounded-md" />
                  <div className="h-3 w-24 bg-white/10 rounded-md mt-4" />
                </div>
              </div>

              {/* Row 2 Skeleton */}
              <div className="flex flex-col sm:flex-row gap-3 h-auto sm:h-[382px] w-full">
                <div className="w-full sm:w-1/2 h-auto sm:h-full bg-[#0e1011] rounded-xl p-8 sm:p-10 flex flex-col justify-center gap-2 relative border border-white/5 order-last sm:order-first animate-pulse">
                  <div className="h-5 w-20 bg-white/10 rounded-md" />
                  <div className="h-3 w-full bg-white/10 rounded-md mt-2" />
                  <div className="h-3 w-4/5 bg-white/10 rounded-md" />
                  <div className="h-3 w-24 bg-white/10 rounded-md mt-4" />
                </div>
                <div className="w-full sm:w-1/2 h-[250px] sm:h-full rounded-xl overflow-hidden relative border border-border-accent/40 animate-wave" />
              </div>
            </div>
          </section>
        </>
      ) : fetched && !error && collections.length >= 3 ? (
        <>
          {/* 6. Section Collections Header Card */}
          <div className="w-full bg-bg-secondary border border-border-accent/40 rounded-xl py-6 flex items-center justify-center transition-theme">
            <h2 className="font-dm-sans text-base font-bold text-fg-primary tracking-tight">Collections</h2>
          </div>

          {/* 7. Section Collections (Asymmetric layout) */}
          <section className="w-full flex flex-col md:flex-row gap-3">
            {/* Left Column - Wood collection (Large Card) */}
            <div className="w-full md:w-1/2 h-[450px] md:h-[776px] rounded-xl overflow-hidden relative border border-border-accent/40 group">
              {collections[0].imageUrl && (
                <img
                  src={collections[0].imageUrl}
                  alt={collections[0].name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                />
              )}
              <div className="absolute inset-0 bg-black/5" />

              {/* Floating Bottom-Left Card */}
              <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 w-[260px] bg-bg-primary rounded-xl p-8 flex flex-col gap-6 shadow-xl transition-theme">
                <div className="flex flex-col gap-2">
                  <h3 className="font-dm-sans text-xl font-bold text-fg-primary">{collections[0].name}</h3>
                  <p className="text-xs text-fg-secondary leading-[1.6]">{collections[0].description}</p>
                </div>
                <div>
                  <Link
                    href={`/shop?category=${collections[0].slug}`}
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
                <div className="w-full sm:w-1/2 h-[250px] sm:h-full rounded-xl overflow-hidden relative border border-border-accent/40 group">
                  {collections[1].imageUrl && (
                    <img
                      src={collections[1].imageUrl}
                      alt={collections[1].name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                    />
                  )}
                </div>
                {/* Card Content (Right - Solid Dark Inverse background) */}
                <div className="w-full sm:w-1/2 h-auto sm:h-full bg-fg-primary text-bg-primary rounded-xl p-8 sm:p-10 flex flex-col justify-center gap-2 relative border border-border-accent/40 transition-theme">
                  <h3 className="font-dm-sans text-xl font-bold text-bg-primary">{collections[1].name}</h3>
                  <p className="text-xs text-bg-secondary/80 leading-[1.6]">{collections[1].description}</p>
                  <div className="mt-4">
                    <Link
                      href={`/shop?category=${collections[1].slug}`}
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
                  <h3 className="font-dm-sans text-xl font-bold text-bg-primary">{collections[2].name}</h3>
                  <p className="text-xs text-bg-secondary/80 leading-[1.6]">{collections[2].description}</p>
                  <div className="mt-4">
                    <Link
                      href={`/shop?category=${collections[2].slug}`}
                      className="relative pb-0.5 text-xs font-bold uppercase tracking-wider text-bg-primary hover:text-bg-secondary transition-colors inline-block group/link"
                    >
                      View Collection
                      <span className="absolute bottom-0 left-0 w-full h-[1px] bg-bg-primary transition-colors group-hover/link:bg-bg-secondary" />
                    </Link>
                  </div>
                </div>
                {/* Image (Right) */}
                <div className="w-full sm:w-1/2 h-[250px] sm:h-full rounded-xl overflow-hidden relative border border-border-accent/40 group">
                  {collections[2].imageUrl && (
                    <img
                      src={collections[2].imageUrl}
                      alt={collections[2].name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                    />
                  )}
                </div>
              </div>

            </div>
          </section>
        </>
      ) : null}

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
