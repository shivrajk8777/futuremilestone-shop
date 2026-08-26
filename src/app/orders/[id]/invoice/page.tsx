'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { formatOrderPrice } from '@/lib/formatOrderPrice';

interface OrderItem {
  slug: string;
  name: string;
  material: string;
  dimension: string;
  quantity: number;
  price: number | string;
  image: string;
}

interface Order {
  id: string;
  orderNumber: string;
  currency?: string;
  currencySymbol?: string;
  items: OrderItem[];
  total: number | string;
  status: string;
  paymentMethod?: string;
  transactionId?: string | null;
  createdAt: string;
  trackingId?: string | null;
  deliveryPartnerName?: string | null;
  adminMessage?: string | null;
  shippingAddress?: {
    name: string;
    addressLine: string;
    phone?: string;
  } | null;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderInvoicePage({ params }: PageProps) {
  const { id } = use(params);
  const { user, loading: userLoading } = useUser();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      setError('You must be logged in to view your bill.');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok) {
          setError('Order not found or access denied.');
          return;
        }
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
        } else {
          setError(data.error || 'Failed to fetch order invoice.');
        }
      } catch (err) {
        console.error(err);
        setError('Error retrieving order invoice.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, user, userLoading]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (loading || userLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-white p-6 text-center text-gray-600">
        <div className="space-y-3">
          <svg className="animate-spin h-7 w-7 text-black mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-xs font-semibold">Generating tax invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen grid place-items-center bg-white p-6 text-center text-gray-800">
        <div className="max-w-md bg-gray-50 border border-gray-200 p-8 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold text-red-600">Invoice Unavailable</h2>
          <p className="text-xs text-gray-600 leading-relaxed">{error || 'Order details could not be retrieved.'}</p>
          <Link href="/account?tab=orders" className="inline-block px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:opacity-90">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const isDispatched = ['Dispatched', 'Shipped', 'Delivered'].includes(order.status);

  if (!isDispatched) {
    return (
      <div className="min-h-screen grid place-items-center bg-white p-6 text-center text-gray-800">
        <div className="max-w-md bg-gray-50 border border-gray-200 p-8 rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 grid place-items-center mx-auto text-xl font-bold">
            ⏳
          </div>
          <h2 className="text-lg font-bold text-gray-900">Bill Not Available Yet</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Your official invoice bill for order <strong>{order.orderNumber}</strong> will become available to download once your order has been dispatched.
          </p>
          <div className="flex gap-2 justify-center pt-2">
            <Link href={`/orders/${order.id}`} className="px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:opacity-90">
              Track Order Status
            </Link>
            <Link href="/account?tab=orders" className="px-5 py-2.5 border border-gray-300 text-gray-800 text-xs font-semibold rounded-xl hover:bg-gray-100">
              My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const invoiceNumber = `INV-${order.orderNumber.replace('#', '')}`;
  const formattedOrderDate = new Date(order.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-white text-black p-6 md:p-10 font-sans select-text relative">
      {/* Top bar controls (hidden when printing) */}
      <div className="max-w-[850px] mx-auto flex items-center justify-between border-b border-gray-200 pb-4 mb-6 no-print">
        <Link
          href={`/orders/${order.id}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 hover:border-black text-xs font-bold rounded-xl transition-all"
        >
          ← Back to Order Tracking
        </Link>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2 bg-black text-white rounded-xl text-xs font-bold hover:opacity-85 transition-opacity shadow-sm cursor-pointer"
        >
          <span>🖨️</span>
          <span>Print / Download Bill (PDF)</span>
        </button>
      </div>

      {/* Invoice Printable Sheet */}
      <div className="max-w-[850px] mx-auto bg-white border border-gray-200 p-8 md:p-12 shadow-sm rounded-2xl print:border-none print:shadow-none print:p-0">

        {/* Invoice Brand Header */}
        <div className="flex justify-between items-start gap-6 border-b-2 border-black pb-6 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight uppercase leading-none">FUTURE MILESTONE</h1>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mt-1.5">Official Tax Invoice & Bill</span>
            <p className="text-[11px] text-gray-500 mt-3 leading-relaxed">
              108 Studio Lane, Industrial Area,<br />
              Mumbai, MH, 400013<br />
              support@futuremilestone.shop
            </p>
          </div>

          <div className="text-right">
            <span className="px-3 py-1 bg-green-500/10 text-green-700 text-[10px] uppercase font-black tracking-wider rounded-md border border-green-500/20 inline-block mb-2">
              DISPATCHED & PAID
            </span>
            <h2 className="text-base font-bold text-gray-900 font-mono">{invoiceNumber}</h2>
            <div className="text-[11.5px] text-gray-600 mt-1 space-y-0.5">
              <p><strong>Order Ref:</strong> {order.orderNumber}</p>
              <p><strong>Date:</strong> {formattedOrderDate}</p>
              <p><strong>Payment:</strong> {order.paymentMethod || 'Online'}</p>
            </div>
          </div>
        </div>

        {/* Customer & Delivery Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border-b border-gray-200 pb-6">
          <div>
            <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Billed & Delivered To</h3>
            {order.shippingAddress ? (
              <div className="text-[12.5px] leading-relaxed">
                <p className="font-bold text-gray-900">{order.shippingAddress.name}</p>
                <p className="text-gray-700 mt-0.5">{order.shippingAddress.addressLine}</p>
                {order.shippingAddress.phone && (
                  <p className="text-gray-600 mt-1 font-semibold">📞 {order.shippingAddress.phone}</p>
                )}
              </div>
            ) : (
              <p className="text-[12.5px] text-gray-500 italic">No delivery address recorded.</p>
            )}
          </div>

          <div>
            <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Shipment Details</h3>
            <div className="text-[12.5px] space-y-1">
              <p><strong>Courier Partner:</strong> {order.deliveryPartnerName || 'Standard Express Shipping'}</p>
              {order.trackingId ? (
                <p><strong>Tracking Ref:</strong> <span className="font-mono font-bold bg-gray-100 px-1.5 py-0.5 rounded text-indigo-700">{order.trackingId}</span></p>
              ) : (
                <p className="text-gray-500 italic">Tracking details attached to account</p>
              )}
              {order.transactionId && (
                <p className="text-[11px] text-gray-500 mt-1"><strong>Txn ID:</strong> <span className="font-mono">{order.transactionId}</span></p>
              )}
            </div>
          </div>
        </div>

        {/* Purchased Items Table */}
        <div className="mb-8">
          <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-3">Purchased Items</h3>
          <table className="w-full border-collapse text-left text-[12.5px]">
            <thead>
              <tr className="border-b-2 border-gray-200 text-gray-700 font-bold uppercase text-[10.5px]">
                <th className="py-2.5">Item Name</th>
                <th className="py-2.5">Variant</th>
                <th className="py-2.5 text-right">Price</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items.map((item, idx) => {
                const itemPrice = Number(item.price) || 0;
                const itemQty = Number(item.quantity) || 1;
                const itemTotal = itemPrice * itemQty;

                return (
                  <tr key={idx} className="align-top">
                    <td className="py-3 font-bold text-gray-900">{item.name}</td>
                    <td className="py-3 text-gray-500 text-[11.5px] capitalize">
                      {[item.material, item.dimension].filter(Boolean).join(' • ')}
                    </td>
                    <td className="py-3 text-right text-gray-700">{formatOrderPrice(itemPrice, order.currencySymbol, order.currency)}</td>
                    <td className="py-3 text-center font-bold text-gray-900">{itemQty}</td>
                    <td className="py-3 text-right font-bold text-gray-900">
                      {formatOrderPrice(itemTotal, order.currencySymbol, order.currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Invoice Summary Breakdown */}
        <div className="flex justify-end pt-4 border-t-2 border-black">
          <div className="w-full sm:w-[300px] space-y-2 text-[13px]">
            <div className="flex justify-between font-extrabold text-base text-gray-900 pt-1">
              <span>Total Amount Paid</span>
              <span>{formatOrderPrice(order.total, order.currencySymbol, order.currency)}</span>
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="border-t border-gray-200 mt-12 pt-6 text-center text-[10.5px] text-gray-400 space-y-1">
          <p className="font-bold text-gray-600">Thank you for shopping with Futuremilestone.</p>
          <p>This is a computer-generated tax invoice. No signature is required.</p>
        </div>

      </div>

      {/* Print CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background-color: white !important;
            color: black !important;
            padding: 0 !important;
          }
        }
      `}} />
    </div>
  );
}
