'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useCurrency, COUNTRY_LIST } from '@/context/CurrencyContext';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { country, setCountry } = useCurrency();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredCountries = COUNTRY_LIST.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.currency.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search on open
  useEffect(() => {
    if (dropdownOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [dropdownOpen]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="w-full pb-3 transition-theme z-10">
      <div className="flex flex-col md:flex-row gap-3 w-full">

        {/* Left Card: Brand, description, links, creator */}
        <div className="w-full md:w-[calc(100%-412px)] bg-fg-primary text-bg-primary rounded-2xl p-8 md:p-12 lg:p-16 flex flex-col lg:flex-row justify-between gap-12 lg:gap-16 transition-theme">
          {/* Brand and Actions column */}
          <div className="flex flex-col justify-between gap-8 max-w-sm">
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-2 text-bg-primary font-dm-sans text-xl font-bold tracking-tight select-none group/logo">
                {/* Logo Icon SVG */}
                <span className="relative w-[20px] h-[18px] flex items-center justify-center -translate-y-[1px]">
                  <img
                    src="/images/menu-icon-light.svg"
                    alt="Logo"
                    className="absolute inset-0 w-full h-full object-contain footer-logo-light"
                  />
                  <img
                    src="/images/menu-icon-dark.svg"
                    alt="Logo"
                    className="absolute inset-0 w-full h-full object-contain footer-logo-dark"
                  />
                </span>
                {/* Logo text: top-to-bottom slide — "future milestone" visible by default, "Home" slides in from top on hover */}
                <span className="overflow-hidden h-[20px] flex flex-col">
                  <span
                    className="flex flex-col transition-transform duration-300 -translate-y-[20px] group-hover/logo:translate-y-0"
                    style={{ lineHeight: '20px' }}
                  >
                    <span>Home</span>
                    <span>future milestone</span>
                  </span>
                </span>
              </Link>
              <p className="text-sm text-bg-primary/70 leading-relaxed font-medium">
                01 Scandinavian furniture, meticulously handcrafted to bring warmth and elegance into your home.
              </p>
            </div>

            <div className="space-y-5">

              <p className="text-xs text-bg-primary/50 font-medium">
                © Made by{' '}
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-bg-primary underline transition-colors"
                >
                  Future Milestone Furniture
                </a>
              </p>
            </div>
          </div>

          {/* Links columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-12 lg:gap-16">
            {/* Pages Column */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-bg-primary/40 select-none">Pages</h4>
              <ul className="space-y-2.5 text-sm">
                <li className='mb-4'>
                  <Link href="/" className="footer-menu-link group/fitem overflow-hidden h-[16px] flex flex-col">
                    <span className="flex flex-col transition-transform duration-300 group-hover/fitem:-translate-y-[16px]" style={{ lineHeight: '16px' }}>
                      <span>Home</span>
                      <span>Home</span>
                    </span>
                  </Link>
                </li>
                <li className='mb-4'>
                  <Link href="/about" className="footer-menu-link group/fitem overflow-hidden h-[16px] flex flex-col">
                    <span className="flex flex-col transition-transform duration-300 group-hover/fitem:-translate-y-[16px]" style={{ lineHeight: '16px' }}>
                      <span>About</span>
                      <span>About</span>
                    </span>
                  </Link>
                </li>
                <li className='mb-4'>
                  <Link href="/licensing" className="footer-menu-link group/fitem overflow-hidden h-[16px] flex flex-col">
                    <span className="flex flex-col transition-transform duration-300 group-hover/fitem:-translate-y-[16px]" style={{ lineHeight: '16px' }}>
                      <span>Licensing</span>
                      <span>Licensing</span>
                    </span>
                  </Link>
                </li>
                <li className='mb-4'>
                  <Link href="/404" className="footer-menu-link group/fitem overflow-hidden h-[16px] flex flex-col">
                    <span className="flex flex-col transition-transform duration-300 group-hover/fitem:-translate-y-[16px]" style={{ lineHeight: '16px' }}>
                      <span>404</span>
                      <span>404</span>
                    </span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Help Column */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-bg-primary/40 select-none">Help</h4>
              <ul className="space-y-2.5 text-sm ">
                <li className='mb-4'>
                  <Link href="/faq" className="footer-menu-link group/fitem overflow-hidden h-[16px] flex flex-col">
                    <span className="flex flex-col transition-transform duration-300 group-hover/fitem:-translate-y-[16px]" style={{ lineHeight: '16px' }}>
                      <span>FAQ</span>
                      <span>FAQ</span>
                    </span>
                  </Link>
                </li>
                <li className='mb-4'>
                  <Link href="/contact" className="footer-menu-link group/fitem overflow-hidden h-[16px] flex flex-col">
                    <span className="flex flex-col transition-transform duration-300 group-hover/fitem:-translate-y-[16px]" style={{ lineHeight: '16px' }}>
                      <span>Contact</span>
                      <span>Contact</span>
                    </span>
                  </Link>
                </li>
                <li className='mb-4'>
                  <Link href="/terms" className="footer-menu-link group/fitem overflow-hidden h-[16px] flex flex-col">
                    <span className="flex flex-col transition-transform duration-300 group-hover/fitem:-translate-y-[16px]" style={{ lineHeight: '16px' }}>
                      <span>Terms</span>
                      <span>Terms</span>
                    </span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* CMS Column */}
            <div className="space-y-4 col-span-2 sm:col-span-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-bg-primary/40 select-none">CMS</h4>
              <ul className="space-y-2.5 text-sm">
                <li className='mb-4'>
                  <Link href="/shop" className="footer-menu-link group/fitem overflow-hidden h-[16px] flex flex-col">
                    <span className="flex flex-col transition-transform duration-300 group-hover/fitem:-translate-y-[16px]" style={{ lineHeight: '16px' }}>
                      <span>Shop</span>
                      <span>Shop</span>
                    </span>
                  </Link>
                </li>
                <li className='mb-4'>
                  <Link href="/shop/sona" className="footer-menu-link group/fitem overflow-hidden h-[16px] flex flex-col">
                    <span className="flex flex-col transition-transform duration-300 group-hover/fitem:-translate-y-[16px]" style={{ lineHeight: '16px' }}>
                      <span>Shop Product</span>
                      <span>Shop Product</span>
                    </span>
                  </Link>
                </li>
                <li className='mb-4'>
                  <Link href="/shop?category=wood" className="footer-menu-link group/fitem overflow-hidden h-[16px] flex flex-col">
                    <span className="flex flex-col transition-transform duration-300 group-hover/fitem:-translate-y-[16px]" style={{ lineHeight: '16px' }}>
                      <span>Shop Category</span>
                      <span>Shop Category</span>
                    </span>
                  </Link>
                </li>
                <li className='mb-4'>
                  <Link href="/blog" className="footer-menu-link group/fitem overflow-hidden h-[16px] flex flex-col">
                    <span className="flex flex-col transition-transform duration-300 group-hover/fitem:-translate-y-[16px]" style={{ lineHeight: '16px' }}>
                      <span>Blog</span>
                      <span>Blog</span>
                    </span>
                  </Link>
                </li>
                <li className='mb-4'>
                  <Link href="/blog/5-ways-scandinavian-design-can-transform-your-space" className="footer-menu-link group/fitem overflow-hidden h-[16px] flex flex-col">
                    <span className="flex flex-col transition-transform duration-300 group-hover/fitem:-translate-y-[16px]" style={{ lineHeight: '16px' }}>
                      <span>Blog Post</span>
                      <span>Blog Post</span>
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Card: Newsletter Signup & Country Selector */}
        <div className="w-full md:w-[400px] bg-fg-primary text-bg-primary rounded-2xl p-8 md:p-10 flex flex-col justify-between gap-8 relative transition-theme">

          {/* Newsletter heading */}
          <div className="space-y-4 mt-2">
            <h3 className="font-dm-sans text-2xl md:text-3xl font-bold leading-[1.2] text-bg-primary tracking-tight">
              Join our newsletter and get 20% off your first purchase
            </h3>
          </div>

          {/* Form */}
          <form onSubmit={handleSubscribe} className="space-y-3 z-10">
            <div className="space-y-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                className="w-full bg-bg-primary/10 border border-bg-primary/20 text-bg-primary placeholder-bg-primary/40 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-bg-primary transition-colors font-medium"
              />
              <button
                type="submit"
                className="w-full bg-bg-primary text-fg-primary py-3 rounded-lg font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer focus:outline-none"
              >
                Subscribe
              </button>
            </div>

            {subscribed && (
              <p className="text-xs text-green-400 font-semibold animate-pulse">
                Thank you! Check your inbox for your 20% code.
              </p>
            )}
          </form>

          {/* Country / Currency Selector */}
          <div className="z-10" ref={dropdownRef}>
            <p className="text-[10px] uppercase tracking-widest text-bg-primary/40 font-bold mb-2 select-none">
              Region &amp; Currency
            </p>

            {/* Trigger Button */}
            <button
              id="country-selector-btn"
              onClick={() => { setDropdownOpen((p) => !p); setSearch(''); }}
              className="w-full flex items-center justify-between gap-3 bg-bg-primary/10 hover:bg-bg-primary/20 border border-bg-primary/20 rounded-xl px-4 py-3 text-sm font-medium text-bg-primary transition-colors cursor-pointer focus:outline-none group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl leading-none flex-shrink-0">{country.flag}</span>
                <span className="truncate">{country.name}</span>
                <span className="text-bg-primary/50 text-xs font-bold flex-shrink-0">{country.currency}</span>
              </div>
              <svg
                className={`w-4 h-4 flex-shrink-0 text-bg-primary/50 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute bottom-full mb-2 left-0 right-0 mx-4 md:mx-0 md:left-8 md:right-8 bg-bg-primary rounded-2xl border border-border-accent shadow-2xl overflow-hidden z-50 flex flex-col"
                style={{ maxHeight: '320px' }}
              >
                {/* Search */}
                <div className="p-3 border-b border-border-accent flex-shrink-0">
                  <div className="flex items-center gap-2 bg-bg-secondary rounded-xl px-3 py-2 border border-border-accent/60">
                    <svg className="w-3.5 h-3.5 text-fg-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      ref={searchRef}
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search country or currency…"
                      className="flex-1 bg-transparent text-fg-primary text-xs placeholder-fg-secondary/50 focus:outline-none"
                    />
                    {search && (
                      <button onClick={() => setSearch('')} className="text-fg-secondary hover:text-fg-primary transition-colors cursor-pointer">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Country List */}
                <div className="overflow-y-auto flex-1">
                  {filteredCountries.length === 0 ? (
                    <div className="py-8 text-center text-fg-secondary text-xs">No results found</div>
                  ) : (
                    filteredCountries.map((c) => {
                      const isSelected = c.code === country.code;
                      return (
                        <button
                          key={c.code}
                          onClick={() => {
                            setCountry(c.code);
                            setDropdownOpen(false);
                            setSearch('');
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer text-left ${
                            isSelected
                              ? 'bg-fg-primary/8 text-fg-primary font-semibold'
                              : 'text-fg-secondary hover:bg-fg-primary/5 hover:text-fg-primary'
                          }`}
                        >
                          <span className="text-lg leading-none w-6 flex-shrink-0 text-center">{c.flag}</span>
                          <span className="flex-1 min-w-0 truncate">{c.name}</span>
                          <span className="text-[10px] font-bold text-fg-secondary/60 flex-shrink-0">{c.symbol} {c.currency}</span>
                          {isSelected && (
                            <svg className="w-3.5 h-3.5 text-fg-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </footer>
  );
}
