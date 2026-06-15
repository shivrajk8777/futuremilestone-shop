'use client';

import { useState, useEffect, use, useRef } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { products, Product } from '@/data/products';
import { useUser } from '@/context/UserContext';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Sale badge per slug — matches reference design
const saleBadges: Record<string, string> = {
  sage: '50% OFF',
  skala: '50% OFF',
};

function ProductDetailSkeleton() {
  return (
    <div className="w-full bg-bg-primary transition-theme pb-16 min-h-screen">
      {/* Split Hero Section */}
      <div className="w-full flex flex-col lg:flex-row gap-3 relative lg:h-screen -mt-24">
        {/* Left Column: Image placeholder */}
        <section className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pl-3 lg:pr-0 flex items-stretch h-[500px] md:h-[600px] lg:h-full flex-shrink-0">
          <div className="h-full rounded-xl w-full border border-border-accent/40 animate-wave" />
        </section>
 
        {/* Right Column: Details card skeleton */}
        <div className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pr-3 lg:pl-0 flex flex-col gap-3 lg:h-full justify-center">
          <div className="w-full bg-[#0e1011] rounded-xl p-8 md:p-12 lg:pt-28 lg:pb-12 lg:px-12 border border-white/5 space-y-6 flex-shrink-0 flex flex-col animate-pulse">
            {/* Sale Badge & Price */}
            <div className="space-y-3">
              <div className="h-4 w-16 bg-white/10 rounded-md" />
              <div className="h-8 w-28 bg-white/10 rounded-md" />
            </div>
 
            {/* Title & Tagline */}
            <div className="space-y-3">
              <div className="h-10 w-3/4 bg-white/10 rounded-md" />
              <div className="h-5 w-1/2 bg-white/10 rounded-md" />
            </div>
 
            {/* Material selector divider */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="h-3 w-12 bg-white/10 rounded-md" />
              <div className="flex gap-2">
                <div className="h-9 w-16 bg-white/10 rounded-xl" />
                <div className="h-9 w-16 bg-white/10 rounded-xl" />
              </div>
            </div>
 
            {/* Dimension selector divider */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="h-3 w-16 bg-white/10 rounded-md" />
              <div className="flex gap-2">
                <div className="h-9 w-24 bg-white/10 rounded-xl" />
                <div className="h-9 w-24 bg-white/10 rounded-xl" />
              </div>
            </div>
 
            {/* Quantity / Cart divider */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="h-3 w-16 bg-white/10 rounded-md" />
              <div className="flex gap-3">
                <div className="h-12 w-32 bg-white/10 rounded-xl" />
                <div className="h-12 flex-grow bg-white/10 rounded-xl" />
              </div>
            </div>
          </div>
 
          {/* Marquee slider placeholder */}
          <div className="h-10 w-full rounded-xl border border-border-accent/40 animate-wave" />
 
          {/* Accordion list placeholder */}
          <div className="w-full bg-[#0e1011] rounded-xl p-8 border border-white/5 space-y-4 animate-pulse">
            <div className="h-6 w-full bg-white/10 rounded-md" />
            <div className="h-px bg-white/10" />
            <div className="h-6 w-full bg-white/10 rounded-md" />
            <div className="h-px bg-white/10" />
            <div className="h-6 w-full bg-white/10 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetails({ params }: PageProps) {
  const { slug } = use(params);
  const { user } = useUser();

  // Find static product fallback
  const staticProduct = products.find((p) => p.slug === slug);

  // States
  const [dbProduct, setDbProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(!staticProduct);
  const [notFoundState, setNotFoundState] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('Oak');
  const [addedNotification, setAddedNotification] = useState(false);

  // Accordion states - multiple can be open at once
  const [isDescOpen, setIsDescOpen] = useState(true);
  const [isDimensionsOpen, setIsDimensionsOpen] = useState(false);
  const [isShippingOpen, setIsShippingOpen] = useState(false);

  // Active thumbnail observation index
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [selectedDimension, setSelectedDimension] = useState<{ id: string; label: string; price: number; originalPrice?: number } | null>(null);

  // Fetch dynamic product from MongoDB
  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.product) {
            setDbProduct(data.product);
            if (data.product.dimensionsList && data.product.dimensionsList.length > 0) {
              setSelectedDimension(data.product.dimensionsList[0]);
            }
            if (data.product.materialsList && data.product.materialsList.length > 0) {
              setSelectedMaterial(data.product.materialsList[0].name);
            }
            setLoading(false);
          } else {
            if (!staticProduct) {
              setNotFoundState(true);
            }
            setLoading(false);
          }
        } else {
          if (!staticProduct) {
            setNotFoundState(true);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load dynamic product:', err);
        if (!staticProduct) {
          setNotFoundState(true);
        }
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug, staticProduct]);

  interface DimensionItem {
    id: string;
    label: string;
    price: number;
    originalPrice?: number;
  }

  // Active product definition combining database or static fallback details
  const activeProduct = {
    slug: slug,
    name: dbProduct?.name || staticProduct?.name || 'Loading Product...',
    price: dbProduct?.price || staticProduct?.price || 0,
    originalPrice: dbProduct?.originalPrice || staticProduct?.price || 0,
    discountBadge: dbProduct?.discountBadge || '',
    category: (dbProduct?.category || staticProduct?.category || 'wood') as 'wood' | 'dark' | 'modern',
    tagline: dbProduct?.tagline || staticProduct?.tagline || '',
    description: dbProduct?.description || staticProduct?.description || '',
    features: (dbProduct?.features || staticProduct?.features || []) as string[],
    dimensions: dbProduct?.dimensions || staticProduct?.dimensions || '',
    shippingReturns: dbProduct?.shippingReturns || staticProduct?.shippingReturns || 'Free shipping on orders over $500. Standard delivery takes 3-7 business days. Easy returns within 30 days of delivery.',
    images: (dbProduct?.images?.length ? dbProduct.images : (staticProduct?.images || ['/images/placeholder.png'])) as string[],
  };

  // Default dimensions fallback for static products
  const defaultDimensions: DimensionItem[] = [
    { id: '1', label: 'Standard', price: activeProduct.price, originalPrice: activeProduct.price },
    { id: '2', label: 'Large', price: activeProduct.price + 150, originalPrice: activeProduct.price + 150 },
  ];

  const dimensionsList: DimensionItem[] = dbProduct?.dimensionsList && dbProduct.dimensionsList.length > 0
    ? dbProduct.dimensionsList.map((d: any) => ({
        id: String(d.id),
        label: String(d.label),
        price: Number(d.price) || 0,
        originalPrice: Number(d.originalPrice) || Number(d.price) || 0,
      }))
    : defaultDimensions;

  const materialsList: string[] = dbProduct?.materialsList && dbProduct.materialsList.length > 0
    ? dbProduct.materialsList.map((m: any) => String(m.name))
    : ['Oak', 'Teak'];

  // Initialize selectedDimension if needed
  useEffect(() => {
    if (dimensionsList.length > 0 && (!selectedDimension || !dimensionsList.some((d: DimensionItem) => d.id === selectedDimension.id))) {
      setSelectedDimension(dimensionsList[0]);
    }
  }, [dimensionsList, selectedDimension]);

  // Compute active price
  const currentPrice = selectedDimension ? selectedDimension.price : activeProduct.price;
  const currentOriginalPrice = selectedDimension ? (selectedDimension.originalPrice ?? selectedDimension.price) : activeProduct.originalPrice;

  // Update quantity/variant state if the product changes
  useEffect(() => {
    setQuantity(1);
    if (materialsList.length > 0) {
      setSelectedMaterial(materialsList[0]);
    } else {
      setSelectedMaterial('Oak');
    }
    setActiveImgIdx(0);
  }, [activeProduct.slug, dbProduct]);

  // Handle intersection observer to highlight active thumbnail as user scrolls gallery
  useEffect(() => {
    const observers = activeProduct.images.map((_, idx) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveImgIdx(idx);
          }
        },
        { threshold: 0.5, rootMargin: '-10% 0px -50% 0px' }
      );
      const el = document.getElementById(`image-${idx}`);
      if (el) observer.observe(el);
      return { observer, el };
    });

    return () => {
      observers.forEach(({ observer, el }) => {
        if (el) observer.unobserve(el);
      });
    };
  }, [activeProduct.images]);

  const scrollToImage = (idx: number) => {
    const el = document.getElementById(`image-${idx}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleAddToCart = async () => {
    // Build cart entry
    const cartProduct = {
      ...activeProduct,
      price: currentPrice,
      selectedMaterial,
      selectedDimension: selectedDimension ? selectedDimension.label : 'Standard',
    };

    if (user) {
      // ── Logged-in: sync with DB ──────────────────────────────────────────────
      try {
        const res = await fetch('/api/cart');
        const data = await res.json();
        const dbCart: { product: Product & { selectedMaterial?: string; selectedDimension?: string }; quantity: number }[] = data.success ? (data.cart ?? []) : [];

        const existingIdx = dbCart.findIndex((item) =>
          item.product.slug === activeProduct.slug &&
          (item.product.selectedMaterial || 'Oak') === selectedMaterial &&
          (item.product.selectedDimension || 'Standard') === cartProduct.selectedDimension
        );
        if (existingIdx !== -1) {
          dbCart[existingIdx].quantity += quantity;
          dbCart[existingIdx].product.price = currentPrice;
        } else {
          dbCart.push({ product: cartProduct, quantity });
        }

        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart: dbCart }),
        });

        window.dispatchEvent(new Event('cart-updated'));
      } catch (err) {
        console.error('Failed to sync cart to DB:', err);
      }
    } else {
      // ── Guest: use localStorage ──────────────────────────────────────────────
      const savedCart = localStorage.getItem('cart');
      let cartList: { product: Product & { selectedMaterial?: string; selectedDimension?: string }; quantity: number }[] = [];

      if (savedCart) {
        try {
          cartList = JSON.parse(savedCart);
        } catch (e) {
          console.error(e);
        }
      }

      const existingIdx = cartList.findIndex((item) =>
        item.product.slug === activeProduct.slug &&
        (item.product.selectedMaterial || 'Oak') === selectedMaterial &&
        (item.product.selectedDimension || 'Standard') === cartProduct.selectedDimension
      );
      if (existingIdx !== -1) {
        cartList[existingIdx].quantity += quantity;
        cartList[existingIdx].product.price = currentPrice;
      } else {
        cartList.push({ product: cartProduct, quantity });
      }

      localStorage.setItem('cart', JSON.stringify(cartList));
      window.dispatchEvent(new Event('cart-updated'));
    }

    // Feedback notification
    setAddedNotification(true);
    setTimeout(() => setAddedNotification(false), 4000);
  };

  // Scroll priority wheel handler:
  // ↓ Down: Scroll right details card stack first, then page
  // ↑ Up: Scroll page back to top first, then scroll right details card stack
  const rightColumnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const el = rightColumnRef.current;
      if (!el) return;

      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
      const atTop = el.scrollTop <= 0;
      const pageAtTop = (window.scrollY || document.documentElement.scrollTop) <= 0;

      if (e.deltaY > 0) {
        // ↓ Scrolling DOWN — right column has priority
        if (!atBottom) {
          e.preventDefault();
          el.scrollTop += e.deltaY;
        }
      } else if (e.deltaY < 0) {
        // ↑ Scrolling UP — page has priority
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

  // Get related products (excluding current, capped at 4)
  const relatedProducts = products
    .filter((p) => p.slug !== activeProduct.slug)
    .sort((a, b) => (a.category === activeProduct.category ? -1 : 1))
    .slice(0, 4);

  if (notFoundState) {
    notFound();
  }

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  return (
    <div className="w-full bg-bg-primary transition-theme pb-16">

      {/* ── Main Split Hero Section ── */}
      <div className="w-full flex flex-col lg:flex-row gap-3 select-text transition-theme relative lg:h-screen -mt-24">

        {/* Left Column: Image gallery card */}
        <section className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pl-3 lg:pr-0 flex items-stretch h-[500px] md:h-[600px] lg:h-full flex-shrink-0 transition-theme">
          <div className="h-full rounded-xl overflow-hidden relative border border-border-accent/40 w-full bg-bg-secondary/40 shadow-sm flex flex-col">
            <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto scrollbar-none h-full snap-x snap-mandatory lg:snap-none pb-4 lg:pb-0">
              {activeProduct.images.map((img, idx) => (
                <div
                  key={idx}
                  id={`image-${idx}`}
                  className="w-full lg:w-full aspect-square lg:aspect-[3/4] flex-shrink-0 snap-center relative"
                >
                  <img src={img} alt={`${activeProduct.name} view ${idx + 1}`} className="object-cover w-full h-full" />
                </div>
              ))}
            </div>

            {/* Floating Sticky Thumbnails panel */}
            <div className="absolute bottom-6 left-0 right-0 hidden lg:flex justify-center z-20 pointer-events-none">
              <div className="bg-bg-primary/80 backdrop-blur-md px-4 py-2.5 rounded-full border border-border-accent/80 shadow-lg flex gap-2 pointer-events-auto transition-theme">
                {activeProduct.images.map((img, idx) => {
                  const isActive = activeImgIdx === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => scrollToImage(idx)}
                      className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer relative flex-shrink-0 ${isActive ? 'border-fg-primary scale-105 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                    >
                      <img src={img} alt={`thumbnail ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Sticky / Scrollable Details Panel */}
        <div ref={rightColumnRef} className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pr-3 lg:pl-0 flex flex-col gap-3 transition-theme lg:h-full lg:overflow-y-auto scrollbar-none">

          {/* Main Details Card */}
          <div className="w-full bg-[#0e1011] text-white rounded-xl p-8 md:p-12 lg:pt-28 lg:pb-12 lg:px-12 border border-white/5 space-y-6 flex-shrink-0 shadow-sm flex flex-col">

            {/* Sale tag and pricing */}
            <div className="space-y-3">
              {(activeProduct.discountBadge || saleBadges[activeProduct.slug]) && (
                <div className="bg-[#ef4444] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg w-fit uppercase tracking-wider">
                  {activeProduct.discountBadge || saleBadges[activeProduct.slug]}
                </div>
              )}
              <div className="flex items-baseline gap-3 animate-fade-in">
                <span className="text-3xl font-bold text-white">
                  ${currentPrice}
                </span>
                {(activeProduct.discountBadge || saleBadges[activeProduct.slug]) && (
                  <span className="text-lg text-white/40 line-through">
                    ${currentOriginalPrice || (currentPrice * 2)}
                  </span>
                )}
              </div>
            </div>

            {/* Title & Tagline */}
            <div className="space-y-2">
              <h1 className="font-dm-sans text-4xl lg:text-5xl font-bold tracking-tight text-white">
                {activeProduct.name}
              </h1>
              <p className="text-base text-white/60 italic font-medium">
                {activeProduct.tagline}
              </p>
            </div>

            {/* Material Selector */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <span className="text-xs uppercase font-bold tracking-wider text-white/60">Material</span>
              <div className="flex gap-2">
                {materialsList.map((mat) => {
                  const isActive = selectedMaterial === mat;
                  return (
                    <button
                      key={mat}
                      onClick={() => setSelectedMaterial(mat)}
                      className={`px-5 py-2.5 rounded-xl border text-xs font-semibold tracking-wide transition-all cursor-pointer ${isActive
                          ? 'bg-white border-white text-black shadow-md'
                          : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                        }`}
                    >
                      {mat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dimension Selector */}
            <div className="space-y-3 pt-4 border-t border-white/10 animate-fade-in">
              <span className="text-xs uppercase font-bold tracking-wider text-white/60">Dimension</span>
              <div className="flex flex-wrap gap-2">
                {dimensionsList.map((dim) => {
                  const isActive = selectedDimension?.id === dim.id;
                  const firstPrice = dimensionsList[0]?.price || 0;
                  const priceDiff = dim.price - firstPrice;
                  
                  return (
                    <button
                      key={dim.id}
                      onClick={() => setSelectedDimension(dim)}
                      className={`px-5 py-2.5 rounded-xl border text-xs font-semibold tracking-wide transition-all cursor-pointer ${isActive
                          ? 'bg-white border-white text-black shadow-md'
                          : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                        }`}
                    >
                      {dim.label} {priceDiff > 0 && `(+$${priceDiff})`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity & Cart Action */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-white/60">Quantity</span>
                <span className="text-xs text-green-400 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  8 in stock
                </span>
              </div>
              <div className="flex gap-3">
                <div className="flex items-center justify-between border border-white/10 rounded-xl px-4 py-3 bg-white/5 w-32 flex-shrink-0 transition-theme">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="text-lg text-white/60 hover:text-white focus:outline-none cursor-pointer"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="font-semibold text-white text-sm select-none">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="text-lg text-white/60 hover:text-white focus:outline-none cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-white text-black py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-white/90 transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer relative overflow-hidden"
                >
                  <span>Add to Cart</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Add to Cart Feedback Notification */}
            {addedNotification && (
              <div className="bg-green-500/20 text-green-300 border border-green-500/30 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-bounce">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>Added {quantity}x {activeProduct.name} to your cart!</span>
              </div>
            )}

          </div>

          {/* Info Marquee Ticker Card */}
          <div className="w-full overflow-hidden bg-bg-secondary border border-border-accent/40 py-2.5 rounded-xl select-none transition-theme text-[9px] font-bold uppercase tracking-wider text-fg-secondary/70">
            <div className="flex whitespace-nowrap animate-marquee">
              <div className="flex gap-8 px-4">
                <span>Free Shipping over $500</span>
                <span>•</span>
                <span>Worldwide Delivery</span>
                <span>•</span>
                <span>30-Day Free Returns</span>
                <span>•</span>
              </div>
              <div className="flex gap-8 px-4" aria-hidden="true">
                <span>Free Shipping over $500</span>
                <span>•</span>
                <span>Worldwide Delivery</span>
                <span>•</span>
                <span>30-Day Free Returns</span>
                <span>•</span>
              </div>
            </div>
          </div>

          {/* Collapsible Accordions Card */}
          <div className="w-full bg-[#0e1011] text-white rounded-xl p-8 border border-white/5 divide-y divide-white/10 flex-shrink-0 flex flex-col gap-1">
            {/* Description Accordion */}
            <div className="pb-4">
              <button
                onClick={() => setIsDescOpen(!isDescOpen)}
                className="w-full flex items-center justify-between text-sm font-bold uppercase tracking-wider text-white focus:outline-none cursor-pointer"
              >
                <span>Description</span>
                <span className="text-lg font-normal text-white/60">{isDescOpen ? '−' : '+'}</span>
              </button>
              {isDescOpen && (
                <div className="mt-3 text-sm text-white/70 leading-relaxed pl-2 border-l border-white/20 py-1">
                  Elevate your lifestyle experience with the {activeProduct.name}. A perfect blend of timeless design and modern craftsmanship. Designed to add warmth, comfort, and premium aesthetic value to your interior layouts.
                </div>
              )}
            </div>

            {/* Dimensions Accordion */}
            <div className="py-4">
              <button
                onClick={() => setIsDimensionsOpen(!isDimensionsOpen)}
                className="w-full flex items-center justify-between text-sm font-bold uppercase tracking-wider text-white focus:outline-none cursor-pointer"
              >
                <span>Dimensions & Specs</span>
                <span className="text-lg font-normal text-white/60">{isDimensionsOpen ? '−' : '+'}</span>
              </button>
              {isDimensionsOpen && (
                <div className="mt-3 text-sm text-white/70 pl-2 border-l border-white/20 py-1">
                  <table className="w-full text-xs text-left text-white/70 border-collapse">
                    <tbody>
                      <tr className="border-b border-white/5">
                        <td className="py-2 font-semibold text-white uppercase tracking-wide w-1/3">Material</td>
                        <td className="py-2">{selectedMaterial === 'Oak' ? (activeProduct.category === 'wood' ? 'Solid Oak Frame' : 'Premium Oak') : 'Solid Teak Frame'}</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2 font-semibold text-white uppercase tracking-wide">Finish</td>
                        <td className="py-2">Natural Matte protective finish</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2 font-semibold text-white uppercase tracking-wide">Dimensions</td>
                        <td className="py-2">{activeProduct.dimensions}</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2 font-semibold text-white uppercase tracking-wide">Weight</td>
                        <td className="py-2">6.5 - 8.0 kg</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Shipping Accordion */}
            <div className="py-4">
              <button
                onClick={() => setIsShippingOpen(!isShippingOpen)}
                className="w-full flex items-center justify-between text-sm font-bold uppercase tracking-wider text-white focus:outline-none cursor-pointer"
              >
                <span>Shipping & Returns</span>
                <span className="text-lg font-normal text-white/60">{isShippingOpen ? '−' : '+'}</span>
              </button>
              {isShippingOpen && (
                <div className="mt-3 text-sm text-white/70 leading-relaxed pl-2 border-l border-white/20 py-1 space-y-2">
                  <p>{activeProduct.shippingReturns}</p>
                  <p>We ship securely within 14 business days. Delivery times vary by location, and tracking details are provided upon dispatch.</p>
                </div>
              )}
            </div>

            {/* Share links */}
            <div className="flex items-center gap-4 pt-4 text-xs font-bold uppercase tracking-wider text-white/60 border-t border-white/10">
              <span>Share:</span>
              <a href="#" className="hover:text-white transition-colors">Pinterest</a>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
            </div>
          </div>

        </div>
      </div>

      {/* ── Outer Content Wrapper (Full width below hero split) ── */}
      <div className="px-6 md:px-12 space-y-16 mt-8">

        {/* Storytelling craft details section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 border-t border-border-accent pt-16">
          <div className="space-y-4">
            <h2 className="font-dm-sans text-2xl lg:text-3xl font-bold tracking-tight text-fg-primary">Designed for Modern Living</h2>
            <p className="text-sm text-fg-secondary leading-relaxed">
              Our furniture is thoughtfully crafted to blend timeless Scandinavian design with modern functionality. Each piece is made with meticulous attention to detail, ensuring it fits seamlessly into your home. From the choice of premium materials to the sleek, minimalist aesthetic, we focus on creating furniture that is as practical as it is beautiful.
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="font-dm-sans text-2xl lg:text-3xl font-bold tracking-tight text-fg-primary">Quality That Lasts a Lifetime</h2>
            <p className="text-sm text-fg-secondary leading-relaxed">
              At the heart of our philosophy is a commitment to quality and durability. We use sustainably sourced materials and expert craftsmanship to create furniture that stands the test of time. Every curve, joint, and finish is carefully considered to ensure lasting beauty and strength, bringing you sustainable warmth for generations to come.
            </p>
          </div>
        </section>

        {/* Related products grid with animated cards */}
        <section className="space-y-8 border-t border-border-accent pt-16">
          <h2 className="font-dm-sans text-2xl font-bold text-fg-primary tracking-tight">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {relatedProducts.map((p) => (
              <div
                key={p.slug}
                className="w-full bg-bg-secondary/40 rounded-xl overflow-hidden group h-[500px] relative border border-border-accent/40"
              >
                {/* Product Background Image */}
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="absolute inset-0 w-full h-full object-cover transition-[transform,filter] duration-700 group-hover:scale-[1.03] group-hover:blur-md"
                />

                {/* Top-Right Sale Badge */}
                {saleBadges[p.slug] && (
                  <div className="absolute top-3 right-3 bg-white text-black text-[10px] font-bold px-2.5 py-1 rounded-lg z-10 tracking-wider uppercase">
                    {saleBadges[p.slug]}
                  </div>
                )}

                {/* Floating Top-Left Title Tab */}
                <div className="absolute top-0 left-0 bg-bg-primary pr-6 pb-3 pt-3 pl-4 rounded-br-2xl select-none z-10 transition-all duration-300">
                  {/* Curved Edge SVG - Right */}
                  <div className="absolute top-0 -right-[18px] w-[18px] h-[18px] pointer-events-none rotate-90">
                    <svg viewBox="0 0 18 18" className="w-[18px] h-[18px]" style={{ fill: 'var(--background-primary)' }}>
                      <path d="M 0 18 L 18 18 C 8.059 18 0 9.941 0 0 Z" />
                    </svg>
                  </div>
                  {/* Curved Edge SVG - Bottom */}
                  <div className="absolute -bottom-[18px] left-0 w-[18px] h-[18px] pointer-events-none rotate-90">
                    <svg viewBox="0 0 18 18" className="w-[18px] h-[18px]" style={{ fill: 'var(--background-primary)' }}>
                      <path d="M 0 18 L 18 18 C 8.059 18 0 9.941 0 0 Z" />
                    </svg>
                  </div>
                  <span className="font-dm-sans font-bold text-fg-primary text-sm tracking-tight flex items-center transition-all duration-300">
                    <span>{p.name}</span>
                    <span className="opacity-0 max-w-0 inline-block overflow-hidden translate-x-[-4px] group-hover:opacity-100 group-hover:max-w-[20px] group-hover:translate-x-0 group-hover:ml-1.5 transition-all duration-300 ease-out">
                      ↗
                    </span>
                  </span>
                </div>

                {/* Animated Pop-up Bottom Price Bar */}
                <div className="absolute left-3 right-3 bottom-3 bg-bg-primary rounded-xl p-5 flex items-center justify-between shadow-xl z-10 border border-border-accent/20 transition-all duration-500 [transition-timing-function:cubic-bezier(0.34,1.42,0.64,1)] opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 max-md:opacity-100 max-md:translate-y-0">
                  <span className="text-sm font-bold text-fg-primary">${p.price}</span>
                  <Link
                    href={`/shop/${p.slug}`}
                    className="bg-fg-primary text-bg-primary px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
