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
              <Link href="/" className="flex items-center gap-2 text-bg-primary font-dm-sans text-xl font-bold tracking-tight select-none">
                {/* Logo Icon SVG */}
                <svg viewBox="0 0 15 15" className="w-[15px] h-[15px] fill-current">
                  <path d="M 3.75 7.5 C 3.75 5.429 5.429 3.75 7.5 3.75 C 9.571 3.75 11.25 5.429 11.25 7.5 C 11.25 9.571 9.571 11.25 7.5 11.25 C 5.429 11.25 3.75 9.571 3.75 7.5 Z M 7.5 15 C 11.642 15 15 11.642 15 7.5 C 15 3.358 11.642 0 7.5 0 C 3.358 0 0 3.358 0 7.5 C 0 11.642 3.358 15 7.5 15 Z" />
                </svg>
                <span>Future milestone</span>
              </Link>
              <p className="text-sm text-bg-primary/70 leading-relaxed font-medium">
                Scandinavian furniture, meticulously handcrafted to bring warmth and elegance into your home.
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
              <ul className="space-y-2.5 text-sm font-semibold">
                <li>
                  <Link href="/" className="hover:text-bg-primary/70 transition-colors text-bg-primary">Home</Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-bg-primary/70 transition-colors text-bg-primary">About</Link>
                </li>
                <li>
                  <Link href="/licensing" className="hover:text-bg-primary/70 transition-colors text-bg-primary">Licensing</Link>
                </li>
                <li>
                  <Link href="/404" className="hover:text-bg-primary/70 transition-colors text-bg-primary">404</Link>
                </li>
              </ul>
            </div>

            {/* Help Column */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-bg-primary/40 select-none">Help</h4>
              <ul className="space-y-2.5 text-sm font-semibold">
                <li>
                  <Link href="/faq" className="hover:text-bg-primary/70 transition-colors text-bg-primary">FAQ</Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-bg-primary/70 transition-colors text-bg-primary">Contact</Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-bg-primary/70 transition-colors text-bg-primary">Terms</Link>
                </li>
              </ul>
            </div>

            {/* CMS Column */}
            <div className="space-y-4 col-span-2 sm:col-span-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-bg-primary/40 select-none">CMS</h4>
              <ul className="space-y-2.5 text-sm font-semibold">
                <li>
                  <Link href="/shop" className="hover:text-bg-primary/70 transition-colors text-bg-primary">Shop</Link>
                </li>
                <li>
                  <Link href="/shop/sona" className="hover:text-bg-primary/70 transition-colors text-bg-primary">Shop Product</Link>
                </li>
                <li>
                  <Link href="/shop?category=wood" className="hover:text-bg-primary/70 transition-colors text-bg-primary">Shop Category</Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-bg-primary/70 transition-colors text-bg-primary">Blog</Link>
                </li>
                <li>
                  <Link href="/blog/5-ways-scandinavian-design-can-transform-your-space" className="hover:text-bg-primary/70 transition-colors text-bg-primary">Blog Post</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Card: Newsletter Signup & Floating price badge */}
        <div className="w-full md:w-[400px] bg-fg-primary text-bg-primary rounded-2xl p-8 md:p-10 flex flex-col justify-between gap-8 relative overflow-hidden transition-theme">

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
