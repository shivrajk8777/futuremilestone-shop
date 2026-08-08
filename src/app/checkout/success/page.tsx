'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useState, useEffect, useRef } from 'react';

interface OrderItem {
  image: string;
  name: string;
}

interface Order {
  items: OrderItem[];
  orderNumber: string;
  total: number;
  shippingAddress?: {
    name: string;
    addressLine: string;
  } | null;
}

function CheckoutSuccessSkeleton() {
  return (
    <div className="w-full flex flex-col lg:flex-row gap-3 bg-bg-primary select-text transition-theme relative lg:h-screen">

      {/* Left Column Image Skeleton */}
      <section className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pl-3 lg:pr-0 flex items-stretch h-[400px] md:h-[600px] lg:h-[calc(100vh-24px)] lg:max-h-[calc(100vh-24px)] flex-shrink-0 transition-theme">
        <div className="h-full rounded-xl w-full border border-border-accent/40 animate-wave relative overflow-hidden bg-bg-secondary">
          {/* Floating Order Number Badge Skeleton */}
          <div className="absolute bottom-5 left-5 right-5 z-20">
            <div className="bg-bg-primary/80 backdrop-blur-md rounded-xl border border-border-accent/60 px-5 py-4 flex items-center justify-between shadow-lg transition-theme animate-pulse">
              <div className="space-y-1.5">
                <div className="h-3 w-16 bg-fg-primary/10 rounded-md" />
                <div className="h-5 w-24 bg-fg-primary/10 rounded-md" />
              </div>
              <div className="text-right flex flex-col items-end space-y-1.5">
                <div className="h-3 w-16 bg-fg-primary/10 rounded-md" />
                <div className="h-5 w-16 bg-fg-primary/10 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right Column Details Skeleton */}
      <div className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pr-3 lg:pl-0 flex flex-col justify-center items-center gap-3 transition-theme lg:h-[calc(100vh-24px)] lg:max-h-[calc(100vh-24px)] lg:overflow-y-auto scrollbar-none">
        <div className="flex flex-col items-center justify-center min-h-full w-full py-8 flex-shrink-0">
          <div className="w-full max-w-md bg-bg-secondary p-8 md:p-12 border border-border-accent/40 rounded-xl shadow-sm text-center space-y-6 animate-pulse">

            {/* Checkmark Animation Icon Placeholder */}
            <div className="w-16 h-16 bg-fg-primary/5 border border-border-accent/40 rounded-full flex items-center justify-center mx-auto shadow-sm" />

            <div className="space-y-2.5 flex flex-col items-center">
              <div className="h-7 w-48 bg-fg-primary/10 rounded-md" />
              <div className="h-3.5 w-64 bg-fg-primary/5 rounded-md" />
            </div>

            {/* Details Box Placeholder */}
            <div className="bg-bg-primary p-5 rounded-xl border border-border-accent/30 text-left space-y-4 w-full">
              <div className="flex justify-between pb-2 border-b border-border-accent/20">
                <div className="h-3.5 w-20 bg-fg-primary/5 rounded-md" />
                <div className="h-3.5 w-24 bg-fg-primary/10 rounded-md" />
              </div>

              <div className="flex justify-between pb-2 border-b border-border-accent/20">
                <div className="h-3.5 w-20 bg-fg-primary/5 rounded-md" />
                <div className="h-3.5 w-16 bg-fg-primary/10 rounded-md" />
              </div>

              <div className="space-y-2">
                <div className="h-3.5 w-12 bg-fg-primary/5 rounded-md" />
                <div className="h-3.5 w-32 bg-fg-primary/10 rounded-md" />
                <div className="h-3.5 w-48 bg-fg-primary/5 rounded-md" />
              </div>

              <div className="space-y-2 pt-2 border-t border-border-accent/20">
                <div className="h-3.5 w-24 bg-fg-primary/5 rounded-md" />
                <div className="h-3.5 w-40 bg-fg-primary/10 rounded-md" />
              </div>
            </div>

            {/* Redirect Buttons Placeholder */}
            <div className="flex flex-col gap-2 pt-2 w-full">
              <div className="w-full h-11 bg-fg-primary/10 rounded-lg" />
              <div className="w-full h-11 bg-fg-primary/5 rounded-lg border border-border-accent/30" />
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}

function SuccessDetails() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const fallbackOrderNumber = searchParams.get('orderNumber') || '#FJ-XXXXX';
  const fallbackTotal = searchParams.get('total') || '0';
  const fallbackName = searchParams.get('name') || '';
  const fallbackAddress = searchParams.get('address') || '';

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(!!orderId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const rightColumnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!orderId) return;

    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.order) {
          setOrder(data.order);
        }
      })
      .catch((err) => console.error('Failed to fetch success order details:', err))
      .finally(() => setLoading(false));
  }, [orderId]);

  // Slideshow logic for left column
  const items = order?.items || [];
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

  if (loading) {
    return <CheckoutSuccessSkeleton />;
  }

  // Calculate mock delivery date (5 days from today)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);

  const formattedDate = deliveryDate.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const displayOrderNumber = order ? order.orderNumber : fallbackOrderNumber;
  const displayTotal = order ? order.total : fallbackTotal;
  const displayName = order?.shippingAddress?.name || fallbackName;
  const displayAddress = order?.shippingAddress?.addressLine || fallbackAddress;

  return (
    <div className="w-full flex flex-col lg:flex-row gap-3 bg-bg-primary select-text transition-theme relative lg:h-screen">

      {/* Left Column: Stable sticky image slide show (mirroring Checkout Page exactly) */}
      <section className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pl-3 lg:pr-0 flex items-stretch h-[400px] md:h-[600px] lg:h-[calc(100vh-24px)] lg:max-h-[calc(100vh-24px)] flex-shrink-0 transition-theme">
        <div className="h-full rounded-xl overflow-hidden relative border border-border-accent/40 w-full group shadow-sm bg-bg-secondary">
          {items.length === 0 ? (
            <>
              <img
                src="/images/about.png"
                alt="Checkout Success"
                className="absolute inset-0 w-full h-full object-cover brightness-[0.92] transition-transform duration-700 group-hover:scale-[1.01]"
              />
              <div className="absolute inset-0 bg-black/10" />
            </>
          ) : (
            <>
              {items.map((item, idx) => (
                <img
                  key={idx}
                  src={item.image}
                  alt={item.name}
                  className={`absolute inset-0 w-full h-full object-cover brightness-[0.92] transition-all duration-1000 ease-in-out ${currentIndex === idx
                      ? 'opacity-100 scale-100 pointer-events-auto'
                      : 'opacity-0 scale-[0.99] pointer-events-none'
                    }`}
                />
              ))}
              <div className="absolute inset-0 bg-black/10 pointer-events-none z-10" />
            </>
          )}

          {/* Floating Order Number Badge on Left Image */}
          <div className="absolute bottom-5 left-5 right-5 z-20">
            <div className="bg-bg-primary/80 backdrop-blur-md rounded-xl border border-border-accent/60 px-5 py-4 flex items-center justify-between shadow-lg transition-theme">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-fg-secondary mb-0.5">Order Number</p>
                <p className="text-xl font-bold text-fg-primary font-dm-sans">{displayOrderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-fg-secondary mb-0.5">Total Paid</p>
                <p className="text-xl font-bold text-fg-primary font-dm-sans">${displayTotal}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right Column: Scrollable details */}
      <div
        ref={rightColumnRef}
        className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pr-3 lg:pl-0 flex flex-col justify-center items-center gap-3 transition-theme lg:h-[calc(100vh-24px)] lg:max-h-[calc(100vh-24px)] lg:overflow-y-auto scrollbar-none"
      >
        <div className="flex flex-col items-center justify-center min-h-full w-full py-8 flex-shrink-0">
          <div className="w-full max-w-md bg-bg-secondary p-8 md:p-12 border border-border-accent/40 rounded-xl shadow-sm text-center space-y-6">

            {/* Checkmark Animation Icon */}
            <div className="w-16 h-16 bg-green-500/10 text-green-500 border border-green-500/25 rounded-full flex items-center justify-center mx-auto shadow-sm animate-bounce">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div className="space-y-2">
              <h1 className="font-dm-sans text-2xl md:text-3xl font-semibold tracking-tight text-fg-primary">
                Order Confirmed
              </h1>
              <p className="text-xs text-fg-secondary leading-relaxed font-medium">
                Thank you for your purchase. We are preparing your Scandinavian furniture pieces!
              </p>
            </div>

            {/* Details Box */}
            <div className="bg-bg-primary p-5 rounded-xl border border-border-accent/30 text-left space-y-3.5 text-xs w-full">
              <div className="flex justify-between border-b border-border-accent/20 pb-2 font-semibold">
                <span className="text-fg-secondary font-normal">Order Number</span>
                <span className="font-bold text-fg-primary">{displayOrderNumber}</span>
              </div>

              <div className="flex justify-between border-b border-border-accent/20 pb-2 font-semibold">
                <span className="text-fg-secondary font-normal">Total Amount</span>
                <span className="font-bold text-fg-primary">${displayTotal}</span>
              </div>

              <div className="space-y-1">
                <span className="text-fg-secondary block">Ship To</span>
                <span className="font-bold text-fg-primary block">{displayName}</span>
                <span className="text-fg-secondary/80 font-normal block leading-relaxed">{displayAddress}</span>
              </div>

              <div className="space-y-1 pt-2 border-t border-border-accent/20">
                <span className="text-fg-secondary block">Estimated Delivery</span>
                <span className="font-bold text-fg-primary block text-green-600 font-semibold">{formattedDate}</span>
              </div>
            </div>

            {/* Redirect Buttons */}
            <div className="flex flex-col gap-2 pt-2 w-full">
              <Link
                href="/account?tab=orders"
                className="w-full bg-fg-primary text-bg-primary py-3.5 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity text-center block shadow-sm"
              >
                View Order History
              </Link>
              <Link
                href="/shop"
                className="w-full border border-border-accent text-fg-primary bg-bg-primary py-3.5 rounded-lg text-xs font-semibold hover:bg-bg-secondary transition-colors text-center block"
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

export default function CheckoutSuccessPage() {
  return (
    <div className="w-full">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[75vh] gap-2">
          <svg className="animate-spin h-6 w-6 text-fg-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs text-fg-secondary font-semibold">Loading details...</span>
        </div>
      }>
        <SuccessDetails />
      </Suspense>
    </div>
  );
}
