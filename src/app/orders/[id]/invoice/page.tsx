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
  image?: string;
  imageUrl?: string;
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

  const isDispatched = ['Dispatched', 'Shipped', 'Out for Delivery', 'Delivered'].includes(order.status);

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

            <p className="text-[11px] text-gray-500 mt-3 leading-relaxed">
              A-50, Kanaram Nagar, Sikar Road, Jaipur Rajasthan India 302039<br />
              Email: info@futuremilestone.shop | Phone: +91-7073803090<br />
              Website : www.futuremilestone.shop
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
                  <p className="text-gray-600 mt-1 font-semibold"> {order.shippingAddress.phone}</p>
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
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image || item.imageUrl || "/images/menu-icon-dark.svg"}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-50 border border-gray-200 flex-shrink-0"
                        />
                        <div>
                          <p className="font-bold text-gray-900 leading-tight">{item.name}</p>
                          {item.slug && <span className="text-[10px] text-gray-400 font-mono block mt-0.5">{item.slug}</span>}
                        </div>
                      </div>
                    </td>
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

        {/* Brand Stamp / Logo Block */}
        <div className="pt-6 mt-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <svg width="44" height="35" viewBox="0 0 287 229" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 text-black">
              <path d="M87.8077 65.3935C115.406 66.2883 135.246 83.8697 142.855 92.6595C166.484 66.0782 199.642 63.2085 213.267 65.0964C269.597 72.4865 285.917 121.565 285.917 145.553V226.159C285.917 227.169 284.663 227.351 283.653 227.351H248.771C246.699 227.5 246.534 224.513 246.534 222.433V151.066C247.369 119.599 224.704 107.361 213.267 105.176C182.728 99.5964 166.239 122.082 163.198 140.605C162.064 147.509 162.994 154.579 162.994 161.575V223.687C162.994 224.738 162.916 226.247 162.152 226.968C161.448 227.634 160.716 227.5 159.747 227.5H125.102C123.431 227.5 123.312 225.984 123.312 225.116V151.811C124.625 118.079 100.935 107.832 89.8962 105.299C88.106 105.001 87.8077 104.256 87.8077 103.835V65.3935Z" fill="currentColor" />
              <path d="M0.5 74.8408C4.62763 22.5872 51.7228 0.168822 79.9038 0.503694C80.5642 0.511541 81.1784 0.785788 81.6454 1.25284C82.1351 1.74262 82.4089 2.40766 82.4061 3.10025L82.2635 38.4762C82.2621 38.8287 82.1214 39.1663 81.8722 39.4156C81.6422 39.6457 81.3275 39.7839 81.003 39.807C51.2199 41.9285 42.7099 63.4225 40.3363 76.0347C52.7754 67.4304 72.0744 64.9226 80.836 64.706C81.2644 64.6954 81.6638 64.9014 81.9128 65.2501C82.1395 65.5675 82.2613 65.9477 82.2613 66.3377V102.063C82.2613 102.696 82.0316 103.307 81.6149 103.784C81.3602 104.075 80.9887 104.252 80.6028 104.28C46.9871 106.723 39.344 134.365 39.7395 147.962V225.158C39.7395 225.971 39.3427 226.733 38.6766 227.2C38.3973 227.395 38.0646 227.5 37.7236 227.5H2.85894C2.29466 227.5 1.74405 227.326 1.28181 227.003C0.791816 226.66 0.5 226.099 0.5 225.501V74.8408Z" fill="currentColor" />
            </svg>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="border-t border-gray-200 mt-6 pt-4 text-center text-[10.5px] text-gray-400 space-y-1">
          <p className="font-bold text-gray-600">Thank you for shopping with Future Milestone.</p>
          <p>This is a computer-generated invoice. No signature is required.</p>
        </div>

      </div>

      {/* Print CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
          .no-print {
            display: none !important;
          }
          html, body {
            background-color: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          .min-h-screen {
            min-height: auto !important;
            background: white !important;
            padding: 0 !important;
          }
        }
      `}} />
    </div>
  );
}
