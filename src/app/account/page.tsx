'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser, SavedAddress } from '@/context/UserContext';
import Link from 'next/link';

interface Order {
  id: string;
  orderNumber: string;
  items: Array<{
    slug: string;
    name: string;
    material: string;
    dimension: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  total: number;
  status: string;
  createdAt: string;
}

export default function AccountPage() {
  const { user, loading, updateProfile, addAddress, deleteAddress, setAuthModalOpen } = useUser();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('profile');
  
  // Profile state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Address manager state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newName, setNewName] = useState('');
  const [newAddressLine, setNewAddressLine] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [addressMessage, setAddressMessage] = useState('');
  const [addressError, setAddressError] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);

  const rightColumnRef = useRef<HTMLDivElement>(null);

  // Sync state with user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

  // Read search parameters for initial active tab selection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'orders' || tabParam === 'addresses' || tabParam === 'profile') {
        setActiveTab(tabParam as any);
      }
    }
  }, []);

  // Load orders when Tab is switched to Orders or on update event
  const fetchOrders = async () => {
    if (!user) return;
    setOrdersLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders || []);
        }
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, user]);

  useEffect(() => {
    const handleOrdersUpdated = () => {
      fetchOrders();
    };
    window.addEventListener('orders-updated', handleOrdersUpdated);
    return () => {
      window.removeEventListener('orders-updated', handleOrdersUpdated);
    };
  }, [user]);

  // Scroll priority matching contact page
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

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage('');
    setProfileError('');
    setSavingProfile(true);

    const res = await updateProfile({ name, phone, address });
    setSavingProfile(false);

    if (res.success) {
      setProfileMessage('Primary profile updated successfully!');
      setTimeout(() => setProfileMessage(''), 4000);
    } else {
      setProfileError(res.error || 'Failed to update profile');
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressMessage('');
    setAddressError('');
    setSavingAddress(true);

    const res = await addAddress({
      label: newLabel,
      name: newName,
      addressLine: newAddressLine,
      phone: newPhone,
    });
    setSavingAddress(false);

    if (res.success) {
      setAddressMessage('New address saved successfully!');
      setNewLabel('');
      setNewName('');
      setNewAddressLine('');
      setNewPhone('');
      setShowAddAddress(false);
      setTimeout(() => setAddressMessage(''), 4000);
    } else {
      setAddressError(res.error || 'Failed to save address');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    setDeletingAddressId(id);
    setAddressMessage('');
    setAddressError('');

    const res = await deleteAddress(id);
    setDeletingAddressId(null);

    if (res.success) {
      setAddressMessage('Address deleted successfully!');
      setTimeout(() => setAddressMessage(''), 4000);
    } else {
      setAddressError(res.error || 'Failed to delete address');
    }
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-3 bg-bg-primary select-text transition-theme relative lg:h-screen">
      
      {/* Left Column: Premium Showroom Image */}
      <section className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pl-3 lg:pr-0 flex items-stretch h-[400px] md:h-[600px] lg:h-[calc(100vh-24px)] lg:max-h-[calc(100vh-24px)] flex-shrink-0 transition-theme">
        <div className="h-full rounded-xl overflow-hidden relative border border-border-accent/40 w-full group shadow-sm">
          <img
            src="/images/tTnxI9bEGHuPLga5HlUAYCJjneY_bc98a1.webp"
            alt="FM Account Studio"
            className="absolute inset-0 w-full h-full object-cover brightness-[0.92] contrast-[1.02]"
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>
      </section>

      {/* Right Column: Scrollable Content with Tabs */}
      <div 
        ref={rightColumnRef} 
        className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pr-3 lg:pl-0 flex flex-col gap-3 transition-theme lg:h-[calc(100vh-24px)] lg:max-h-[calc(100vh-24px)] lg:overflow-y-auto scrollbar-none"
      >
        <div className="bg-bg-secondary p-8 md:p-12 rounded-xl border border-border-accent/40 transition-theme flex-1 flex flex-col gap-8">
          
          {/* Header & Tabs */}
          <div className="space-y-6">
            <h1 className="font-dm-sans text-3xl md:text-[40px] font-medium tracking-tight text-fg-primary leading-[1.15]">
              Account Details
            </h1>
            
            {user && (
              <div className="flex border-b border-border-accent/40 gap-6 text-xs font-bold uppercase tracking-wider text-fg-secondary">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`pb-3 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'profile' ? 'border-fg-primary text-fg-primary' : 'border-transparent hover:text-fg-primary'
                  }`}
                >
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`pb-3 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'orders' ? 'border-fg-primary text-fg-primary' : 'border-transparent hover:text-fg-primary'
                  }`}
                >
                  Orders
                </button>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`pb-3 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'addresses' ? 'border-fg-primary text-fg-primary' : 'border-transparent hover:text-fg-primary'
                  }`}
                >
                  Saved Addresses
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center my-auto">
              <svg className="animate-spin h-8 w-8 text-fg-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-xs text-fg-secondary font-medium">Verifying account session...</p>
            </div>
          ) : !user ? (
            <div className="bg-bg-primary border border-border-accent/50 rounded-xl p-8 text-center space-y-4 my-auto shadow-sm max-w-sm mx-auto">
              <svg className="w-12 h-12 text-fg-secondary/40 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="font-bold text-sm text-fg-primary">Access Restricted</h3>
              <p className="text-xs text-fg-secondary leading-relaxed">Please sign in or create an account to view and update your details.</p>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="w-full bg-fg-primary text-bg-primary py-3 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Sign In / Sign Up
              </button>
            </div>
          ) : (
            <div className="w-full flex-grow flex flex-col justify-start">
              
              {/* TAB 1: PROFILE TAB */}
              {activeTab === 'profile' && (
                <div className="space-y-6 w-full animate-fade-in">
                  {profileMessage && (
                    <div className="bg-green-500/10 text-green-500 border border-green-500/20 px-5 py-4 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{profileMessage}</span>
                    </div>
                  )}

                  {profileError && (
                    <div className="bg-red-500/10 text-red-500 border border-red-500/20 px-5 py-4 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>{profileError}</span>
                    </div>
                  )}

                  <form onSubmit={handleProfileSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="name" className="text-[10px] font-bold uppercase tracking-wider text-fg-secondary">Full Name</label>
                        <input
                          id="name"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your name"
                          className="w-full bg-bg-primary text-fg-primary placeholder:text-fg-secondary/40 border border-border-accent/40 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-fg-primary transition-colors font-medium"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-wider text-fg-secondary">Email Address</label>
                        <input
                          id="email"
                          type="email"
                          disabled
                          value={user.email}
                          className="w-full bg-bg-primary/50 text-fg-secondary placeholder:text-fg-secondary/40 border border-border-accent/20 rounded-xl px-5 py-4 text-sm cursor-not-allowed font-medium opacity-85"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-wider text-fg-secondary">Phone Number</label>
                      <input
                        id="phone"
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+420 123 456 789"
                        className="w-full bg-bg-primary text-fg-primary placeholder:text-fg-secondary/40 border border-border-accent/40 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-fg-primary transition-colors font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="address" className="text-[10px] font-bold uppercase tracking-wider text-fg-secondary">Default Address</label>
                      <textarea
                        id="address"
                        rows={4}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Street name, suite, city, postal code, country"
                        className="w-full bg-bg-primary text-fg-primary placeholder:text-fg-secondary/40 border border-border-accent/40 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-fg-primary transition-colors resize-none font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="w-full bg-fg-primary text-bg-primary py-4 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {savingProfile ? 'Saving profile...' : 'Save Changes'}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: ORDERS TAB */}
              {activeTab === 'orders' && (
                <div className="space-y-6 w-full animate-fade-in">
                  {ordersLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                      <svg className="animate-spin h-6 w-6 text-fg-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3.5" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <p className="text-[11px] text-fg-secondary font-medium">Fetching your order history...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12 border border-border-accent/30 rounded-xl bg-bg-primary/50 flex flex-col items-center gap-3 max-w-sm mx-auto shadow-sm">
                      <svg className="w-10 h-10 text-fg-secondary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <h4 className="font-bold text-xs text-fg-primary">No Orders Found</h4>
                      <p className="text-[11px] text-fg-secondary leading-relaxed px-4">You haven't placed any orders yet. Discover our catalog of furniture.</p>
                      <Link
                        href="/shop"
                        className="bg-fg-primary text-bg-primary px-5 py-2 rounded-lg text-[11px] font-semibold hover:opacity-90 transition-opacity mt-2"
                      >
                        Explore shop
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border border-border-accent/40 rounded-xl bg-bg-primary overflow-hidden shadow-sm flex flex-col">
                          
                          {/* Order Header */}
                          <div className="px-5 py-4 bg-bg-secondary/70 border-b border-border-accent/40 flex flex-wrap justify-between items-center gap-3 text-xs">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-fg-primary">{order.orderNumber}</span>
                              <span className="text-fg-secondary/80 font-normal">
                                {new Date(order.createdAt).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-fg-primary">${order.total}</span>
                              <span className="px-2 py-0.5 rounded-full text-[9px] uppercase font-bold bg-green-500/10 text-green-500">
                                {order.status}
                              </span>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="p-5 divide-y divide-border-accent/30 space-y-4">
                            {order.items.map((item, index) => (
                              <div key={index} className={`flex gap-4 ${index > 0 ? 'pt-4' : ''}`}>
                                <div className="w-14 h-14 bg-bg-secondary rounded-lg overflow-hidden flex-shrink-0 relative border border-border-accent/30">
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 flex justify-between items-start text-xs">
                                  <div>
                                    <h4 className="font-semibold text-fg-primary">{item.name}</h4>
                                    <div className="flex gap-2 text-[9px] text-fg-secondary/80 mt-1 uppercase font-medium">
                                      <span>{item.material}</span>
                                      <span>•</span>
                                      <span>{item.dimension}</span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-fg-primary">${item.price}</p>
                                    <p className="text-[10px] text-fg-secondary/70 mt-0.5">Qty: {item.quantity}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SAVED ADDRESSES TAB */}
              {activeTab === 'addresses' && (
                <div className="space-y-6 w-full animate-fade-in">
                  
                  {/* Notifications */}
                  {addressMessage && (
                    <div className="bg-green-500/10 text-green-500 border border-green-500/20 px-5 py-4 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{addressMessage}</span>
                    </div>
                  )}

                  {addressError && (
                    <div className="bg-red-500/10 text-red-500 border border-red-500/20 px-5 py-4 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>{addressError}</span>
                    </div>
                  )}

                  {/* Add New Address Accordion */}
                  <div className="w-full">
                    {!showAddAddress ? (
                      <button
                        onClick={() => setShowAddAddress(true)}
                        className="inline-flex items-center gap-1.5 border border-border-accent text-fg-primary bg-bg-primary px-4 py-3 rounded-xl text-xs font-semibold hover:bg-bg-secondary transition-colors cursor-pointer"
                      >
                        <span>+ Add New Address</span>
                      </button>
                    ) : (
                      <div className="border border-border-accent/40 bg-bg-primary rounded-xl p-5 md:p-6 space-y-4 animate-fade-in shadow-sm">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-fg-primary">New Delivery Location</h3>
                          <button
                            onClick={() => {
                              setShowAddAddress(false);
                              setAddressError('');
                            }}
                            className="text-[10px] font-bold text-fg-secondary hover:text-fg-primary underline cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>

                        <form onSubmit={handleAddressSubmit} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label htmlFor="addr-label" className="text-[9px] font-bold uppercase tracking-wider text-fg-secondary">Address Label</label>
                              <input
                                id="addr-label"
                                type="text"
                                required
                                value={newLabel}
                                onChange={(e) => setNewLabel(e.target.value)}
                                placeholder="e.g. Home, Office"
                                className="w-full bg-bg-secondary text-fg-primary placeholder:text-fg-secondary/40 border border-border-accent/40 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-fg-primary transition-colors font-medium"
                              />
                            </div>
                            <div className="space-y-1">
                              <label htmlFor="addr-name" className="text-[9px] font-bold uppercase tracking-wider text-fg-secondary">Recipient Name</label>
                              <input
                                id="addr-name"
                                type="text"
                                required
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full bg-bg-secondary text-fg-primary placeholder:text-fg-secondary/40 border border-border-accent/40 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-fg-primary transition-colors font-medium"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1 sm:col-span-2">
                              <label htmlFor="addr-line" className="text-[9px] font-bold uppercase tracking-wider text-fg-secondary">Address Details</label>
                              <input
                                id="addr-line"
                                type="text"
                                required
                                value={newAddressLine}
                                onChange={(e) => setNewAddressLine(e.target.value)}
                                placeholder="Street name, suite, city, state, country"
                                className="w-full bg-bg-secondary text-fg-primary placeholder:text-fg-secondary/40 border border-border-accent/40 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-fg-primary transition-colors font-medium"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label htmlFor="addr-phone" className="text-[9px] font-bold uppercase tracking-wider text-fg-secondary">Contact Phone</label>
                            <input
                              id="addr-phone"
                              type="text"
                              value={newPhone}
                              onChange={(e) => setNewPhone(e.target.value)}
                              placeholder="+420 123 456 789"
                              className="w-full bg-bg-secondary text-fg-primary placeholder:text-fg-secondary/40 border border-border-accent/40 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-fg-primary transition-colors font-medium"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={savingAddress}
                            className="w-full bg-fg-primary text-bg-primary py-3 rounded-xl font-semibold text-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                          >
                            {savingAddress ? 'Saving location...' : 'Save Location'}
                          </button>
                        </form>
                      </div>
                    )}
                  </div>

                  {/* Saved Address Cards Grid */}
                  {!user.savedAddresses || user.savedAddresses.length === 0 ? (
                    <div className="text-center py-6 text-xs text-fg-secondary">
                      No other saved addresses. Click above to add alternate delivery locations.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {user.savedAddresses.map((addr) => (
                        <div key={addr.id} className="border border-border-accent/40 bg-bg-primary rounded-xl p-5 shadow-sm flex flex-col justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="px-2.5 py-1 rounded-lg text-[9px] uppercase tracking-wider font-bold bg-fg-primary/5 text-fg-primary border border-border-accent/30">
                                {addr.label}
                              </span>
                              <button
                                onClick={() => handleDeleteAddress(addr.id)}
                                disabled={deletingAddressId === addr.id}
                                className="text-[10px] font-bold text-red-500 hover:text-red-600 underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {deletingAddressId === addr.id ? 'Deleting...' : 'Delete'}
                              </button>
                            </div>
                            <div className="space-y-1 text-xs">
                              <p className="font-bold text-fg-primary">{addr.name}</p>
                              <p className="text-fg-secondary leading-relaxed font-normal">{addr.addressLine}</p>
                              {addr.phone && <p className="text-fg-secondary/80 font-normal text-[11px] mt-1">📞 {addr.phone}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}

            </div>
          )}
        </div>
      </div>

    </div>
  );
}
