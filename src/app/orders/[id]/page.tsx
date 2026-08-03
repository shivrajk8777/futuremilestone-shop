'use client';

import { use, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { useCurrency } from '@/context/CurrencyContext';

interface OrderItem {
  slug: string;
  name: string;
  material: string;
  dimension: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
  trackingId?: string | null;
  deliveryPartnerName?: string | null;
  deliveryPartnerCode?: string | null;
  adminMessage?: string | null;
  statusTimeline?: Array<{
    status: string;
    timestamp: string;
    comment: string;
  }>;
  shippingAddress?: {
    name: string;
    addressLine: string;
    phone?: string;
  } | null;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

function OrderTrackingSkeleton() {
  return (
    <div className="w-full flex flex-col lg:flex-row gap-3 bg-bg-primary select-text transition-theme relative lg:h-screen">
      
      {/* Left Column Image Skeleton */}
      <section className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pl-3 lg:pr-0 flex items-stretch h-[400px] md:h-[600px] lg:h-[calc(100vh-24px)] lg:max-h-[calc(100vh-24px)] flex-shrink-0 transition-theme">
        <div className="h-full rounded-xl w-full border border-border-accent/40 animate-wave relative overflow-hidden bg-bg-secondary">
          {/* Floating Badge Skeleton */}
          <div className="absolute bottom-5 left-5 right-5 z-20">
            <div className="bg-bg-primary/80 backdrop-blur-md rounded-xl border border-border-accent/60 px-5 py-4 flex items-center justify-between shadow-lg transition-theme animate-pulse">
              <div className="space-y-2">
                <div className="h-3 w-16 bg-fg-primary/5 rounded-md" />
                <div className="h-4.5 w-20 bg-fg-primary/10 rounded-md" />
              </div>
              <div className="text-right flex flex-col items-end space-y-2">
                <div className="h-3 w-16 bg-fg-primary/5 rounded-md" />
                <div className="h-5 w-16 bg-fg-primary/10 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right Column Details Skeleton */}
      <div className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pr-3 lg:pl-0 flex flex-col gap-3 transition-theme lg:h-[calc(100vh-24px)] lg:max-h-[calc(100vh-24px)] lg:overflow-y-auto scrollbar-none">
        <div className="flex flex-col gap-3 w-full flex-shrink-0">
          
          {/* Header Card Skeleton */}
          <div className="w-full bg-bg-secondary border border-border-accent/40 p-8 md:p-10 rounded-xl transition-theme flex flex-col gap-2 animate-pulse">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="h-3.5 w-24 bg-fg-primary/5 rounded-md" />
              <div className="h-3 w-32 bg-fg-primary/5 rounded-md font-mono" />
            </div>
            <div className="h-8 w-64 bg-fg-primary/10 rounded-md mt-4" />
            <div className="h-3 w-40 bg-fg-primary/5 rounded-md mt-1.5" />
          </div>

          {/* Delivery Tracker Skeleton */}
          <div className="w-full bg-bg-secondary border border-border-accent/40 rounded-xl overflow-hidden transition-theme animate-pulse">
            <div className="w-full border-b border-border-accent/40 py-4 flex justify-center">
              <div className="h-3 w-28 bg-fg-primary/5 rounded-md" />
            </div>
            <div className="p-6 space-y-6">
              {/* Stepper dots placeholder */}
              <div className="flex justify-between items-center relative py-2">
                <div className="absolute left-[12.5%] right-[12.5%] top-6 h-0.5 bg-border-accent/60 w-3/4 mx-auto -z-10" />
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex flex-col items-center flex-1">
                    <div className="w-8 h-8 rounded-full bg-fg-primary/10 flex items-center justify-center font-bold text-xs" />
                    <div className="h-3 w-12 bg-fg-primary/5 rounded-md mt-2" />
                    <div className="h-2 w-8 bg-fg-primary/5 rounded-md mt-1" />
                  </div>
                ))}
              </div>
              {/* Carrier details box */}
              <div className="bg-bg-primary p-4 rounded-xl border border-border-accent/30 flex justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="h-2.5 w-24 bg-fg-primary/5 rounded-md" />
                  <div className="h-3.5 w-32 bg-fg-primary/10 rounded-md" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-2.5 w-28 bg-fg-primary/5 rounded-md" />
                  <div className="h-3.5 w-24 bg-fg-primary/10 rounded-md" />
                </div>
              </div>
            </div>
          </div>

          {/* Items Summary Skeleton */}
          <div className="w-full bg-bg-secondary border border-border-accent/40 rounded-xl overflow-hidden transition-theme animate-pulse">
            <div className="w-full border-b border-border-accent/40 py-4 flex justify-center">
              <div className="h-3 w-24 bg-fg-primary/5 rounded-md" />
            </div>
            <div className="p-6 flex flex-col gap-4">
              {[1, 2].map((i) => (
                <div key={i} className={`flex gap-4 ${i > 1 ? 'pt-4 border-t border-border-accent/30' : ''}`}>
                  <div className="w-16 h-16 bg-bg-primary rounded-lg border border-border-accent/30 flex-shrink-0" />
                  <div className="flex-1 flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="h-4 w-40 bg-fg-primary/10 rounded-md" />
                      <div className="h-3 w-20 bg-fg-primary/5 rounded-md" />
                    </div>
                    <div className="text-right space-y-1.5">
                      <div className="h-4 w-12 bg-fg-primary/10 rounded-md" />
                      <div className="h-3 w-8 bg-fg-primary/5 rounded-md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Location Skeleton */}
          <div className="w-full bg-bg-secondary border border-border-accent/40 rounded-xl overflow-hidden transition-theme animate-pulse">
            <div className="w-full border-b border-border-accent/40 py-4 flex justify-center">
              <div className="h-3 w-28 bg-fg-primary/5 rounded-md" />
            </div>
            <div className="p-6">
              <div className="bg-bg-primary p-4 rounded-xl border border-border-accent/30 space-y-2">
                <div className="h-3.5 w-24 bg-fg-primary/10 rounded-md" />
                <div className="h-3.5 w-48 bg-fg-primary/5 rounded-md" />
                <div className="h-3 w-32 bg-fg-primary/5 rounded-md" />
              </div>
            </div>
          </div>

          {/* Bottom Navigation Shortcuts Skeleton */}
          <div className="w-full bg-bg-secondary border border-border-accent/40 p-6 rounded-xl transition-theme flex flex-col sm:flex-row gap-3 animate-pulse">
            <div className="flex-1 h-11 bg-fg-primary/10 rounded-xl" />
            <div className="flex-1 h-11 bg-fg-primary/5 rounded-xl border border-border-accent/30" />
          </div>

          {/* Bottom spacing */}
          <div className="pb-8" />
        </div>
      </div>

    </div>
  );
}

export default function OrderTrackingPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { formatPrice } = useCurrency();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tracking, setTracking] = useState<any | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const rightColumnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      setError('You must be logged in to view order details.');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('Order not found or does not belong to your account.');
          } else {
            setError('Failed to fetch order details.');
          }
          return;
        }
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
          // Fetch live tracking if trackingId is present
          if (data.order.trackingId) {
            setTrackingLoading(true);
            try {
              const trackRes = await fetch(`/api/orders/${id}/tracking`);
              if (trackRes.ok) {
                const trackData = await trackRes.json();
                if (trackData.success) {
                  setTracking(trackData.tracking);
                }
              }
            } catch (trackErr) {
              console.error("Failed to load tracking data:", trackErr);
            } finally {
              setTrackingLoading(false);
            }
          }
        } else {
          setError(data.error || 'Failed to fetch order details.');
        }
      } catch (err) {
        console.error(err);
        setError('An unexpected error occurred while fetching order.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, user, userLoading]);

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimelineDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading || userLoading) {
    return <OrderTrackingSkeleton />;
  }

  if (error || !order) {
    return (
      <div className="w-full min-h-[70vh] flex items-center justify-center p-6 bg-bg-primary">
        <div className="w-full max-w-md bg-bg-secondary p-8 border border-border-accent/40 rounded-2xl text-center space-y-6 shadow-sm">
          <div className="w-12 h-12 bg-red-500/10 text-red-500 border border-red-500/25 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="font-dm-sans text-xl font-bold text-fg-primary">Unable to Track Order</h2>
            <p className="text-xs text-fg-secondary leading-relaxed">{error || 'Order tracking details could not be retrieved.'}</p>
          </div>
          <div className="pt-2">
            <Link
              href="/account?tab=orders"
              className="w-full bg-fg-primary text-bg-primary py-3 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity text-center block shadow-sm"
            >
              Back to Order History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate estimated delivery date if not delivered (5 days from creation)
  const orderDate = new Date(order.createdAt);
  const deliveryEst = new Date(orderDate);
  deliveryEst.setDate(deliveryEst.getDate() + 5);

  const formattedEstDate = deliveryEst.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="w-full flex flex-col lg:flex-row gap-3 bg-bg-primary select-text transition-theme relative lg:h-screen">
      
      {/* Left Column: Stable sticky image slideshow (mirroring Checkout Page exactly) */}
      <section className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pl-3 lg:pr-0 flex items-stretch h-[400px] md:h-[600px] lg:h-[calc(100vh-24px)] lg:max-h-[calc(100vh-24px)] flex-shrink-0 transition-theme">
        <div className="h-full rounded-xl overflow-hidden relative border border-border-accent/40 w-full group shadow-sm bg-bg-secondary">
          {items.length === 0 ? (
            <>
              <img
                src="/images/xz7hJ6ESQ5b48HiLq5UkSZLMyM_a48801.webp"
                alt="Order Tracking"
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
                  className={`absolute inset-0 w-full h-full object-cover brightness-[0.92] transition-all duration-1000 ease-in-out ${
                    currentIndex === idx
                      ? 'opacity-100 scale-100 pointer-events-auto'
                      : 'opacity-0 scale-[0.99] pointer-events-none'
                  }`}
                />
              ))}
              <div className="absolute inset-0 bg-black/10 pointer-events-none z-10" />
            </>
          )}

          {/* Floating badge details inside the image matching Checkout Page */}
          <div className="absolute bottom-5 left-5 right-5 z-20">
            <div className="bg-bg-primary/80 backdrop-blur-md rounded-xl border border-border-accent/60 px-5 py-4 flex items-center justify-between shadow-lg transition-theme">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-fg-secondary mb-0.5">Order Status</p>
                <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-black tracking-widest ${
                  order.status === 'Cancelled' || order.status === 'Canceled'
                    ? 'bg-red-500/20 text-red-600'
                    : order.status === 'Delivered'
                      ? 'bg-green-500/20 text-green-600'
                      : 'bg-indigo-500/20 text-indigo-600'
                }`}>
                  {order.status}
                </span>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-fg-secondary mb-0.5">Order Value</p>
                <p className="text-xl font-bold text-fg-primary font-dm-sans">{formatPrice(order.total)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right Column: Scrollable details */}
      <div
        ref={rightColumnRef}
        className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pr-3 lg:pl-0 flex flex-col gap-3 transition-theme lg:h-[calc(100vh-24px)] lg:max-h-[calc(100vh-24px)] lg:overflow-y-auto scrollbar-none"
      >
        <div className="flex flex-col gap-3 w-full flex-shrink-0">
        
        {/* Header Card */}
        <div className="w-full bg-bg-secondary border border-border-accent/40 p-8 md:p-10 rounded-xl transition-theme flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/account?tab=orders"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-fg-secondary hover:text-fg-primary transition-colors uppercase tracking-wider"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Account
            </Link>
            <span className="text-[10px] font-bold text-fg-secondary/50 uppercase tracking-widest">
              Order ID: <span className="font-mono">{order.id}</span>
            </span>
          </div>

          <h1 className="font-dm-sans text-3xl font-bold tracking-tight text-fg-primary mt-4">
            Tracking {order.orderNumber}
          </h1>
          <p className="text-xs text-fg-secondary leading-relaxed font-semibold">
            Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* ── 1. Delivery Tracker (Stepper) ─────────────────────────────────── */}
        <div className="w-full bg-bg-secondary border border-border-accent/40 rounded-xl overflow-hidden transition-theme">
          <div className="w-full border-b border-border-accent/40 py-4 flex items-center justify-center">
            <h2 className="font-dm-sans text-xs font-bold text-fg-primary uppercase tracking-widest text-center">
              Delivery Tracker
            </h2>
          </div>
          
          <div className="p-6 space-y-6">
            {order.status === 'Cancelled' || order.status === 'Canceled' ? (
              <div className="flex items-center w-full max-w-md mx-auto relative justify-between py-2">
                <div className="absolute left-0 right-0 top-6 -translate-y-1/2 h-0.5 bg-red-500/20 -z-10" />
                
                <div className="flex flex-col items-center flex-1">
                  <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm shadow-sm z-10">
                    ✓
                  </div>
                  <span className="font-bold text-fg-primary mt-2 text-xs">Ordered</span>
                  <span className="text-[9px] text-fg-secondary/60 mt-0.5">
                    {formatTimelineDate(order.statusTimeline?.find(t => t.status === 'Processing')?.timestamp || order.createdAt)}
                  </span>
                </div>

                <div className="flex flex-col items-center flex-1">
                  <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-sm shadow-sm z-10">
                    ✕
                  </div>
                  <span className="font-bold text-red-500 mt-2 text-xs">Cancelled</span>
                  <span className="text-[9px] text-red-500/80 mt-0.5">
                    {formatTimelineDate(order.statusTimeline?.find(t => t.status === 'Cancelled' || t.status === 'Canceled')?.timestamp)}
                  </span>
                </div>
              </div>
            ) : (
              (() => {
                const timeline = order.statusTimeline || [];
                const orderedItem = timeline.find(t => t.status === 'Processing');
                const acceptedItem = timeline.find(t => t.status === 'Accepted');
                const dispatchedItem = timeline.find(t => t.status === 'Dispatched' || t.status === 'Shipped');
                const deliveredItem = timeline.find(t => t.status === 'Delivered');

                const isAccepted = !!acceptedItem || ['Accepted', 'Dispatched', 'Shipped', 'Delivered'].includes(order.status);
                const isDispatched = !!dispatchedItem || ['Dispatched', 'Shipped', 'Delivered'].includes(order.status);
                const isDelivered = !!deliveredItem || order.status === 'Delivered';

                return (
                  <div className="flex items-center w-full relative justify-between py-2">
                    <div className="absolute left-[12.5%] right-[12.5%] top-6 -translate-y-1/2 h-0.5 bg-border-accent/60 -z-10">
                      <div 
                        className="h-full bg-green-500 transition-all duration-500" 
                        style={{
                          width: isDelivered ? '100%' : isDispatched ? '66%' : isAccepted ? '33%' : '0%'
                        }}
                      />
                    </div>

                    <div className="flex flex-col items-center flex-1">
                      <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-[13px] shadow-sm z-10">
                        ✓
                      </div>
                      <span className="font-bold text-fg-primary mt-2 text-xs">Ordered</span>
                      <span className="text-[9px] text-fg-secondary/60 mt-0.5">
                        {formatTimelineDate(orderedItem?.timestamp || order.createdAt)}
                      </span>
                    </div>

                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[13px] shadow-sm z-10 transition-colors ${
                        isAccepted ? 'bg-green-500 text-white' : 'bg-bg-primary text-fg-secondary/40 border border-border-accent'
                      }`}>
                        {isAccepted ? '✓' : '2'}
                      </div>
                      <span className={`font-bold mt-2 text-xs ${isAccepted ? 'text-fg-primary' : 'text-fg-secondary/40'}`}>Accepted</span>
                      <span className="text-[9px] text-fg-secondary/60 mt-0.5">
                        {acceptedItem ? formatTimelineDate(acceptedItem.timestamp) : ''}
                      </span>
                    </div>

                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[13px] shadow-sm z-10 transition-colors ${
                        isDispatched ? 'bg-green-500 text-white' : 'bg-bg-primary text-fg-secondary/40 border border-border-accent'
                      }`}>
                        {isDispatched ? '✓' : '3'}
                      </div>
                      <span className={`font-bold mt-2 text-xs ${isDispatched ? 'text-fg-primary' : 'text-fg-secondary/40'}`}>Dispatched</span>
                      <span className="text-[9px] text-fg-secondary/60 mt-0.5">
                        {dispatchedItem ? formatTimelineDate(dispatchedItem.timestamp) : ''}
                      </span>
                    </div>

                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[13px] shadow-sm z-10 transition-colors ${
                        isDelivered ? 'bg-green-500 text-white' : 'bg-bg-primary text-fg-secondary/40 border border-border-accent'
                      }`}>
                        {isDelivered ? '✓' : '4'}
                      </div>
                      <span className={`font-bold mt-2 text-xs ${isDelivered ? 'text-fg-primary' : 'text-fg-secondary/40'}`}>Delivered</span>
                      <span className="text-[9px] text-fg-secondary/60 mt-0.5">
                        {deliveredItem ? formatTimelineDate(deliveredItem.timestamp) : ''}
                      </span>
                    </div>
                  </div>
                );
              })()
            )}

            {/* Carrier Details Box */}
            <div className="bg-bg-primary p-4 rounded-xl border border-border-accent/40 flex flex-wrap justify-between items-center gap-4 text-xs">
              <div>
                <span className="text-[10px] text-fg-secondary/50 uppercase font-bold tracking-wider block">Courier Partner</span>
                <span className="font-bold text-fg-primary mt-0.5 block">{order.deliveryPartnerName || 'Standard International Shipping'}</span>
              </div>
              <div>
                <span className="text-[10px] text-fg-secondary/50 uppercase font-bold tracking-wider block">Tracking Reference</span>
                {order.trackingId ? (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-indigo-600 font-bold select-all">{order.trackingId}</span>
                    <button
                      onClick={() => copyToClipboard(order.trackingId || '')}
                      className="text-fg-secondary hover:text-fg-primary transition-colors p-1"
                      title="Copy tracking ID"
                    >
                      {copied ? (
                        <span className="text-[10px] text-green-500 font-semibold uppercase tracking-wider">Copied</span>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                      )}
                    </button>
                  </div>
                ) : (
                  <span className="text-fg-secondary/70 italic mt-0.5 block">Reference code will be updated shortly</span>
                )}
              </div>
            </div>

            {/* Live Shipment Tracking details panel */}
            {order.trackingId && (
              <div className="bg-bg-primary p-5 rounded-xl border border-border-accent/40 space-y-4 text-xs mt-1">
                <div className="flex justify-between items-center border-b border-border-accent/20 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[18px]">✈️</span>
                    <div>
                      <span className="font-bold text-fg-primary block">Live Shipment Status</span>
                      <span className="text-[9px] text-fg-secondary/50 uppercase font-bold tracking-wider">DHL Real-Time Tracker</span>
                    </div>
                  </div>
                  {trackingLoading ? (
                    <span className="text-[10px] text-fg-secondary/60 animate-pulse font-medium">Updating...</span>
                  ) : tracking ? (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-extrabold tracking-wider border ${
                      tracking.status === "Delivered"
                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                        : tracking.status === "Out for Delivery"
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          : "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
                    }`}>
                      {tracking.status}
                    </span>
                  ) : (
                    <span className="text-[9px] text-fg-secondary/50 font-bold uppercase">Dispatched</span>
                  )}
                </div>

                {trackingLoading ? (
                  <div className="py-6 flex flex-col items-center justify-center gap-2 text-fg-secondary/60">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-[10px] font-medium animate-pulse">Connecting to carrier servers...</span>
                  </div>
                ) : tracking && tracking.checkpoints && tracking.checkpoints.length > 0 ? (
                  <div className="space-y-4">
                    {/* Est delivery date badge if not delivered */}
                    {tracking.status !== "Delivered" && tracking.estimatedDelivery && (
                      <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-lg text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                        <span>📅</span>
                        <span>Estimated Arrival: <strong>{new Intl.DateTimeFormat("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        }).format(new Date(tracking.estimatedDelivery))}</strong></span>
                      </div>
                    )}

                    {/* Timeline List */}
                    <div className="relative border-l border-border-accent/60 pl-4 space-y-4.5 ml-1.5 py-1">
                      {tracking.checkpoints.map((cp: any, idx: number) => {
                        const isLatest = idx === 0;
                        return (
                          <div key={idx} className="relative">
                            {/* Circle dot marker */}
                            <div className={`absolute -left-[21.5px] top-1.5 w-3 h-3 rounded-full border bg-bg-primary transition-all ${
                              isLatest 
                                ? "border-indigo-600 ring-4 ring-indigo-500/10 bg-indigo-600 scale-110" 
                                : "border-fg-secondary/30 bg-bg-secondary"
                            }`} />
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <span className={`font-bold block text-[13px] ${isLatest ? "text-indigo-600 dark:text-indigo-400" : "text-fg-primary"}`}>
                                  {cp.description}
                                </span>
                                <span className="text-[10px] text-fg-secondary/60 mt-0.5 block font-medium">
                                  📍 {cp.location}
                                </span>
                              </div>
                              <span className="text-[10px] text-fg-secondary/60 font-semibold whitespace-nowrap mt-0.5">
                                {new Intl.DateTimeFormat("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false
                                }).format(new Date(cp.timestamp))}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {tracking.trackingUrl && (
                      <a
                        href={tracking.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center block bg-fg-primary text-bg-primary py-3 rounded-xl text-xs font-bold hover:opacity-90 active:scale-[0.99] transition-all"
                      >
                        Track on DHL Express Portal ↗
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-fg-secondary/60">
                    <p className="font-semibold text-xs">No active checkpoints found.</p>
                    <p className="text-[10px] mt-0.5">Transit scan details will update shortly.</p>
                  </div>
                )}
              </div>
            )}

            {/* Est Date Alert */}
            {order.status !== 'Delivered' && order.status !== 'Cancelled' && order.status !== 'Canceled' && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-500 p-4 rounded-xl text-xs font-semibold flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Estimated Delivery: <strong className="underline">{formattedEstDate}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* ── 2. Admin & Warehouse Message Updates ─────────────────────────── */}
        {order.adminMessage && (
          <div className="w-full bg-bg-secondary border border-border-accent/40 rounded-xl overflow-hidden transition-theme">
            <div className="w-full border-b border-border-accent/40 py-4 flex items-center justify-center">
              <h2 className="font-dm-sans text-xs font-bold text-fg-primary uppercase tracking-widest text-center">
                Message from Warehouse
              </h2>
            </div>
            <div className="p-6">
              <div className="bg-bg-primary p-4 rounded-xl border border-border-accent/30 text-xs">
                <p className="text-fg-primary leading-relaxed font-semibold">{order.adminMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── 3. Chronological Log History ─────────────────────────────────── */}
        {order.statusTimeline && order.statusTimeline.length > 0 && (
          <div className="w-full bg-bg-secondary border border-border-accent/40 rounded-xl overflow-hidden transition-theme">
            <div className="w-full border-b border-border-accent/40 py-4 flex items-center justify-center">
              <h2 className="font-dm-sans text-xs font-bold text-fg-primary uppercase tracking-widest text-center">
                Log History
              </h2>
            </div>
            <div className="p-6">
              <div className="relative border-l border-border-accent pl-4 space-y-5 ml-2.5">
                {order.statusTimeline.slice().reverse().map((t, idx) => (
                  <div key={idx} className="relative">
                    <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border bg-bg-primary ${
                      t.status === 'Cancelled' || t.status === 'Canceled'
                        ? 'border-red-500'
                        : t.status === 'Delivered'
                          ? 'border-green-600'
                          : 'border-fg-primary'
                    }`} />
                    <div className="flex justify-between items-start gap-4 text-xs">
                      <div>
                        <span className="font-bold text-fg-primary block text-sm">{t.status}</span>
                        {t.comment && <p className="text-fg-secondary mt-1 leading-relaxed font-medium">{t.comment}</p>}
                      </div>
                      <span className="text-[10px] text-fg-secondary/60 font-semibold whitespace-nowrap">
                        {formatTimelineDate(t.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── 4. Order Items Summary ────────────────────────────────────────── */}
        <div className="w-full bg-bg-secondary border border-border-accent/40 rounded-xl overflow-hidden transition-theme">
          <div className="w-full border-b border-border-accent/40 py-4 flex items-center justify-center">
            <h2 className="font-dm-sans text-xs font-bold text-fg-primary uppercase tracking-widest text-center">
              Items Summary
            </h2>
          </div>
          <div className="p-6 flex flex-col gap-4">
            {order.items.map((item, index) => (
              <Link 
                key={index} 
                href={`/shop/${item.slug}`}
                className={`flex gap-4 group/item hover:opacity-90 transition-opacity ${index > 0 ? 'pt-4 border-t border-border-accent/30' : ''}`}
              >
                <div className="w-16 h-16 bg-bg-primary rounded-lg overflow-hidden flex-shrink-0 relative border border-border-accent/30">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300" />
                </div>
                <div className="flex-1 flex justify-between items-start text-xs">
                  <div>
                    <h4 className="font-semibold text-fg-primary group-hover/item:underline decoration-fg-primary transition-all">{item.name}</h4>
                    <div className="flex gap-2 text-[9px] text-fg-secondary/80 mt-1 uppercase font-medium">
                      <span>{item.material}</span>
                      <span>•</span>
                      <span>{item.dimension}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-fg-primary">{formatPrice(item.price)}</p>
                    <p className="text-[10px] text-fg-secondary/70 mt-0.5">Qty: {item.quantity}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── 5. Delivery Location (Shipping Address) ───────────────────────── */}
        {order.shippingAddress && (
          <div className="w-full bg-bg-secondary border border-border-accent/40 rounded-xl overflow-hidden transition-theme">
            <div className="w-full border-b border-border-accent/40 py-4 flex items-center justify-center">
              <h2 className="font-dm-sans text-xs font-bold text-fg-primary uppercase tracking-widest text-center">
                Delivery Location
              </h2>
            </div>
            <div className="p-6">
              <div className="text-xs space-y-1 bg-bg-primary p-4 rounded-xl border border-border-accent/30 leading-relaxed font-semibold">
                <span className="font-bold text-fg-primary block">{order.shippingAddress.name}</span>
                <p className="text-fg-secondary">{order.shippingAddress.addressLine}</p>
                {order.shippingAddress.phone && <p className="text-fg-secondary/70 mt-1 font-semibold">📞 {order.shippingAddress.phone}</p>}
              </div>
            </div>
          </div>
        )}

        {/* ── 6. Bottom Navigation Shortcuts ───────────────────────────────── */}
        <div className="w-full bg-bg-secondary border border-border-accent/40 p-6 rounded-xl transition-theme flex flex-col sm:flex-row gap-3">
          <Link
            href="/shop"
            className="flex-1 border border-border-accent text-fg-primary bg-bg-primary py-3.5 rounded-xl text-xs font-bold hover:bg-bg-secondary transition-colors text-center block"
          >
            Continue Shopping
          </Link>
          <Link
            href="/faq"
            className="flex-1 text-fg-secondary py-3.5 rounded-xl text-[11px] font-semibold hover:text-fg-primary transition-colors text-center block"
          >
            Need Help? Visit FAQs
          </Link>
        </div>

        {/* Bottom spacing */}
        <div className="pb-8" />
        </div>
      </div>

    </div>
  );
}
