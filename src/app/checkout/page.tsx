'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser, SavedAddress } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { Product } from '@/data/products';
import Link from 'next/link';

interface CartItem {
  product: Product & { selectedMaterial?: string; selectedDimension?: string };
  quantity: number;
}

function CheckoutImage({ cart }: { cart: CartItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (cart.length <= 1) {
      setCurrentIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cart.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [cart]);

  if (cart.length === 0) {
    return (
      <>
        <img
          src="/images/xz7hJ6ESQ5b48HiLq5UkSZLMyM_a48801.webp"
          alt="Checkout"
          className="absolute inset-0 w-full h-full object-cover brightness-[0.92] transition-transform duration-700 group-hover:scale-[1.01]"
        />
        <div className="absolute inset-0 bg-black/10" />
      </>
    );
  }

  return (
    <>
      {/* Dynamic cross-fading images */}
      {cart.map((item, idx) => {
        const imageUrl = item.product.images?.[0] || "/images/xz7hJ6ESQ5b48HiLq5UkSZLMyM_a48801.webp";
        return (
          <img
            key={idx}
            src={imageUrl}
            alt={item.product.name}
            className={`absolute inset-0 w-full h-full object-cover brightness-[0.92] transition-all duration-1000 ease-in-out ${
              currentIndex === idx
                ? 'opacity-100 scale-100 pointer-events-auto'
                : 'opacity-0 scale-[0.99] pointer-events-none'
            }`}
          />
        );
      })}
      <div className="absolute inset-0 bg-black/10 pointer-events-none z-10" />

      {/* Slideshow controls / indicators */}
      {cart.length > 1 && (
        <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-20">
          <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-black/40 backdrop-blur-md rounded-full px-3 py-1 shadow-sm select-none">
            {currentIndex + 1} / {cart.length}
          </span>
          <div className="flex gap-1.5 bg-black/40 backdrop-blur-md rounded-full p-1.5 shadow-sm">
            {cart.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? 'bg-white scale-110' : 'bg-white/40 hover:bg-white/60'
                }`}
                title={`View slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="w-full flex flex-col lg:flex-row gap-3 bg-bg-primary select-text transition-theme relative lg:h-screen">
      {/* Left Column: Stable sticky image skeleton */}
      <section className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pl-3 lg:pr-0 flex items-stretch h-[400px] md:h-[600px] lg:h-[calc(100vh-24px)] lg:max-h-[calc(100vh-24px)] flex-shrink-0 transition-theme">
        <div className="h-full rounded-xl w-full border border-border-accent/40 animate-wave relative overflow-hidden">
          {/* Floating order summary badge on image skeleton */}
          <div className="absolute bottom-5 left-5 right-5">
            <div className="bg-bg-primary/80 backdrop-blur-md rounded-xl border border-border-accent/60 px-5 py-4 flex items-center justify-between shadow-lg transition-theme animate-pulse">
              <div className="space-y-2">
                <div className="h-3 w-16 bg-fg-primary/10 rounded-md" />
                <div className="h-6 w-24 bg-fg-primary/10 rounded-md" />
              </div>
              <div className="text-right flex flex-col items-end space-y-2">
                <div className="h-3 w-12 bg-fg-primary/10 rounded-md" />
                <div className="h-4 w-20 bg-fg-primary/10 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right Column: Scrollable forms + order summary skeleton */}
      <div className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pr-3 lg:pl-0 flex flex-col gap-3 transition-theme lg:h-[calc(100vh-24px)] lg:max-h-[calc(100vh-24px)] lg:overflow-y-auto scrollbar-none">
        
        {/* Header card skeleton */}
        <div className="w-full bg-bg-secondary border border-border-accent/40 p-8 md:p-10 rounded-xl transition-theme flex flex-col gap-3 animate-pulse">
          <div className="h-8 w-1/3 bg-fg-primary/10 rounded-md" />
          <div className="h-4 w-3/4 bg-fg-primary/10 rounded-md" />
        </div>

        {/* Order Summary skeleton */}
        <div className="w-full bg-bg-secondary border border-border-accent/40 rounded-xl overflow-hidden transition-theme animate-pulse">
          <div className="w-full border-b border-border-accent/40 py-4 flex justify-center">
            <div className="h-4 w-28 bg-fg-primary/10 rounded-md" />
          </div>
          <div className="p-6 flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-fg-primary/5 rounded-lg border border-border-accent/30 flex-shrink-0 animate-pulse" />
              <div className="flex-1 flex flex-col justify-between py-1">
                <div className="flex justify-between">
                  <div className="h-4 w-1/3 bg-fg-primary/10 rounded-md" />
                  <div className="h-4 w-10 bg-fg-primary/10 rounded-md" />
                </div>
                <div className="h-3 w-1/4 bg-fg-primary/10 rounded-md" />
                <div className="h-3 w-16 bg-fg-primary/10 rounded-md" />
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Details skeleton */}
        <div className="w-full bg-bg-secondary border border-border-accent/40 rounded-xl overflow-hidden transition-theme animate-pulse">
          <div className="w-full border-b border-border-accent/40 py-4 flex justify-center">
            <div className="h-4 w-32 bg-fg-primary/10 rounded-md" />
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="h-3.5 w-24 bg-fg-primary/10 rounded-md" />
              <div className="h-10 w-full bg-fg-primary/5 rounded-lg border border-border-accent/30" />
            </div>
            <div className="space-y-2">
              <div className="h-3.5 w-24 bg-fg-primary/10 rounded-md" />
              <div className="h-10 w-full bg-fg-primary/5 rounded-lg border border-border-accent/30" />
            </div>
          </div>
        </div>

        {/* Payment Details skeleton */}
        <div className="w-full bg-bg-secondary border border-border-accent/40 rounded-xl overflow-hidden transition-theme animate-pulse">
          <div className="w-full border-b border-border-accent/40 py-4 flex justify-center">
            <div className="h-4 w-32 bg-fg-primary/10 rounded-md" />
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <div className="h-3.5 w-24 bg-fg-primary/10 rounded-md" />
                <div className="h-10 w-full bg-fg-primary/5 rounded-lg border border-border-accent/30" />
              </div>
              <div className="space-y-2">
                <div className="h-3.5 w-16 bg-fg-primary/10 rounded-md" />
                <div className="h-10 w-full bg-fg-primary/5 rounded-lg border border-border-accent/30" />
              </div>
              <div className="space-y-2">
                <div className="h-3.5 w-16 bg-fg-primary/10 rounded-md" />
                <div className="h-10 w-full bg-fg-primary/5 rounded-lg border border-border-accent/30" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { user, loading, setAuthModalOpen } = useUser();
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [addressOption, setAddressOption] = useState<'primary' | 'saved' | 'new'>('primary');
  const [selectedSavedId, setSelectedSavedId] = useState<string>('');

  // Custom shipping address state
  const [customName, setCustomName] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  const [customPhone, setCustomPhone] = useState('');

  // Payment states
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [checkoutError, setCheckoutError] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  // Scroll priority ref — same as FAQ page
  const rightColumnRef = useRef<HTMLDivElement>(null);

  // Load cart: from DB when logged in, otherwise from localStorage
  useEffect(() => {
    if (loading) return;

    if (user) {
      fetch('/api/cart')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.cart?.length > 0) {
            setCart(data.cart);
          } else {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
              try { setCart(JSON.parse(savedCart)); } catch (e) { console.error(e); }
            }
          }
        })
        .catch((err) => {
          console.error('Failed to fetch cart:', err);
          const savedCart = localStorage.getItem('cart');
          if (savedCart) {
            try { setCart(JSON.parse(savedCart)); } catch (e) { console.error(e); }
          }
        })
        .finally(() => {
          setCartLoading(false);
        });
    } else {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error(e);
        }
      }
      setCartLoading(false);
    }
  }, [user, loading]);

  // Set default shipping selection when user details load
  useEffect(() => {
    if (user) {
      setCardName(user.name);
      if (user.savedAddresses && user.savedAddresses.length > 0) {
        setSelectedSavedId(user.savedAddresses[0].id);
        setAddressOption('saved');
      } else if (user.address) {
        setAddressOption('primary');
      } else {
        setAddressOption('new');
      }
    }
  }, [user]);

  // Scroll priority — identical to FAQ page
  //  ↓ Down  → right column first → then page
  //  ↑ Up    → page first → then right column
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const el = rightColumnRef.current;
      if (!el) return;

      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
      const atTop    = el.scrollTop <= 0;
      const pageAtTop = (window.scrollY || document.documentElement.scrollTop) <= 0;

      if (e.deltaY > 0) {
        if (!atBottom) {
          e.preventDefault();
          el.scrollTop += e.deltaY;
        }
      } else if (e.deltaY < 0) {
        if (!pageAtTop) {
          return;
        }
        if (!atTop) {
          e.preventDefault();
          el.scrollTop += e.deltaY;
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  // ── Loading / Guard states ─────────────────────────────────────────────────

  if (loading || cartLoading) {
    return <CheckoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="w-full flex flex-col lg:flex-row gap-3 bg-bg-primary transition-theme relative lg:h-screen">
        {/* Left image */}
        <section className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pl-3 lg:pr-0 flex items-stretch h-[300px] md:h-[400px] lg:h-[calc(100vh-24px)] lg:max-h-[calc(100vh-24px)] flex-shrink-0">
          <div className="h-full rounded-xl overflow-hidden relative border border-border-accent/40 w-full group shadow-sm">
            <CheckoutImage cart={cart} />
          </div>
        </section>
        {/* Right: sign-in prompt */}
        <div className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pr-3 lg:pl-0 flex flex-col gap-3 lg:h-[calc(100vh-24px)] lg:max-h-[calc(100vh-24px)] lg:overflow-y-auto scrollbar-none">
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-bg-secondary border border-border-accent/40 rounded-xl p-10 text-center space-y-5 max-w-sm w-full shadow-sm transition-theme">
              <div className="w-14 h-14 rounded-2xl bg-fg-primary/5 border border-border-accent/40 flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 text-fg-secondary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-dm-sans font-bold text-lg text-fg-primary">Sign In Required</h3>
                <p className="text-xs text-fg-secondary leading-relaxed mt-1.5">Please log in to complete your checkout and register your purchase.</p>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="flex-1 bg-fg-primary text-bg-primary py-3 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Sign In
                </button>
                <Link
                  href="/shop"
                  className="flex-1 border border-border-accent text-fg-primary bg-bg-primary py-3 rounded-lg text-xs font-semibold hover:bg-bg-secondary transition-colors text-center inline-block"
                >
                  Back to Shop
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="w-full flex flex-col lg:flex-row gap-3 bg-bg-primary transition-theme relative lg:h-screen">
        {/* Left image */}
        <section className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pl-3 lg:pr-0 flex items-stretch h-[300px] md:h-[400px] lg:h-[calc(100vh-24px)] lg:max-h-[calc(100vh-24px)] flex-shrink-0">
          <div className="h-full rounded-xl overflow-hidden relative border border-border-accent/40 w-full group shadow-sm">
            <CheckoutImage cart={cart} />
          </div>
        </section>
        {/* Right: empty cart prompt */}
        <div className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pr-3 lg:pl-0 flex flex-col gap-3 lg:h-[calc(100vh-24px)] lg:max-h-[calc(100vh-24px)] lg:overflow-y-auto scrollbar-none">
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-bg-secondary border border-border-accent/40 rounded-xl p-10 text-center space-y-5 max-w-sm w-full shadow-sm transition-theme">
              <div className="w-14 h-14 rounded-2xl bg-fg-primary/5 border border-border-accent/40 flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 text-fg-secondary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <h3 className="font-dm-sans font-bold text-lg text-fg-primary">Your Cart is Empty</h3>
                <p className="text-xs text-fg-secondary leading-relaxed mt-1.5">Add some handcrafted Scandinavian furniture before proceeding to checkout.</p>
              </div>
              <Link
                href="/shop"
                className="w-full bg-fg-primary text-bg-primary py-3 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity text-center block"
              >
                Go to Shop
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Pricing ────────────────────────────────────────────────────────────────
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal >= 500 ? 0 : 15;
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + shipping + tax;

  const getShippingDetails = () => {
    if (addressOption === 'primary') {
      return { name: user.name, addressLine: user.address || '', phone: user.phone || '', label: 'Default Address' };
    } else if (addressOption === 'saved') {
      const selected = user.savedAddresses?.find(a => a.id === selectedSavedId);
      return { name: selected?.name || user.name, addressLine: selected?.addressLine || '', phone: selected?.phone || '', label: selected?.label || 'Saved Address' };
    } else {
      return { name: customName, addressLine: customAddress, phone: customPhone, label: 'Custom Address' };
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');

    const shippingDetails = getShippingDetails();
    if (!shippingDetails.name || !shippingDetails.addressLine) {
      setCheckoutError('Please enter valid shipping details.');
      return;
    }
    if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
      setCheckoutError('Please enter mock payment card details.');
      return;
    }

    setPlacingOrder(true);

    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            slug: item.product.slug,
            name: item.product.name,
            material: item.product.selectedMaterial || 'Oak',
            dimension: item.product.selectedDimension || 'Standard',
            quantity: item.quantity,
            price: item.product.price,
            image: item.product.images[0],
            customerName: user.name,
          })),
          total,
          shippingAddress: shippingDetails,
        }),
      });

      const data = await res.json();
      setPlacingOrder(false);

      if (data.success && data.order) {
        if (user) {
          await fetch('/api/cart', { method: 'DELETE' }).catch(() => {});
        }
        localStorage.removeItem('cart');
        setCart([]);
        window.dispatchEvent(new Event('cart-updated'));
        window.dispatchEvent(new Event('orders-updated'));
        router.push(`/checkout/success?orderId=${data.order.id}&orderNumber=${encodeURIComponent(data.order.orderNumber)}&total=${total}&name=${encodeURIComponent(shippingDetails.name)}&address=${encodeURIComponent(shippingDetails.addressLine)}`);
      } else {
        setCheckoutError(data.error || 'Failed to place order. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setCheckoutError('An error occurred during checkout. Please try again.');
      setPlacingOrder(false);
    }
  };

  // ── Main Layout (mirrors FAQ page exactly) ─────────────────────────────────
  return (
    <div className="w-full flex flex-col lg:flex-row gap-3 bg-bg-primary select-text transition-theme relative lg:h-screen">

      {/* Left Column: Stable sticky image — same as FAQ */}
      <section className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pl-3 lg:pr-0 flex items-stretch h-[400px] md:h-[600px] lg:h-[calc(100vh-24px)] lg:max-h-[calc(100vh-24px)] flex-shrink-0 transition-theme">
        <div className="h-full rounded-xl overflow-hidden relative border border-border-accent/40 w-full group shadow-sm">
          <CheckoutImage cart={cart} />

          {/* Floating order summary badge on image */}
          <div className="absolute bottom-5 left-5 right-5">
            <div className="bg-bg-primary/80 backdrop-blur-md rounded-xl border border-border-accent/60 px-5 py-4 flex items-center justify-between shadow-lg transition-theme">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-fg-secondary mb-0.5">Order Total</p>
                <p className="text-2xl font-bold text-fg-primary font-dm-sans">${total}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-fg-secondary mb-0.5">{cart.length} Item{cart.length !== 1 ? 's' : ''}</p>
                <p className="text-xs text-fg-secondary">
                  {shipping === 0 ? '✓ Free shipping' : `+ $${shipping} shipping`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right Column: Scrollable forms + order summary — same scroll behaviour as FAQ */}
      <div
        ref={rightColumnRef}
        className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pr-3 lg:pl-0 flex flex-col gap-3 transition-theme lg:h-[calc(100vh-24px)] lg:max-h-[calc(100vh-24px)] lg:overflow-y-auto scrollbar-none"
      >

        {/* Header card */}
        <div className="w-full bg-bg-secondary border border-border-accent/40 p-8 md:p-10 rounded-xl transition-theme flex flex-col gap-2">
          <h1 className="font-dm-sans text-3xl md:text-4xl font-bold tracking-tight text-fg-primary">Checkout</h1>
          <p className="text-sm text-fg-secondary leading-relaxed font-medium">
            Complete your order below. Your cart is securely saved to your account.
          </p>
        </div>

        <form onSubmit={handlePlaceOrder} className="flex flex-col gap-3">

          {/* Error banner */}
          {checkoutError && (
            <div className="bg-red-500/10 text-red-500 border border-red-500/20 px-5 py-3.5 rounded-xl text-xs font-semibold animate-fade-in flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 2a10 10 0 110 20A10 10 0 0112 2z" />
              </svg>
              {checkoutError}
            </div>
          )}

          {/* ── 1. Order Summary ─────────────────────────────────────────────── */}
          <div className="w-full bg-bg-secondary border border-border-accent/40 rounded-xl overflow-hidden transition-theme">
            {/* Category label — same style as FAQ category pills */}
            <div className="w-full border-b border-border-accent/40 py-4 flex items-center justify-center">
              <h2 className="font-dm-sans text-xs font-bold text-fg-primary uppercase tracking-widest text-center">
                Order Summary
              </h2>
            </div>

            <div className="p-6 flex flex-col gap-4">
              {cart.map((item, index) => {
                const itemMat = item.product.selectedMaterial || 'Oak';
                const itemDim = item.product.selectedDimension || 'Standard';
                const itemKey = `${item.product.slug}-${itemMat}-${itemDim}`;
                return (
                  <div key={itemKey} className={`flex gap-4 ${index > 0 ? 'pt-4 border-t border-border-accent/30' : ''}`}>
                    <div className="w-16 h-16 bg-bg-primary rounded-lg overflow-hidden border border-border-accent/30 flex-shrink-0">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between text-xs">
                      <div>
                        <div className="flex justify-between font-semibold text-fg-primary">
                          <h4>{item.product.name}</h4>
                          <p>${item.product.price * item.quantity}</p>
                        </div>
                        <p className="text-fg-secondary/70 capitalize mt-0.5">{item.product.category} Collection</p>
                        <div className="flex gap-2 text-[9px] text-fg-secondary/80 mt-1 uppercase font-medium">
                          <span>{itemMat}</span>
                          <span>•</span>
                          <span>{itemDim}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-fg-secondary/70 mt-1.5">Qty: {item.quantity}</p>
                    </div>
                  </div>
                );
              })}

              {/* Price breakdown */}
              <div className="border-t border-border-accent/40 pt-4 space-y-2.5 text-xs font-semibold text-fg-primary">
                <div className="flex justify-between">
                  <span className="text-fg-secondary font-normal">Subtotal</span>
                  <span>${subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fg-secondary font-normal">Shipping</span>
                  <span className={shipping === 0 ? 'text-green-500' : ''}>{shipping === 0 ? 'Free' : `$${shipping}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fg-secondary font-normal">Tax (8%)</span>
                  <span>${tax}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-border-accent/40 pt-3 mt-1">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── 2. Delivery Location ─────────────────────────────────────────── */}
          <div className="w-full bg-bg-secondary border border-border-accent/40 rounded-xl overflow-hidden transition-theme">
            <div className="w-full border-b border-border-accent/40 py-4 flex items-center justify-center">
              <h2 className="font-dm-sans text-xs font-bold text-fg-primary uppercase tracking-widest text-center">
                Delivery Location
              </h2>
            </div>

            <div className="p-6 space-y-3">
              {/* Option 1: Default address */}
              {user.address && (
                <label className={`flex items-start gap-3 border p-4 rounded-xl cursor-pointer transition-all ${
                  addressOption === 'primary' ? 'border-fg-primary bg-bg-primary shadow-sm' : 'border-border-accent/40 bg-bg-primary/50 hover:bg-bg-primary/80'
                }`}>
                  <input
                    type="radio"
                    name="shipping_addr"
                    checked={addressOption === 'primary'}
                    onChange={() => setAddressOption('primary')}
                    className="mt-1 accent-fg-primary flex-shrink-0"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-fg-primary block">Default Account Address</span>
                    <p className="text-fg-secondary mt-1">{user.address}</p>
                    {user.phone && <p className="text-fg-secondary/70 mt-0.5">📞 {user.phone}</p>}
                  </div>
                </label>
              )}

              {/* Option 2: Saved addresses */}
              {user.savedAddresses && user.savedAddresses.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-fg-secondary block px-1">Saved Locations</span>
                  {user.savedAddresses.map((addr) => (
                    <label key={addr.id} className={`flex items-start gap-3 border p-4 rounded-xl cursor-pointer transition-all ${
                      addressOption === 'saved' && selectedSavedId === addr.id ? 'border-fg-primary bg-bg-primary shadow-sm' : 'border-border-accent/40 bg-bg-primary/50 hover:bg-bg-primary/80'
                    }`}>
                      <input
                        type="radio"
                        name="shipping_addr"
                        checked={addressOption === 'saved' && selectedSavedId === addr.id}
                        onChange={() => { setAddressOption('saved'); setSelectedSavedId(addr.id); }}
                        className="mt-1 accent-fg-primary flex-shrink-0"
                      />
                      <div className="text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-fg-primary">{addr.name}</span>
                          <span className="px-1.5 py-0.5 bg-fg-primary/5 text-fg-primary text-[8px] font-bold uppercase tracking-wider rounded border border-border-accent/20">{addr.label}</span>
                        </div>
                        <p className="text-fg-secondary mt-1">{addr.addressLine}</p>
                        {addr.phone && <p className="text-fg-secondary/70 mt-0.5">📞 {addr.phone}</p>}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* Option 3: Custom address */}
              <label className={`flex items-start gap-3 border p-4 rounded-xl cursor-pointer transition-all ${
                addressOption === 'new' ? 'border-fg-primary bg-bg-primary shadow-sm' : 'border-border-accent/40 bg-bg-primary/50 hover:bg-bg-primary/80'
              }`}>
                <input
                  type="radio"
                  name="shipping_addr"
                  checked={addressOption === 'new'}
                  onChange={() => setAddressOption('new')}
                  className="mt-1 accent-fg-primary flex-shrink-0"
                />
                <div className="text-xs">
                  <span className="font-bold text-fg-primary">Deliver to a different address</span>
                </div>
              </label>

              {addressOption === 'new' && (
                <div className="border border-border-accent/40 bg-bg-primary rounded-xl p-5 space-y-3.5 animate-fade-in shadow-sm">
                  <div className="space-y-1">
                    <label htmlFor="ship-name" className="text-[9px] font-bold uppercase tracking-wider text-fg-secondary">Recipient Name</label>
                    <input
                      id="ship-name"
                      type="text"
                      required={addressOption === 'new'}
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Jane Smith"
                      className="w-full bg-bg-secondary text-fg-primary placeholder:text-fg-secondary/40 border border-border-accent/40 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-fg-primary transition-colors font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="ship-address" className="text-[9px] font-bold uppercase tracking-wider text-fg-secondary">Address</label>
                    <input
                      id="ship-address"
                      type="text"
                      required={addressOption === 'new'}
                      value={customAddress}
                      onChange={(e) => setCustomAddress(e.target.value)}
                      placeholder="Street name, suite, city, state, country"
                      className="w-full bg-bg-secondary text-fg-primary placeholder:text-fg-secondary/40 border border-border-accent/40 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-fg-primary transition-colors font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="ship-phone" className="text-[9px] font-bold uppercase tracking-wider text-fg-secondary">Phone Number</label>
                    <input
                      id="ship-phone"
                      type="text"
                      value={customPhone}
                      onChange={(e) => setCustomPhone(e.target.value)}
                      placeholder="+420 123 456 789"
                      className="w-full bg-bg-secondary text-fg-primary placeholder:text-fg-secondary/40 border border-border-accent/40 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-fg-primary transition-colors font-medium"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── 3. Secure Payment ────────────────────────────────────────────── */}
          <div className="w-full bg-bg-secondary border border-border-accent/40 rounded-xl overflow-hidden transition-theme">
            <div className="w-full border-b border-border-accent/40 py-4 flex items-center justify-center">
              <h2 className="font-dm-sans text-xs font-bold text-fg-primary uppercase tracking-widest text-center">
                Secure Payment
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="card-name" className="text-[9px] font-bold uppercase tracking-wider text-fg-secondary">Name on Card</label>
                <input
                  id="card-name"
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-bg-primary text-fg-primary placeholder:text-fg-secondary/40 border border-border-accent/40 rounded-xl px-5 py-3.5 text-xs focus:outline-none focus:border-fg-primary transition-colors font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="card-number" className="text-[9px] font-bold uppercase tracking-wider text-fg-secondary">Card Number</label>
                <input
                  id="card-number"
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4111 2222 3333 4444"
                  className="w-full bg-bg-primary text-fg-primary placeholder:text-fg-secondary/40 border border-border-accent/40 rounded-xl px-5 py-3.5 text-xs focus:outline-none focus:border-fg-primary transition-colors font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="card-expiry" className="text-[9px] font-bold uppercase tracking-wider text-fg-secondary">Expiry Date</label>
                  <input
                    id="card-expiry"
                    type="text"
                    required
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full bg-bg-primary text-fg-primary placeholder:text-fg-secondary/40 border border-border-accent/40 rounded-xl px-5 py-3.5 text-xs focus:outline-none focus:border-fg-primary transition-colors font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="card-cvv" className="text-[9px] font-bold uppercase tracking-wider text-fg-secondary">CVV</label>
                  <input
                    id="card-cvv"
                    type="text"
                    required
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="123"
                    className="w-full bg-bg-primary text-fg-primary placeholder:text-fg-secondary/40 border border-border-accent/40 rounded-xl px-5 py-3.5 text-xs focus:outline-none focus:border-fg-primary transition-colors font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={placingOrder}
                className="w-full bg-fg-primary text-bg-primary py-4 rounded-xl font-bold text-sm hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed mt-2 shadow-sm"
              >
                {placingOrder ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-bg-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <span>Complete Purchase — ${total}</span>
                )}
              </button>

              {/* Trust signals */}
              <div className="flex items-center justify-center gap-6 pt-1">
                {[
                  { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', label: 'Secure' },
                  { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: 'Protected' },
                  { icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', label: 'Encrypted' },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1">
                    <svg className="w-4 h-4 text-fg-secondary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
                    </svg>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-fg-secondary/50">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom spacing */}
          <div className="pb-8" />
        </form>
      </div>
    </div>
  );
}
