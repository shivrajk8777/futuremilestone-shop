'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function SuccessDetails() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber') || '#FJ-XXXXX';
  const total = searchParams.get('total') || '0';
  const name = searchParams.get('name') || '';
  const address = searchParams.get('address') || '';

  // Calculate mock delivery date (5 days from today)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);

  const formattedDate = deliveryDate.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="w-full max-w-md bg-bg-secondary p-8 md:p-12 border border-border-accent/40 rounded-xl shadow-lg text-center space-y-6">
      
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
        <p className="text-xs text-fg-secondary">
          Thank you for your purchase. We are preparing your Scandinavian furniture pieces!
        </p>
      </div>

      {/* Details Box */}
      <div className="bg-bg-primary p-5 rounded-xl border border-border-accent/30 text-left space-y-3.5 text-xs">
        <div className="flex justify-between border-b border-border-accent/20 pb-2">
          <span className="text-fg-secondary">Order Number</span>
          <span className="font-bold text-fg-primary">{orderNumber}</span>
        </div>
        
        <div className="flex justify-between border-b border-border-accent/20 pb-2">
          <span className="text-fg-secondary">Total Amount</span>
          <span className="font-bold text-fg-primary">${total}</span>
        </div>

        <div className="space-y-1">
          <span className="text-fg-secondary block">Ship To</span>
          <span className="font-bold text-fg-primary block">{name}</span>
          <span className="text-fg-secondary/80 font-normal block leading-relaxed">{address}</span>
        </div>

        <div className="space-y-1 pt-2 border-t border-border-accent/20">
          <span className="text-fg-secondary block">Estimated Delivery</span>
          <span className="font-bold text-fg-primary block text-[#2f5a4f]">{formattedDate}</span>
        </div>
      </div>

      {/* Redirect Buttons */}
      <div className="flex flex-col gap-2 pt-2">
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
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="w-full min-h-[75vh] flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-2">
          <svg className="animate-spin h-6 w-6 text-fg-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs text-fg-secondary">Loading details...</span>
        </div>
      }>
        <SuccessDetails />
      </Suspense>
    </div>
  );
}
