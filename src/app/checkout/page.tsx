'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@/context/UserContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useSettings } from '@/context/SettingsContext';
import { useRouter } from 'next/navigation';
import { Product } from '@/data/products';
import Link from 'next/link';
import { Country, State } from 'country-state-city';

interface CartItem {
  product: Product & { selectedMaterial?: string; selectedDimension?: string };
  quantity: number;
}

interface SlideshowItem {
  image: string;
  name: string;
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PAYPAL_SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK', 'NOK', 'DKK',
  'HKD', 'SGD', 'NZD', 'MXN', 'BRL', 'PLN', 'CZK', 'HUF', 'ILS', 'THB', 'TWD', 'PHP'
];

const getPayPalSupportedCurrency = (curr: string): string => {
  const upper = (curr || 'USD').toUpperCase();
  return PAYPAL_SUPPORTED_CURRENCIES.includes(upper) ? upper : 'USD';
};

const loadPayPalScript = (clientId: string, currency: string = 'USD'): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);

    const validCurrency = getPayPalSupportedCurrency(currency);
    const existingScript = document.getElementById('paypal-js-sdk');
    const currentScriptCurrency = existingScript?.getAttribute('data-currency');

    if ((window as any).paypal && currentScriptCurrency === validCurrency) {
      return resolve(true);
    }

    if (existingScript) {
      existingScript.remove();
    }
    if ((window as any).paypal) {
      try { delete (window as any).paypal; } catch { }
    }

    const script = document.createElement('script');
    script.id = 'paypal-js-sdk';
    script.setAttribute('data-currency', validCurrency);
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${validCurrency}&intent=capture&components=buttons&disable-funding=card`;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};


function CheckoutSlideshow({ items }: { items: SlideshowItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) {
      setCurrentIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [items]);

  if (items.length === 0) {
    return (
      <>
        <img
          src="/images/about.png"
          alt="Checkout"
          className="absolute inset-0 w-full h-full object-cover brightness-[0.92] transition-transform duration-700 group-hover:scale-[1.01]"
        />
        <div className="absolute inset-0 bg-black/10" />
      </>
    );
  }

  return (
    <>
      {items.map((item, idx) => {
        const imageUrl = item.image || "/images/about.png";
        return (
          <img
            key={idx}
            src={imageUrl}
            alt={item.name}
            className={`absolute inset-0 w-full h-full object-cover brightness-[0.92] transition-all duration-1000 ease-in-out ${currentIndex === idx
              ? 'opacity-100 scale-100 pointer-events-auto'
              : 'opacity-0 scale-[0.99] pointer-events-none'
              }`}
          />
        );
      })}
      <div className="absolute inset-0 bg-black/10 pointer-events-none z-10" />

      {items.length > 1 && (
        <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-20">
          <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-black/40 backdrop-blur-md rounded-full px-3 py-1 shadow-sm select-none">
            {currentIndex + 1} / {items.length}
          </span>
          <div className="flex gap-1.5 bg-black/40 backdrop-blur-md rounded-full p-1.5 shadow-sm">
            {items.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${currentIndex === idx ? 'bg-white scale-110' : 'bg-white/40 hover:bg-white/60'
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
      <section className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pl-3 lg:pr-0 flex items-stretch h-[400px] md:h-[600px] lg:h-[calc(100vh-24px)] lg:max-h-[calc(100vh-24px)] flex-shrink-0 transition-theme">
        <div className="h-full rounded-xl w-full border border-border-accent/40 animate-wave relative overflow-hidden">
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

      <div className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pr-3 lg:pl-0 flex flex-col gap-3 transition-theme lg:h-[calc(100vh-24px)] lg:max-h-[calc(100vh-24px)] lg:overflow-y-auto scrollbar-none">
        <div className="w-full bg-bg-secondary border border-border-accent/40 p-8 md:p-10 rounded-xl transition-theme flex flex-col gap-3 animate-pulse">
          <div className="h-8 w-1/3 bg-fg-primary/10 rounded-md" />
          <div className="h-4 w-3/4 bg-fg-primary/10 rounded-md" />
        </div>
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
      </div>
    </div>
  );
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands',
  'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh',
  'Lakshadweep', 'Puducherry'
];



export default function CheckoutPage() {
  const { user, loading, setAuthModalOpen } = useUser();
  const { country, formatPrice } = useCurrency();
  const { settings } = useSettings();
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [addressOption, setAddressOption] = useState<'primary' | 'saved' | 'new'>('primary');
  const [selectedSavedId, setSelectedSavedId] = useState<string>('');
  const [successOrder, setSuccessOrder] = useState<{
    orderNumber: string;
    total: number;
    name: string;
    address: string;
    items: { name: string; image: string }[];
  } | null>(null);

  // Custom shipping address state
  const [customCountry, setCustomCountry] = useState('India');
  const [customFullName, setCustomFullName] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [customFlat, setCustomFlat] = useState('');
  const [customArea, setCustomArea] = useState('');
  const [customLandmark, setCustomLandmark] = useState('');
  const [customPincode, setCustomPincode] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [customState, setCustomState] = useState('');
  const [selectedCountryIso, setSelectedCountryIso] = useState<string>('IN');
  const [selectedStateIso, setSelectedStateIso] = useState<string>('');



  const [checkoutError, setCheckoutError] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paypalLoading, setPaypalLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'paypal'>('razorpay');

  const rightColumnRef = useRef<HTMLDivElement>(null);

  const hasSavedAddresses = !!(user?.address || (user?.savedAddresses && user.savedAddresses.length > 0));
  const showCustomForm = addressOption === 'new' || !hasSavedAddresses;

  // Determine active shipping location (India vs Outside India)
  const activeShippingCountryIso = (() => {
    if (addressOption === 'new' || !hasSavedAddresses) {
      return selectedCountryIso || 'IN';
    }
    if (addressOption === 'primary' && user?.address) {
      if (typeof user.address === 'object') {
        const c = user.address.country || '';
        if (/india|\bin\b/i.test(c)) return 'IN';
        const found = Country.getAllCountries().find(cnt => cnt.name.toLowerCase() === c.toLowerCase() || cnt.isoCode === c);
        return found ? found.isoCode : 'IN';
      }
      if (typeof user.address === 'string' && /india|\bin\b/i.test(user.address)) {
        return 'IN';
      }
      return 'IN';
    }
    if (addressOption === 'saved') {
      const selected = user?.savedAddresses?.find(a => a.id === selectedSavedId);
      if (selected) {
        const c = selected.country || '';
        const fullStr = `${c} ${selected.addressLine || ''}`;
        if (/india|\bin\b/i.test(fullStr)) return 'IN';
        if (c) {
          const found = Country.getAllCountries().find(cnt => cnt.name.toLowerCase() === c.toLowerCase() || cnt.isoCode === c);
          if (found) return found.isoCode;
        }
        // Fallback: check if addressLine ends with or contains country name
        const matchCountry = Country.getAllCountries().find(cnt => new RegExp(`\\b${cnt.name}\\b`, 'i').test(selected.addressLine || ''));
        if (matchCountry) return matchCountry.isoCode;
      }
    }
    return country.code || 'IN';
  })();

  const isIndia = activeShippingCountryIso === 'IN';

  // Fetch past orders to detect first purchase
  useEffect(() => {
    if (user) {
      fetch('/api/orders')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.orders)) {
            setOrderCount(data.orders.length);
          } else {
            setOrderCount(0);
          }
        })
        .catch(() => setOrderCount(0));
    } else {
      setOrderCount(null);
    }
  }, [user]);

  // Pricing calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const isFirstOrder = user ? orderCount === 0 : false;
  const firstOrderDiscountPercent = (settings?.firstOrderDiscountVisible ?? true)
    ? (Number(settings?.firstOrderDiscountPercentage) || 0)
    : 0;
  const firstOrderDiscount = (isFirstOrder && firstOrderDiscountPercent > 0)
    ? Math.round(subtotal * (firstOrderDiscountPercent / 100) * 100) / 100
    : 0;

  const discountedSubtotal = Math.max(0, subtotal - firstOrderDiscount);
  const shipping = 0;
  const tax = 0;
  const total = discountedSubtotal + shipping + tax;

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

  // Persist cart updates to localStorage or DB
  const persistCart = (updatedCart: CartItem[]) => {
    if (user) {
      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart: updatedCart }),
      }).catch((err) => console.error('Failed to save cart to DB:', err));
      localStorage.removeItem('cart');
    } else {
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    }
    window.dispatchEvent(new Event('cart-updated'));
  };

  const handleRemoveItem = (slug: string, material: string, dimension: string) => {
    const updated = cart.filter((item) => {
      const itemMat = item.product.selectedMaterial || 'Oak';
      const itemDim = item.product.selectedDimension || 'Standard';
      return !(item.product.slug === slug && itemMat === material && itemDim === dimension);
    });
    setCart(updated);
    persistCart(updated);
  };

  const handleUpdateQuantity = (slug: string, material: string, dimension: string, delta: number) => {
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

  // Set default shipping selection when user details load
  useEffect(() => {
    if (user) {
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

  // Scroll priority
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const el = rightColumnRef.current;
      if (!el) return;

      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
      const atTop = el.scrollTop <= 0;
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

  // Initialize PayPal Buttons when PayPal payment method is selected
  useEffect(() => {
    if (loading || cartLoading || !user || paymentMethod !== 'paypal' || cart.length === 0) return;

    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId) {
      console.error('NEXT_PUBLIC_PAYPAL_CLIENT_ID is missing');
      return;
    }

    let isMounted = true;
    let buttonsInstance: any = null;
    setPaypalLoading(true);

    const paypalCurrency = getPayPalSupportedCurrency(country.currency);

    loadPayPalScript(clientId, paypalCurrency).then((loaded) => {
      if (!isMounted) return;
      setPaypalLoading(false);

      if (loaded && (window as any).paypal) {
        const container = document.getElementById('paypal-button-container');
        if (container) {
          container.innerHTML = '';
          try {
            buttonsInstance = (window as any).paypal.Buttons({
              style: {
                layout: 'vertical',
                color: 'gold',
                shape: 'rect',
                label: 'paypal',
              },
              createOrder: async () => {
                setCheckoutError('');
                const shippingDetails = getShippingDetails() as any;
                if (!shippingDetails || !shippingDetails.fullName || (!shippingDetails.flat && !shippingDetails.area)) {
                  setCheckoutError('Please enter complete shipping details before proceeding with PayPal.');
                  throw new Error('Incomplete shipping details');
                }

                const calcAmount = (paypalCurrency === 'USD' && country.currency !== 'USD')
                  ? total.toFixed(2)
                  : (total * (country.rate || 1)).toFixed(2);

                const res = await fetch('/api/checkout/paypal/create-order', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    amount: calcAmount,
                    currency: paypalCurrency,
                  }),
                });
                const data = await res.json();
                if (!data.success) {
                  setCheckoutError(data.error || 'Failed to initialize PayPal order.');
                  throw new Error(data.error || 'PayPal order creation failed');
                }
                return data.orderID;
              },
              onApprove: async (data: any) => {
                setPlacingOrder(true);
                setCheckoutError('');
                try {
                  const shippingDetails = getShippingDetails() as any;
                  const captureRes = await fetch('/api/checkout/paypal/capture-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      orderID: data.orderID,
                      items: cart.map(item => ({
                        slug: item.product.slug,
                        name: item.product.name,
                        material: item.product.selectedMaterial || 'Oak',
                        dimension: item.product.selectedDimension || 'Standard',
                        quantity: item.quantity,
                        price: item.product.price,
                        image: item.product.images[0],
                        customerName: user?.name,
                      })),
                      total: formatPrice(total),
                      shippingAddress: shippingDetails,
                    }),
                  });
                  const captureData = await captureRes.json();
                  setPlacingOrder(false);
                  if (captureData.success && captureData.order) {
                    await finalizeSuccessfulOrder(captureData.order, shippingDetails);
                  } else {
                    setCheckoutError(captureData.error || 'PayPal payment capture failed.');
                  }
                } catch (err: any) {
                  console.error(err);
                  setCheckoutError(err.message || 'PayPal payment verification failed.');
                  setPlacingOrder(false);
                }
              },
              onError: (err: any) => {
                const msg = err?.message || err?.toString() || '';
                if (msg.includes('zoid destroyed') || msg.includes('component destroyed')) {
                  return;
                }
                console.error('PayPal Buttons Error:', err);
                setCheckoutError('PayPal payment error occurred. Please try again.');
                setPlacingOrder(false);
              },
            });

            if (buttonsInstance.isEligible()) {
              buttonsInstance.render('#paypal-button-container').catch((err: any) => {
                // Ignore DOM container unmount and Zoid lifecycle cleanup during React state updates
                const msg = err?.message || err?.toString() || '';
                if (
                  msg.includes('target_element_not_found') ||
                  msg.includes('container element removed') ||
                  msg.includes('Detected container element removed') ||
                  msg.includes('zoid destroyed') ||
                  msg.includes('component destroyed')
                ) {
                  return;
                }
                console.error('PayPal button render error:', err);
              });
            }
          } catch (err: any) {
            const msg = err?.message || err?.toString() || '';
            if (!msg.includes('zoid destroyed') && !msg.includes('component destroyed')) {
              console.error('Error rendering PayPal buttons:', err);
            }
          }
        }
      }
    });

    return () => {
      isMounted = false;
      if (buttonsInstance) {
        try {
          buttonsInstance.close().catch(() => { });
        } catch { }
      }
    };
  }, [loading, cartLoading, user, paymentMethod, cart, country, total, addressOption, selectedCountryIso, selectedSavedId]);


  if (loading || cartLoading) {
    return <CheckoutSkeleton />;
  }


  if (!user) {
    return (
      <div className="w-full flex flex-col lg:flex-row gap-3 bg-bg-primary transition-theme relative lg:h-screen">
        <section className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pl-3 lg:pr-0 flex items-stretch h-[300px] md:h-[400px] lg:h-[calc(100vh-24px)] lg:max-h-[calc(100vh-24px)] flex-shrink-0">
          <div className="h-full rounded-xl overflow-hidden relative border border-border-accent/40 w-full group shadow-sm">
            <CheckoutSlideshow items={cart.map(item => ({ image: item.product.images?.[0] || '', name: item.product.name }))} />
          </div>
        </section>
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

  if (successOrder) {
    const slideshowItems = successOrder.items.map(item => ({
      image: item.image,
      name: item.name
    }));

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);

    const formattedDate = deliveryDate.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      <div className="w-full flex flex-col lg:flex-row gap-3 bg-bg-primary select-text transition-theme relative lg:h-screen">
        <section className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pl-3 lg:pr-0 flex items-stretch h-[400px] md:h-[600px] lg:h-[calc(100vh-24px)] lg:max-h-[calc(100vh-24px)] flex-shrink-0 transition-theme">
          <div className="h-full rounded-xl overflow-hidden relative border border-border-accent/40 w-full group shadow-sm bg-bg-secondary">
            <CheckoutSlideshow items={slideshowItems} />

            <div className="absolute bottom-5 left-5 right-5 z-20">
              <div className="bg-bg-primary/80 backdrop-blur-md rounded-xl border border-border-accent/60 px-5 py-4 flex items-center justify-between shadow-lg transition-theme">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-fg-secondary mb-0.5">Order Ref</p>
                  <p className="text-xl font-bold text-fg-primary font-dm-sans">{successOrder.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-fg-secondary mb-0.5">Est. Delivery</p>
                  <p className="text-xs font-semibold text-fg-primary">{formattedDate}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pr-3 lg:pl-0 flex flex-col gap-3 transition-theme lg:h-[calc(100vh-24px)] lg:max-h-[calc(100vh-24px)] lg:overflow-y-auto scrollbar-none">
          <div className="flex-1 flex items-center justify-center py-6">
            <div className="bg-bg-secondary border border-border-accent/40 rounded-xl p-8 md:p-10 text-center space-y-6 max-w-md w-full shadow-sm transition-theme">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto text-green-500">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div>
                <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                  Payment Successful
                </span>
                <h2 className="font-dm-sans font-bold text-2xl text-fg-primary mt-3">Order Confirmed!</h2>
                <p className="text-xs text-fg-secondary leading-relaxed mt-2">
                  Thank you, <strong className="text-fg-primary">{successOrder.name}</strong>. We have received your order <strong className="text-fg-primary">{successOrder.orderNumber}</strong> and sent a confirmation email to your address.
                </p>
              </div>

              <div className="bg-bg-primary border border-border-accent/40 rounded-xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-border-accent/30 pb-2">
                  <span className="text-fg-secondary">Amount Paid</span>
                  <span className="font-bold text-fg-primary">{formatPrice(successOrder.total)}</span>
                </div>
                <div>
                  <span className="text-fg-secondary block text-[10px] uppercase font-bold tracking-wider">Shipping Location</span>
                  <span className="text-fg-primary font-medium">{successOrder.address}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Link
                  href="/orders"
                  className="w-full bg-fg-primary text-bg-primary py-3.5 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity text-center"
                >
                  View My Orders
                </Link>
                <Link
                  href="/shop"
                  className="w-full border border-border-accent text-fg-primary bg-bg-primary py-3.5 rounded-xl text-xs font-bold hover:bg-bg-secondary transition-colors text-center"
                >
                  Continue Shopping
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
        <section className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pl-3 lg:pr-0 flex items-stretch h-[300px] md:h-[400px] lg:h-[calc(100vh-24px)] lg:max-h-[calc(100vh-24px)] flex-shrink-0">
          <div className="h-full rounded-xl overflow-hidden relative border border-border-accent/40 w-full group shadow-sm">
            <CheckoutSlideshow items={[]} />
          </div>
        </section>
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

  const getShippingDetails = () => {
    if (addressOption === 'new' || !hasSavedAddresses) {
      return {
        fullName: customFullName,
        phone: customPhone,
        flat: customFlat,
        area: customArea,
        landmark: customLandmark,
        pincode: customPincode,
        city: customCity,
        state: customState,
        country: customCountry,
        saveAddress: true,
      };
    }
    if (addressOption === 'primary') {
      const addr = user.address;
      if (addr && typeof addr === 'object') {
        return {
          fullName: addr.fullName || user.name,
          phone: addr.phone || user.phone || '',
          flat: addr.flat || '',
          area: addr.area || '',
          landmark: addr.landmark || '',
          pincode: addr.pincode || '',
          city: addr.city || '',
          state: addr.state || '',
          country: addr.country || 'India',
        };
      }
      return {
        fullName: user.name,
        phone: user.phone || '',
        flat: '',
        area: typeof addr === 'string' ? addr : '',
        landmark: '',
        pincode: '',
        city: '',
        state: '',
        country: 'India',
      };
    } else if (addressOption === 'saved') {
      const selected = user.savedAddresses?.find(a => a.id === selectedSavedId);
      if (selected) {
        if (selected.addressLine) {
          return {
            fullName: selected.fullName || selected.name || user.name,
            phone: selected.phone || '',
            flat: '',
            area: selected.addressLine,
            landmark: '',
            pincode: '',
            city: '',
            state: '',
            country: 'India',
          };
        }
        return {
          fullName: selected.fullName || selected.name || user.name,
          phone: selected.phone || '',
          flat: selected.flat || '',
          area: selected.area || '',
          landmark: selected.landmark || '',
          pincode: selected.pincode || '',
          city: selected.city || '',
          state: selected.state || '',
          country: selected.country || 'India',
        };
      }
      return null;
    }
    return null;
  };

  const finalizeSuccessfulOrder = async (orderData: any, shippingDetails: any) => {
    if (user) {
      await fetch('/api/cart', { method: 'DELETE' }).catch(() => { });
    }
    localStorage.removeItem('cart');
    setCart([]);
    window.dispatchEvent(new Event('cart-updated'));
    window.dispatchEvent(new Event('orders-updated'));
    window.dispatchEvent(new Event('auth-changed'));

    const dispName = shippingDetails.fullName || user.name;
    const dispAddr = shippingDetails.addressLine || `${shippingDetails.flat}, ${shippingDetails.area}, ${shippingDetails.city}, ${shippingDetails.state} - ${shippingDetails.pincode}, ${shippingDetails.country}`;
    setSuccessOrder({
      orderNumber: orderData.orderNumber,
      total: total,
      name: dispName,
      address: dispAddr,
      items: orderData.items || []
    });
  };

  // Razorpay Handler
  const handleRazorpayPayment = async () => {
    setCheckoutError('');
    const shippingDetails = getShippingDetails() as any;
    if (!shippingDetails || !shippingDetails.fullName || (!shippingDetails.flat && !shippingDetails.area)) {
      setCheckoutError('Please enter complete shipping details before proceeding.');
      return;
    }

    setPlacingOrder(true);

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setCheckoutError('Failed to load Razorpay SDK. Please check your internet connection.');
      setPlacingOrder(false);
      return;
    }

    try {
      const selectedCurrency = country.currency || 'USD';
      const convertedAmount = Math.round(total * (country.rate || 1));
      const inrEquivalent = Math.round(total * 83.5);

      // 1. Create order on server in selected currency (with INR fallback)
      const res = await fetch('/api/checkout/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: convertedAmount,
          currency: selectedCurrency,
          inrAmount: inrEquivalent,
        }),
      });

      const orderData = await res.json();
      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to initiate Razorpay payment.');
      }

      // 2. Open Razorpay Modal
      const options: any = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Future Milestone',
        description: 'Scandinavian Furniture Purchase',
        order_id: orderData.orderId,
        prefill: {
          name: shippingDetails.fullName || user.name,
          email: user.email,
          contact: shippingDetails.phone || user.phone || '',
        },
        theme: {
          color: '#0f172a',
        },
        handler: async (response: any) => {
          try {
            // 3. Verify signature on server
            const verifyRes = await fetch('/api/checkout/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
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
                total: formatPrice(total),
                shippingAddress: shippingDetails,
              }),
            });

            const verifyData = await verifyRes.json();
            setPlacingOrder(false);

            if (verifyData.success && verifyData.order) {
              await finalizeSuccessfulOrder(verifyData.order, shippingDetails);
            } else {
              setCheckoutError(verifyData.error || 'Payment verification failed.');
            }
          } catch (err: any) {
            console.error(err);
            setCheckoutError('Payment verification failed.');
            setPlacingOrder(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPlacingOrder(false);
          },
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.open();
    } catch (err: any) {
      console.error(err);
      setCheckoutError(err.message || 'Error initializing Razorpay payment.');
      setPlacingOrder(false);
    }
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-3 bg-bg-primary select-text transition-theme relative lg:h-screen">

      {/* Left Column: Stable sticky image */}
      <section className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pl-3 lg:pr-0 flex items-stretch h-[400px] md:h-[600px] lg:h-[calc(100vh-24px)] lg:max-h-[calc(100vh-24px)] flex-shrink-0 transition-theme">
        <div className="h-full rounded-xl overflow-hidden relative border border-border-accent/40 w-full group shadow-sm">
          <CheckoutSlideshow items={cart.map(item => ({ image: item.product.images?.[0] || '', name: item.product.name }))} />

          <div className="absolute bottom-5 left-5 right-5">
            <div className="bg-bg-primary/80 backdrop-blur-md rounded-xl border border-border-accent/60 px-5 py-4 flex items-center justify-between shadow-lg transition-theme">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-fg-secondary mb-0.5">Order Total</p>
                <p className="text-2xl font-bold text-fg-primary font-dm-sans">{formatPrice(total)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-fg-secondary mb-0.5">{cart.length} Item{cart.length !== 1 ? 's' : ''}</p>
                {shipping > 0 && (
                  <p className="text-xs text-fg-secondary">
                    + {formatPrice(shipping)} shipping
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right Column: Scrollable forms */}
      <div
        ref={rightColumnRef}
        className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pr-3 lg:pl-0 flex flex-col gap-3 transition-theme lg:h-[calc(100vh-24px)] lg:max-h-[calc(100vh-24px)] lg:overflow-y-auto scrollbar-none"
      >
        <div className="w-full bg-bg-secondary border border-border-accent/40 p-8 md:p-10 rounded-xl transition-theme flex flex-col gap-2">
          <h1 className="font-dm-sans text-3xl md:text-4xl font-bold tracking-tight text-fg-primary">Checkout</h1>
          <p className="text-sm text-fg-secondary leading-relaxed font-medium">
            Select your delivery location and proceed to payment below.
          </p>
        </div>

        <div className="flex flex-col gap-3">
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
            <div className="w-full border-b border-border-accent/40 py-4 flex items-center justify-center">
              <h2 className="font-dm-sans text-xs font-bold text-fg-primary uppercase tracking-widest text-center">
                Order Summary
              </h2>
            </div>

            <div className="p-6 flex flex-col gap-4">
              {firstOrderDiscount > 0 && (
                <div className="bg-green-500/10 border border-green-500/25 text-green-600 dark:text-green-400 p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs font-semibold animate-fade-in shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎉</span>
                    <span>
                      <strong>{firstOrderDiscountPercent}% First Order Discount</strong> applied to your cart!
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-[10px] font-bold uppercase tracking-wider">
                    First Purchase
                  </span>
                </div>
              )}

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
                        <div className="flex justify-between items-start font-semibold text-fg-primary gap-2">
                          <h4>{item.product.name}</h4>
                          <div className="flex items-center gap-2">
                            <span>{formatPrice(item.product.price * item.quantity)}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.product.slug, itemMat, itemDim)}
                              className="text-fg-secondary/40 hover:text-red-500 transition-colors p-1 -mr-1 cursor-pointer"
                              title="Remove item"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <p className="text-fg-secondary/70 capitalize mt-0.5">{item.product.category} Collection</p>
                        <div className="flex gap-2 text-[9px] text-fg-secondary/80 mt-1 uppercase font-medium">
                          <span>{itemMat}</span>
                          <span>•</span>
                          <span>{itemDim}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1">
                        <div className="flex items-center border border-border-accent/40 rounded-lg overflow-hidden bg-bg-primary">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.product.slug, itemMat, itemDim, -1)}
                            className="px-2 py-0.5 text-xs font-semibold text-fg-secondary hover:text-fg-primary hover:bg-bg-secondary transition-colors cursor-pointer"
                            title="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="px-2.5 py-0.5 text-[10px] font-bold text-fg-primary border-x border-border-accent/40 min-w-[24px] text-center select-none">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.product.slug, itemMat, itemDim, 1)}
                            className="px-2 py-0.5 text-xs font-semibold text-fg-secondary hover:text-fg-primary hover:bg-bg-secondary transition-colors cursor-pointer"
                            title="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.product.slug, itemMat, itemDim)}
                          className="text-[10px] font-medium text-red-500/80 hover:text-red-500 hover:underline transition-all cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="border-t border-border-accent/40 pt-4 space-y-2.5 text-xs font-semibold text-fg-primary">
                <div className="flex justify-between">
                  <span className="text-fg-secondary font-normal">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {firstOrderDiscount > 0 && (
                  <div className="flex justify-between items-center text-green-500">
                    <span className="flex items-center gap-1.5 font-normal">
                      <span>First Order Discount ({firstOrderDiscountPercent}%)</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-green-500/10 text-[9px] font-bold uppercase tracking-wider">
                        1st Order
                      </span>
                    </span>
                    <span className="font-bold">- {formatPrice(firstOrderDiscount)}</span>
                  </div>
                )}
                {shipping > 0 && (
                  <div className="flex justify-between">
                    <span className="text-fg-secondary font-normal">Shipping</span>
                    <span className={shipping === 0 ? 'text-green-500' : ''}>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                  </div>
                )}
                {tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-fg-secondary font-normal">Tax (8%)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold border-t border-border-accent/40 pt-3 mt-1">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
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
              {user.address && (
                <label className={`flex items-start gap-3 border p-4 rounded-xl cursor-pointer transition-all ${addressOption === 'primary' ? 'border-fg-primary bg-bg-primary shadow-sm' : 'border-border-accent/40 bg-bg-primary/50 hover:bg-bg-primary/80'
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
                    <p className="text-fg-secondary mt-1">
                      {typeof user.address === 'object' ? (
                        `${user.address.flat}, ${user.address.area}, ${user.address.city}, ${user.address.state} - ${user.address.pincode}, ${user.address.country}`
                      ) : (
                        user.address
                      )}
                    </p>
                    {user.phone && <p className="text-fg-secondary/70 mt-0.5">📞 {user.phone}</p>}
                  </div>
                </label>
              )}

              {user.savedAddresses && user.savedAddresses.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-fg-secondary block px-1">Saved Locations</span>
                  {user.savedAddresses.map((addr) => (
                    <label key={addr.id} className={`flex items-start gap-3 border p-4 rounded-xl cursor-pointer transition-all ${addressOption === 'saved' && selectedSavedId === addr.id ? 'border-fg-primary bg-bg-primary shadow-sm' : 'border-border-accent/40 bg-bg-primary/50 hover:bg-bg-primary/80'
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
                          <span className="font-bold text-fg-primary">{addr.fullName || addr.name || 'Recipient'}</span>
                          <span className="px-1.5 py-0.5 bg-fg-primary/5 text-fg-primary text-[8px] font-bold uppercase tracking-wider rounded border border-border-accent/20">{addr.label}</span>
                        </div>
                        <p className="text-fg-secondary mt-1">
                          {addr.addressLine ? (
                            addr.addressLine
                          ) : (
                            `${addr.flat}, ${addr.area}, ${addr.city}, ${addr.state} - ${addr.pincode}, ${addr.country}`
                          )}
                        </p>
                        {addr.phone && <p className="text-fg-secondary/70 mt-0.5">📞 {addr.phone}</p>}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {hasSavedAddresses && (
                <label className={`flex items-start gap-3 border p-4 rounded-xl cursor-pointer transition-all ${addressOption === 'new' ? 'border-fg-primary bg-bg-primary shadow-sm' : 'border-border-accent/40 bg-bg-primary/50 hover:bg-bg-primary/80'
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
              )}

              {showCustomForm && (
                <div className="border border-border-accent/40 bg-bg-primary rounded-xl p-5 space-y-3.5 animate-fade-in shadow-sm">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-fg-secondary">Country/Region</label>
                    <select
                      value={selectedCountryIso}
                      onChange={(e) => {
                        const iso = e.target.value;
                        const cObj = Country.getCountryByCode(iso);
                        setSelectedCountryIso(iso);
                        setCustomCountry(cObj ? cObj.name : iso);
                        setSelectedStateIso('');
                        setCustomState('');
                      }}
                      className="w-full bg-bg-secondary text-fg-primary border border-border-accent/40 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-fg-primary transition-colors font-medium cursor-pointer"
                    >
                      {Country.getAllCountries().map((c) => (
                        <option key={c.isoCode} value={c.isoCode}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="ship-name" className="text-[9px] font-bold uppercase tracking-wider text-fg-secondary">Full Name</label>
                      <input
                        id="ship-name"
                        type="text"
                        required={showCustomForm}
                        value={customFullName}
                        onChange={(e) => setCustomFullName(e.target.value)}
                        placeholder="Jane Smith"
                        className="w-full bg-bg-secondary text-fg-primary placeholder:text-fg-secondary/40 border border-border-accent/40 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-fg-primary transition-colors font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="ship-phone" className="text-[9px] font-bold uppercase tracking-wider text-fg-secondary">Mobile Number</label>
                      <input
                        id="ship-phone"
                        type="text"
                        required={showCustomForm}
                        value={customPhone}
                        onChange={(e) => setCustomPhone(e.target.value)}
                        placeholder="Mobile number"
                        className="w-full bg-bg-secondary text-fg-primary placeholder:text-fg-secondary/40 border border-border-accent/40 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-fg-primary transition-colors font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="ship-flat" className="text-[9px] font-bold uppercase tracking-wider text-fg-secondary">Flat, House no., Apartment</label>
                    <input
                      id="ship-flat"
                      type="text"
                      required={showCustomForm}
                      value={customFlat}
                      onChange={(e) => setCustomFlat(e.target.value)}
                      placeholder="Flat, House no. etc."
                      className="w-full bg-bg-secondary text-fg-primary placeholder:text-fg-secondary/40 border border-border-accent/40 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-fg-primary transition-colors font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="ship-area" className="text-[9px] font-bold uppercase tracking-wider text-fg-secondary">Area, Street, Sector</label>
                    <input
                      id="ship-area"
                      type="text"
                      required={showCustomForm}
                      value={customArea}
                      onChange={(e) => setCustomArea(e.target.value)}
                      placeholder="Area, Street etc."
                      className="w-full bg-bg-secondary text-fg-primary placeholder:text-fg-secondary/40 border border-border-accent/40 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-fg-primary transition-colors font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="ship-pincode" className="text-[9px] font-bold uppercase tracking-wider text-fg-secondary">Pincode / Zip Code</label>
                      <input
                        id="ship-pincode"
                        type="text"
                        required={showCustomForm}
                        value={customPincode}
                        onChange={(e) => setCustomPincode(e.target.value)}
                        placeholder="Pincode/Zip"
                        className="w-full bg-bg-secondary text-fg-primary placeholder:text-fg-secondary/40 border border-border-accent/40 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-fg-primary transition-colors font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="ship-city" className="text-[9px] font-bold uppercase tracking-wider text-fg-secondary">Town/City</label>
                      <input
                        id="ship-city"
                        type="text"
                        required={showCustomForm}
                        value={customCity}
                        onChange={(e) => setCustomCity(e.target.value)}
                        placeholder="Town/City"
                        className="w-full bg-bg-secondary text-fg-primary placeholder:text-fg-secondary/40 border border-border-accent/40 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-fg-primary transition-colors font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-fg-secondary">State / Region</label>
                    {selectedCountryIso && State.getStatesOfCountry(selectedCountryIso).length > 0 ? (
                      <select
                        value={selectedStateIso}
                        onChange={(e) => {
                          const sIso = e.target.value;
                          const sObj = State.getStateByCodeAndCountry(sIso, selectedCountryIso);
                          setSelectedStateIso(sIso);
                          setCustomState(sObj ? sObj.name : sIso);
                        }}
                        required={showCustomForm}
                        className="w-full bg-bg-secondary text-fg-primary border border-border-accent/40 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-fg-primary transition-colors font-medium cursor-pointer"
                      >
                        <option value="">Select State / Region</option>
                        {State.getStatesOfCountry(selectedCountryIso).map((s) => (
                          <option key={s.isoCode} value={s.isoCode}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        required={showCustomForm}
                        value={customState}
                        onChange={(e) => setCustomState(e.target.value)}
                        placeholder="State/Province/Region"
                        className="w-full bg-bg-secondary text-fg-primary border border-border-accent/40 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-fg-primary transition-colors font-medium"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── 3. Payment Section ──────────────────────────────────── */}
          <div className="w-full bg-bg-secondary border border-border-accent/40 rounded-xl overflow-hidden transition-theme">
            <div className="w-full border-b border-border-accent/40 py-4 flex items-center justify-center">
              <h2 className="font-dm-sans text-xs font-bold text-fg-primary uppercase tracking-widest text-center">
                Payment
              </h2>
            </div>

            <div className="p-6 space-y-5">
              {/* Payment Method Selector */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
                    paymentMethod === 'razorpay'
                      ? 'border-fg-primary bg-fg-primary/5 text-fg-primary shadow-sm font-semibold'
                      : 'border-border-accent/40 bg-bg-primary text-fg-secondary hover:border-border-accent'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-[#0052CC] dark:text-[#3395FF]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.436 0l-11.91 7.773-1.174 4.276 6.625-4.323L12.38 24 2.5 12.338l8.528-5.568-1.579-4.27L0 8.653 14.156 24h.005L24 0h-1.564z"/>
                    </svg>
                    <span className="text-xs font-bold font-dm-sans">Razorpay</span>
                  </div>
                  <span className="text-[10px] text-fg-secondary leading-tight">
                    UPI, Credit & Debit Cards
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
                    paymentMethod === 'paypal'
                      ? 'border-fg-primary bg-fg-primary/5 text-fg-primary shadow-sm font-semibold'
                      : 'border-border-accent/40 bg-bg-primary text-fg-secondary hover:border-border-accent'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-[#003087]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .761-.647h6.812c2.474 0 4.397.587 5.397 1.705.952 1.06 1.144 2.585.57 4.53-.024.085-.05.17-.078.256-.84 2.766-2.88 4.417-5.918 4.417H9.79l-1.096 6.643a.641.641 0 0 1-.633.713h-.985z"/>
                    </svg>
                    <span className="text-xs font-bold font-dm-sans">PayPal</span>
                  </div>
                  <span className="text-[10px] text-fg-secondary leading-tight">
                    PayPal, Credit & Debit Cards
                  </span>
                </button>
              </div>

              {paymentMethod === 'razorpay' ? (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={handleRazorpayPayment}
                    disabled={placingOrder}
                    className="w-full bg-fg-primary text-bg-primary py-4 rounded-xl font-bold text-sm hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed shadow-sm"
                  >
                    {placingOrder ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-bg-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Processing Payment...</span>
                      </>
                    ) : (
                      <span>Pay with Razorpay — {formatPrice(total)}</span>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {paypalLoading && (
                    <div className="py-6 text-center text-xs text-fg-secondary flex items-center justify-center gap-2 bg-bg-primary rounded-xl border border-border-accent/40">
                      <svg className="animate-spin h-4 w-4 text-fg-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Loading PayPal Secure Button...</span>
                    </div>
                  )}

                  <div id="paypal-button-container" className="w-full min-h-[50px] relative z-0" />
                </div>
              )}


              {/* Trust signals */}
              <div className="flex items-center justify-center gap-6 pt-2">
                {[
                  { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', label: '256-bit SSL' },
                  { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: 'Buyer Protection' },
                  { icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', label: 'Instant Verification' },
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

          <div className="pb-8" />
        </div>
      </div>
    </div>
  );
}
