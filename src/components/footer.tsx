'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

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
                    <span>future milestone</span>
                    <span>future milestone</span>
                  </span>
                </span>
              </Link>
              <p className="text-sm text-bg-primary/70 leading-relaxed font-medium">
                Your Finest Destination For Premium Wooden handicrafts & Furniture.
              </p>
            </div>

            <div className="space-y-5">

              <p className="text-xs text-bg-primary/50 font-medium">
                © FM{' '}
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-bg-primary underline transition-colors"
                >
                  Future Milestone
                </a>
              </p>
            </div>
          </div>

          {/* Links columns */}
          <div className="flex flex-wrap sm:flex-nowrap gap-12 sm:gap-16 lg:gap-20 shrink-0">
            {/* Pages Column */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-bg-primary/40 select-none">Pages</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/" className="footer-menu-link group/fitem overflow-hidden h-5 inline-block">
                    <span className="flex flex-col transition-transform duration-300 group-hover/fitem:-translate-y-5" style={{ lineHeight: '20px' }}>
                      <span>Home</span>
                      <span>Home</span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="footer-menu-link group/fitem overflow-hidden h-5 inline-block">
                    <span className="flex flex-col transition-transform duration-300 group-hover/fitem:-translate-y-5" style={{ lineHeight: '20px' }}>
                      <span>About</span>
                      <span>About</span>
                    </span>
                  </Link>
                </li>
                {/* <li>
                  <Link href="/licensing" className="footer-menu-link group/fitem overflow-hidden h-5 inline-block">
                    <span className="flex flex-col transition-transform duration-300 group-hover/fitem:-translate-y-5" style={{ lineHeight: '20px' }}>
                      <span>Licensing</span>
                      <span>Licensing</span>
                    </span>
                  </Link>
                </li> */}
              </ul>
            </div>

            {/* Help Column */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-bg-primary/40 select-none">Help</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/faq" className="footer-menu-link group/fitem overflow-hidden h-5 inline-block">
                    <span className="flex flex-col transition-transform duration-300 group-hover/fitem:-translate-y-5" style={{ lineHeight: '20px' }}>
                      <span>FAQ</span>
                      <span>FAQ</span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="footer-menu-link group/fitem overflow-hidden h-5 inline-block">
                    <span className="flex flex-col transition-transform duration-300 group-hover/fitem:-translate-y-5" style={{ lineHeight: '20px' }}>
                      <span>Contact Us</span>
                      <span>Contact Us</span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="footer-menu-link group/fitem overflow-hidden h-5 inline-block">
                    <span className="flex flex-col transition-transform duration-300 group-hover/fitem:-translate-y-5" style={{ lineHeight: '20px' }}>
                      <span>Terms</span>
                      <span>Terms</span>
                    </span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* CMS Column */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-bg-primary/40 select-none">CMS</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/shop" className="footer-menu-link group/fitem overflow-hidden h-5 inline-block">
                    <span className="flex flex-col transition-transform duration-300 group-hover/fitem:-translate-y-5" style={{ lineHeight: '20px' }}>
                      <span>Shop</span>
                      <span>Shop</span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="footer-menu-link group/fitem overflow-hidden h-5 inline-block">
                    <span className="flex flex-col transition-transform duration-300 group-hover/fitem:-translate-y-5" style={{ lineHeight: '20px' }}>
                      <span>Blog</span>
                      <span>Blog</span>
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

        </div>

      </div>
    </footer>
  );
}
