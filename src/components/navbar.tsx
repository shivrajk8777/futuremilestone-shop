'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { products, Product } from '@/data/products';
import { useCollections } from '@/context/CollectionContext';
import { useUser } from '@/context/UserContext';
import { useSettings } from '@/context/SettingsContext';
import AuthModal from '@/components/auth-modal';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { settings, loading } = useSettings();
  const { user, setAuthModalOpen, logout } = useUser();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchAbortRef = useRef<AbortController | null>(null);
  const [cart, setCart] = useState<{ product: Product & { selectedMaterial?: string; selectedDimension?: string }; quantity: number }[]>([]);
  const [hoveredLink, setHoveredLink] = useState<'collections' | 'about' | null>(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // ── Cart DB helpers ────────────────────────────────────────────────────────

  /** Save the given cart to the DB (fire-and-forget, only when logged in). */
  const saveCartToDB = async (
    cartItems: { product: Product & { selectedMaterial?: string; selectedDimension?: string }; quantity: number }[]
  ) => {
    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart: cartItems }),
      });
    } catch (err) {
      console.error('Failed to save cart to DB:', err);
    }
  };

  // ── Initialize theme from localStorage ────────────────────────────────────
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  // ── Load cart: DB (when logged in) or localStorage (guest) ─────────────────
  useEffect(() => {
    if (user === undefined) return; // still loading auth state

    if (user) {
      // User is logged in: fetch DB cart, then merge with any guest cart
      fetch('/api/cart')
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) return;

          const dbCart: typeof cart = data.cart ?? [];

          // Check if there are any unsaved local guest items to merge
          const rawLocal = localStorage.getItem('cart');
          const localCart: typeof cart = rawLocal ? JSON.parse(rawLocal) : [];

          if (localCart.length === 0) {
            // Nothing to merge – just use the DB cart
            setCart(dbCart);
          } else {
            // Merge: for each local item, add to DB cart or increment quantity
            const merged = [...dbCart];
            for (const localItem of localCart) {
              const lMat = localItem.product.selectedMaterial || 'Oak';
              const lDim = localItem.product.selectedDimension || 'Standard';
              const existingIdx = merged.findIndex((m) => {
                const mMat = m.product.selectedMaterial || 'Oak';
                const mDim = m.product.selectedDimension || 'Standard';
                return m.product.slug === localItem.product.slug && mMat === lMat && mDim === lDim;
              });
              if (existingIdx >= 0) {
                merged[existingIdx] = {
                  ...merged[existingIdx],
                  quantity: merged[existingIdx].quantity + localItem.quantity,
                };
              } else {
                merged.push(localItem);
              }
            }
            setCart(merged);
            // Persist merged cart back to DB
            saveCartToDB(merged);
          }

          // Remove guest localStorage cart now that we're synced with DB
          localStorage.removeItem('cart');
        })
        .catch((err) => console.error('Failed to load cart from DB:', err));
    } else {
      // Guest: load from localStorage
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error(e);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const container = document.getElementById('user-dropdown-container');
      if (container && !container.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Listen for cart updates
  useEffect(() => {
    const handleCartChange = () => {
      if (user) {
        // Logged-in: always read fresh from DB
        fetch('/api/cart')
          .then((res) => res.json())
          .then((data) => {
            if (data.success) setCart(data.cart ?? []);
          })
          .catch((err) => console.error('Cart refresh error:', err));
      } else {
        // Guest: read from localStorage
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      }
    };
    window.addEventListener('storage', handleCartChange);
    window.addEventListener('cart-updated', handleCartChange);
    return () => {
      window.removeEventListener('storage', handleCartChange);
      window.removeEventListener('cart-updated', handleCartChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Close search on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  /** Persist cart to localStorage (guest) or DB (logged-in user). */
  const persistCart = (updatedCart: typeof cart) => {
    if (user) {
      // Logged-in: sync to database (fire-and-forget)
      saveCartToDB(updatedCart);
      // Keep localStorage clean for guests
      localStorage.removeItem('cart');
    } else {
      // Guest: use localStorage
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    }
    window.dispatchEvent(new Event('cart-updated'));
  };

  const updateQuantity = (slug: string, material: string, dimension: string, delta: number) => {
    const updated = cart
      .map((item) => {
        const itemMat = item.product.selectedMaterial || 'Oak';
        const itemDim = item.product.selectedDimension || 'Standard';
        if (item.product.slug === slug && itemMat === material && itemDim === dimension) {
          return { ...item, quantity: Math.max(0, item.quantity + delta) };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);
    setCart(updated);
    persistCart(updated);
  };

  const removeFromCart = (slug: string, material: string, dimension: string) => {
    const updated = cart.filter((item) => {
      const itemMat = item.product.selectedMaterial || 'Oak';
      const itemDim = item.product.selectedDimension || 'Standard';
      return !(item.product.slug === slug && itemMat === material && itemDim === dimension);
    });
    setCart(updated);
    persistCart(updated);
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // ── DB search with debounce ────────────────────────────────────────────────
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);

    // Cancel previous in-flight request
    if (searchAbortRef.current) searchAbortRef.current.abort();
    const controller = new AbortController();
    searchAbortRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/products/search?q=${encodeURIComponent(trimmed)}&limit=8`,
          { signal: controller.signal }
        );
        const data = await res.json();
        if (data.success) {
          setSearchResults(data.products);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Search fetch error:', err);
        }
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const { state: collectionState } = useCollections();
  const collectionsList = collectionState.collections;

  const mobileLinks = [
    { name: 'Shop', href: '/shop' },
    ...collectionsList.map((col) => ({
      name: `${col.name} Collection`,
      href: `/shop?category=${col.slug}`,
    })),
    { name: 'About Us', href: '/about' },
    { name: 'FAQs', href: '/faq' },
    { name: 'Contact', href: '/contact' },
    { name: 'Blog', href: '/blog' },
  ];

  return (
    <>
      {/* Floating Split-Block Navbar Container */}
      <div
        className={`${pathname === '/' ? 'absolute' : 'fixed'} left-0 right-0 z-30 w-full flex justify-between items-start pointer-events-none transition-all duration-300 ${(pathname === '/' && !loading && settings.marqueeVisible) ? 'top-[38px]' : 'top-0'
          }`}
      >
        {/* Top 12px Solid Background Strip */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-bg-primary border-b border-border-accent/40 transition-theme z-20 pointer-events-auto" />

        {/* Left Block: Brand, Navigation Links, and Theme Switcher */}
        <div className={`pointer-events-auto bg-bg-primary rounded-br-2xl border-r border-b border-border-accent/40 pl-3 pr-4 py-2.5 md:pl-6 md:pr-8 md:py-1.5 items-center gap-3 md:gap-8 shadow-sm transition-theme relative z-30 ${isMobileMenuOpen ? 'hidden md:flex' : 'flex'}`}>

          {/* Inset Rounded Corners - Left Block */}
          {/* Bottom-Left Edge Curve */}
          <div className="absolute bottom-[-18px] left-0 w-[18px] h-[18px] overflow-hidden pointer-events-none z-10 select-none">
            <svg viewBox="0 0 18 18" className="w-full h-full transition-theme" style={{ fill: 'var(--background-primary)' }}>
              <path d="M 0 0 L 0 18 C 0 8.059 8.059 0 18 0 Z" />
            </svg>
          </div>
          {/* Top-Right Edge Curve */}
          <div className="absolute top-[12px] right-[-18px] w-[18px] h-[18px] pointer-events-none z-10 select-none">
            <div className="absolute top-0 left-[-1px] w-[2px] h-[18px] bg-bg-primary transition-theme" />
            <svg viewBox="0 0 18 18" className="w-full h-full transition-theme relative z-10" style={{ fill: 'var(--background-primary)' }}>
              <path d="M 0 0 L 0 18 C 0 8.059 8.059 0 18 0 Z" />
              <path d="M 0 18 C 0 8.059 8.059 0 18 0" fill="none" style={{ stroke: 'var(--border-accent)', strokeOpacity: 0.4 }} strokeWidth="1" />
            </svg>
          </div>

          {/* Logo link */}
          <Link href="/" className="flex items-center gap-1.5 md:gap-2 text-fg-primary font-dm-sans text-[14px] font-bold tracking-tight select-none group/logo">
            {/* Custom Logo Icon */}
            <img src={theme === 'dark' ? '/images/menu-icon-light.svg' : '/images/menu-icon-dark.svg'} alt="Logo" className="w-[15px] h-[15px] md:w-[18px] md:h-[20px] object-contain transition-theme -translate-y-[2px]" />
            {/* Logo text: top-to-bottom slide — "Future Milestone" visible by default, "Home" slides in from top on hover */}
            <span className="overflow-hidden h-[14px] flex flex-col">
              <span
                className="flex flex-col transition-transform duration-300 -translate-y-[14px] group-hover/logo:translate-y-0"
                style={{ lineHeight: '14px' }}
              >
                <span>Home</span>
                <span>future milestone</span>
              </span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-4">
            <Link
              href="/shop"
              className={`text-xs font-semibold tracking-wider group/shop overflow-hidden h-[14px] flex flex-col transition-colors duration-200 ${pathname === '/shop' ? 'text-fg-primary font-bold' : 'text-fg-secondary'
                }`}
            >
              <span className="flex flex-col transition-transform duration-300 group-hover/shop:-translate-y-[14px]">
                <span>Shop</span>
                <span>Shop</span>
              </span>
            </Link>

            {/* Collections Dropdown */}
            <div
              className="relative py-2"
              onMouseEnter={() => setHoveredLink('collections')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <button
                className={`text-xs font-semibold tracking-wider  transition-colors duration-200 hover:text-fg-primary flex items-center gap-1 cursor-pointer focus:outline-none group/col ${hoveredLink === 'collections' ? 'text-fg-primary' : 'text-fg-secondary'
                  }`}
              >
                <span className="overflow-hidden h-[14px] flex flex-col">
                  <span className="flex flex-col transition-transform duration-300 group-hover/col:-translate-y-[14px]">
                    <span>Collections</span>
                    <span>Collections</span>
                  </span>
                </span>
                {/* + rotates to × on hover */}
                <span
                  className="inline-block transition-transform duration-300"
                  style={{ transform: hoveredLink === 'collections' ? 'rotate(45deg)' : 'rotate(0deg)' }}
                >
                  +
                </span>
              </button>

              {hoveredLink === 'collections' && (
                <div className="absolute top-full left-0 mt-0 w-[280px] bg-bg-primary rounded-2xl border border-border-accent/60 shadow-xl p-2 flex flex-col gap-1 z-50 pointer-events-auto transition-theme animate-fade-in">
                  {collectionState.loading && collectionsList.length === 0 ? (
                    <div className="p-4 text-xs text-fg-secondary text-center">Loading collections...</div>
                  ) : collectionsList.length === 0 ? (
                    <div className="p-4 text-xs text-fg-secondary text-center">No collections found</div>
                  ) : (
                    collectionsList.map((item) => (
                      <Link
                        key={item.id}
                        href={`/shop?category=${item.slug}`}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-bg-secondary transition-colors group/citem"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-border-accent/40 bg-bg-secondary">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-border-accent flex items-center justify-center text-[10px] text-fg-secondary">No img</div>
                          )}
                        </div>
                        <span className="flex-1 text-sm font-semibold text-fg-primary">{item.name}</span>
                        {/* Arrow — bottom-to-top sliding animation */}
                        <div className="w-[18px] h-[18px] overflow-hidden flex flex-col pointer-events-none select-none">
                          <div className="flex flex-col transition-transform duration-300 group-hover/citem:-translate-y-[18px]">
                            <svg className="w-[18px] h-[18px] text-fg-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <svg className="w-[18px] h-[18px] text-fg-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* About Dropdown */}
            <div
              className="relative py-2"
              onMouseEnter={() => setHoveredLink('about')}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <button
                className={`text-xs font-semibold tracking-wider  transition-colors duration-200 hover:text-fg-primary flex items-center gap-1 cursor-pointer focus:outline-none group/abt ${hoveredLink === 'about' ? 'text-fg-primary' : 'text-fg-secondary'
                  }`}
              >
                <span className="overflow-hidden h-[14px] flex flex-col">
                  <span className="flex flex-col transition-transform duration-300 group-hover/abt:-translate-y-[14px]">
                    <span>About</span>
                    <span>About</span>
                  </span>
                </span>
                {/* + rotates to × on hover */}
                <span
                  className="inline-block transition-transform duration-300"
                  style={{ transform: hoveredLink === 'about' ? 'rotate(45deg)' : 'rotate(0deg)' }}
                >
                  +
                </span>
              </button>

              {hoveredLink === 'about' && (
                <div className="absolute top-full left-0 mt-0 w-[240px] bg-bg-primary rounded-2xl border border-border-accent/60 shadow-xl p-2 flex flex-col gap-1 z-50 pointer-events-auto transition-theme animate-fade-in">
                  {[
                    { name: 'About', href: '/about' },
                    { name: 'Contact', href: '/contact' },
                    { name: 'FAQ', href: '/faq' },
                  ].map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-bg-secondary transition-colors group/aitem"
                    >
                      <span className="text-sm font-semibold text-fg-primary">{item.name}</span>
                      {/* Arrow — bottom-to-top sliding animation */}
                      <div className="w-[18px] h-[18px] overflow-hidden flex flex-col pointer-events-none select-none">
                        <div className="flex flex-col transition-transform duration-300 group-hover/aitem:-translate-y-[18px]">
                          <svg className="w-[18px] h-[18px] text-fg-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <svg className="w-[18px] h-[18px] text-fg-secondary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/blog"
              className={`text-xs font-semibold tracking-wider  group/blog overflow-hidden h-[14px] flex flex-col transition-colors duration-200 ${pathname === '/blog' ? 'text-fg-primary font-bold' : 'text-fg-secondary'
                }`}
            >
              <span className="flex flex-col transition-transform duration-300 group-hover/blog:-translate-y-[14px]">
                <span>Blog</span>
                <span>Blog</span>
              </span>
            </Link>
          </nav>

          {/* Theme Switcher Pill Toggle */}
          <div className="flex items-center">
            <button
              onClick={toggleTheme}
              className="w-[30px] h-[20px] rounded-full p-[6px] flex items-center bg-border-accent hover:opacity-85 transition-all cursor-pointer relative focus:outline-none"
              aria-label="Toggle Theme"
            >
              <div
                className={`w-[8px] h-[8px] rounded-full bg-fg-primary transition-all duration-300 ${theme === 'light' ? 'translate-x-0' : 'translate-x-[10px]'
                  }`}
              />
            </button>
          </div>
        </div>

        {/* Right Block: Search and Cart Buttons */}
        <div className={`pointer-events-auto bg-bg-primary rounded-bl-2xl border-l border-b border-border-accent/40 pl-4 pr-3 py-2.5 md:pl-2 md:pr-6 md:py-1.5 items-center gap-1.5 md:gap-0 shadow-sm transition-theme relative z-30 ml-auto ${isMobileMenuOpen ? 'hidden md:flex' : 'flex'}`}>

          {/* Inset Rounded Corners - Right Block */}
          {/* Bottom-Right Edge Curve */}
          <div className="absolute bottom-[-18px] right-0 w-[18px] h-[18px] overflow-hidden pointer-events-none z-10 select-none">
            <svg viewBox="0 0 18 18" className="w-full h-full transition-theme rotate-180" style={{ fill: 'var(--background-primary)' }}>
              <path d="M 0 18 L 18 18 C 8.059 18 0 9.941 0 0 Z" />
            </svg>
          </div>
          {/* Top-Left Edge Curve */}
          <div className="absolute top-[12px] left-[-18px] w-[18px] h-[18px] pointer-events-none z-10 select-none">
            <div className="absolute top-0 right-[-1px] w-[2px] h-[18px] bg-bg-primary transition-theme" />
            <svg viewBox="0 0 18 18" className="w-full h-full transition-theme rotate-180 relative z-10" style={{ fill: 'var(--background-primary)' }}>
              <path d="M 0 18 L 18 18 C 8.059 18 0 9.941 0 0 Z" />
              <path d="M 18 18 C 8.059 18 0 9.941 0 0" fill="none" style={{ stroke: 'var(--border-accent)', strokeOpacity: 0.4 }} strokeWidth="1" />
            </svg>
          </div>

          {/* Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className={`p-1 md:p-1.5 text-fg-secondary hover:text-fg-primary transition-colors focus:outline-none cursor-pointer ${isMobileMenuOpen ? 'hidden md:block' : ''}`}
            aria-label="Search"
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className={`p-1 md:p-1.5 text-fg-secondary hover:text-fg-primary transition-colors focus:outline-none relative items-center cursor-pointer ${isMobileMenuOpen ? 'hidden md:flex' : 'flex'}`}
            aria-label="Cart"
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span className="text-xs font-semibold text-fg-primary ml-1.5">
              ({cartCount})
            </span>
          </button>

          {/* User Button / Dropdown */}
          <div className="relative hidden md:block" id="user-dropdown-container">
            {user ? (
              <>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="p-1.5 text-fg-secondary hover:text-fg-primary transition-colors focus:outline-none flex items-center gap-1 cursor-pointer"
                  aria-label="User Account"
                >
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="hidden lg:inline text-xs font-semibold text-fg-primary max-w-[80px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-bg-primary rounded-xl border border-border-accent/80 shadow-xl p-2 flex flex-col gap-1 z-50 pointer-events-auto transition-theme animate-fade-in">
                    <Link
                      href="/account"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-bg-secondary transition-colors group/aitem"
                    >
                      <span className="text-xs font-semibold text-fg-primary">Account Details</span>
                      <svg className="w-3.5 h-3.5 text-fg-secondary group-hover/aitem:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        logout();
                      }}
                      className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors text-left cursor-pointer focus:outline-none"
                    >
                      <span className="text-xs font-semibold">Log Out</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="p-1.5 text-fg-secondary hover:text-fg-primary transition-colors focus:outline-none cursor-pointer"
                aria-label="Sign In"
              >
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1 md:p-1.5 text-fg-secondary hover:text-fg-primary transition-colors focus:outline-none flex items-center gap-1 cursor-pointer"
            aria-label="Toggle Menu"
          >
            <span className="text-xs font-bold uppercase tracking-wider">{isMobileMenuOpen ? 'Close' : 'Menu'}</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div
          className="fixed z-[100] top-[12px] right-[12px] bottom-[12px] left-[12px] bg-bg-secondary rounded-2xl md:hidden animate-fade-in pointer-events-auto transition-theme overflow-y-auto"
        >
          {/* Custom Floating Close Pill */}
          <div className="absolute top-4 right-4 z-[110]">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="bg-bg-primary px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider text-fg-secondary hover:text-fg-primary transition-colors flex items-center gap-1.5 shadow-md border border-border-accent/40 focus:outline-none"
            >
              Close
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-1.5 mx-auto max-w-sm pt-[80px] px-4 pb-20">
            {/* Collections */}
            {collectionsList.map((col) => (
              <Link
                key={col.slug}
                href={`/shop?category=${col.slug}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between w-full p-2 bg-black/5 dark:bg-white/5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 border border-border-accent/40 bg-bg-primary">
                    {col.imageUrl ? (
                      <img src={col.imageUrl} alt={col.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-border-accent" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-fg-primary">{col.name}</span>
                </div>
                <svg className="w-4 h-4 text-fg-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            ))}

            {/* Static Links */}
            {[
              { name: 'Shop', href: '/shop' },
              { name: 'About', href: '/about' },
              { name: 'Blog', href: '/blog' },
            ].map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between w-full p-4 bg-black/5 dark:bg-white/5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                <span className="text-sm font-medium text-fg-primary ml-1">{link.name}</span>
                <svg className="w-4 h-4 text-fg-primary mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-bg-primary transition-theme shadow-2xl flex flex-col">
              <div className="px-6 py-5 border-b border-border-accent flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-tight text-fg-primary">Shopping Cart ({cartCount})</h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 -mr-2 text-fg-secondary hover:text-fg-primary cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Cart List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <svg className="w-16 h-16 text-fg-secondary/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <p className="text-fg-secondary font-medium mb-1">Your cart is empty</p>
                    <p className="text-xs text-fg-secondary/70 max-w-[200px]">Fill it with beautiful Scandinavian furniture.</p>
                  </div>
                ) : (
                  cart.map((item) => {
                    const itemMat = item.product.selectedMaterial || 'Oak';
                    const itemDim = item.product.selectedDimension || 'Standard';
                    const itemKey = `${item.product.slug}-${itemMat}-${itemDim}`;
                    return (
                      <div key={itemKey} className="flex gap-4 pb-6 border-b border-border-accent">
                        <div className="w-20 h-20 bg-bg-secondary rounded-lg overflow-hidden flex-shrink-0 relative">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between text-sm font-semibold text-fg-primary">
                              <h3>{item.product.name}</h3>
                              <p>${item.product.price * item.quantity}</p>
                            </div>
                            <p className="text-xs text-fg-secondary mt-1 capitalize">{item.product.category} Collection</p>
                            <div className="flex gap-2 text-[10px] text-fg-secondary/80 mt-1.5 font-medium uppercase tracking-wider">
                              <span>{itemMat}</span>
                              <span>•</span>
                              <span>{itemDim}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center border border-border-accent rounded">
                              <button
                                onClick={() => updateQuantity(item.product.slug, itemMat, itemDim, -1)}
                                className="px-2 py-1 text-fg-secondary hover:text-fg-primary cursor-pointer"
                              >
                                -
                              </button>
                              <span className="px-2 text-fg-primary font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.product.slug, itemMat, itemDim, 1)}
                                className="px-2 py-1 text-fg-secondary hover:text-fg-primary cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.product.slug, itemMat, itemDim)}
                              className="text-fg-secondary hover:text-red-500 font-medium underline cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Checkout Summary */}
              {cart.length > 0 && (
                <div className="border-t border-border-accent p-6 space-y-4">
                  <div className="flex justify-between text-base font-bold text-fg-primary">
                    <span>Subtotal</span>
                    <span>${cartTotal}</span>
                  </div>
                  <p className="text-xs text-fg-secondary">Shipping and taxes calculated at checkout.</p>
                  <button
                    onClick={() => {
                      if (!user) {
                        setIsCartOpen(false);
                        setAuthModalOpen(true);
                      } else {
                        setIsCartOpen(false);
                        router.push('/checkout');
                      }
                    }}
                    className="w-full bg-fg-primary text-bg-primary py-3.5 rounded-lg font-semibold hover:opacity-90 transition-opacity cursor-pointer text-center"
                  >
                    Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-start justify-center pt-24 px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} />
          <div className="w-full max-w-2xl bg-bg-primary transition-theme rounded-xl shadow-2xl overflow-hidden z-10 border border-border-accent flex flex-col max-h-[500px]">
            {/* Search Input */}
            <div className="p-4 border-b border-border-accent flex items-center gap-3">
              <svg className="w-5 h-5 text-fg-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name, category..."
                className="w-full bg-transparent border-none text-fg-primary placeholder-fg-secondary focus:outline-none text-sm"
                autoFocus
              />
              <button
                onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                className="text-xs text-fg-secondary hover:text-fg-primary font-medium border border-border-accent px-2 py-1 rounded cursor-pointer"
              >
                ESC
              </button>
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto p-4">
              {searchQuery.trim() ? (
                searchLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <svg className="animate-spin h-6 w-6 text-fg-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-xs text-fg-secondary/70 font-medium">Searching catalog...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-1">
                    {searchResults.map((product) => (
                      <Link
                        key={product.slug}
                        href={`/shop/${product.slug}`}
                        onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                        className="flex gap-4 p-2.5 rounded-xl hover:bg-bg-secondary transition-colors group/result"
                      >
                        <div className="w-12 h-12 bg-bg-secondary rounded-lg overflow-hidden flex-shrink-0 border border-border-accent/30">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-fg-secondary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-fg-primary truncate">{product.name}</p>
                          {product.tagline && (
                            <p className="text-xs text-fg-secondary mt-0.5 line-clamp-1">{product.tagline}</p>
                          )}
                          {product.category && (
                            <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider text-fg-secondary/60 bg-bg-secondary px-1.5 py-0.5 rounded border border-border-accent/30 capitalize">
                              {product.category}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col items-end justify-between flex-shrink-0">
                          <span className="text-sm font-bold text-fg-primary">${product.price}</span>
                          <svg className="w-3.5 h-3.5 text-fg-secondary/40 group-hover/result:text-fg-primary group-hover/result:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    ))}
                    <div className="pt-3 border-t border-border-accent/40 mt-2">
                      <Link
                        href={`/shop?q=${encodeURIComponent(searchQuery.trim())}`}
                        onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold text-fg-secondary hover:text-fg-primary hover:bg-bg-secondary transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        See all results for "{searchQuery.trim()}"
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="w-12 h-12 text-fg-secondary/20 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-fg-secondary text-sm font-medium">No results for "{searchQuery}"</p>
                    <p className="text-xs text-fg-secondary/60 mt-1">Try a different term or browse the shop.</p>
                  </div>
                )
              ) : (
                <div className="py-8 text-center space-y-3">
                  <svg className="w-10 h-10 text-fg-secondary/20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-xs text-fg-secondary font-medium">Search the Future milestone catalog</p>
                  <div className="flex flex-wrap justify-center gap-2 pt-1">
                    {['chair', 'oak', 'modern', 'shelf', 'table'].map((hint) => (
                      <button
                        key={hint}
                        onClick={() => setSearchQuery(hint)}
                        className="text-[10px] font-semibold border border-border-accent/40 text-fg-secondary hover:text-fg-primary hover:bg-bg-secondary px-2.5 py-1 rounded-full transition-colors cursor-pointer capitalize"
                      >
                        {hint}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal Overlay */}
      <AuthModal />
    </>
  );
}
