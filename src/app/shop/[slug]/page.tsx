'use client';

import { useState, useEffect, use, useRef } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { products, Product, ProductDetailSection } from '@/data/products';
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
        <section className="w-full lg:w-[calc(60%-6px)] py-3 px-3 lg:py-3 lg:pl-3 lg:pr-0 flex items-stretch h-[500px] md:h-[600px] lg:h-full flex-shrink-0">
          <div className="h-full rounded-xl w-full border border-border-accent/40 animate-wave" />
        </section>

        {/* Right Column: Details card skeleton */}
        <div className="w-full lg:w-[calc(40%-6px)] py-3 px-3 lg:py-3 lg:pr-3 lg:pl-0 flex flex-col gap-3 lg:h-full justify-center">
          <div className="w-full bg-bg-secondary rounded-xl p-8 md:p-12 lg:pt-28 lg:pb-12 lg:px-12 border border-border-accent/40 space-y-6 flex-shrink-0 flex flex-col animate-pulse">
            {/* Sale Badge & Price */}
            <div className="space-y-3">
              <div className="h-4 w-16 bg-fg-primary/10 rounded-md" />
              <div className="h-8 w-28 bg-fg-primary/10 rounded-md" />
            </div>

            {/* Title & Tagline */}
            <div className="space-y-3">
              <div className="h-10 w-3/4 bg-fg-primary/10 rounded-md" />
              <div className="h-5 w-1/2 bg-fg-primary/10 rounded-md" />
            </div>

            {/* Material selector divider */}
            <div className="space-y-3 pt-4 border-t border-border-accent/40">
              <div className="h-3 w-12 bg-fg-primary/10 rounded-md" />
              <div className="flex gap-2">
                <div className="h-9 w-16 bg-fg-primary/10 rounded-xl" />
                <div className="h-9 w-16 bg-fg-primary/10 rounded-xl" />
              </div>
            </div>

            {/* Dimension selector divider */}
            <div className="space-y-3 pt-4 border-t border-border-accent/40">
              <div className="h-3 w-16 bg-fg-primary/10 rounded-md" />
              <div className="h-12 w-full bg-fg-primary/5 rounded-xl border border-border-accent/40" />
            </div>

            {/* Quantity / Cart divider */}
            <div className="space-y-3 pt-4 border-t border-border-accent/40">
              <div className="h-3 w-16 bg-fg-primary/10 rounded-md" />
              <div className="flex gap-3 items-center">
                <div className="flex gap-1.5 items-center">
                  <div className="h-11 w-11 bg-fg-primary/10 rounded-sm" />
                  <div className="h-11 w-14 bg-fg-primary/5 rounded-sm border border-border-accent/40" />
                  <div className="h-11 w-11 bg-fg-primary/10 rounded-sm" />
                </div>
                <div className="h-11 flex-grow bg-fg-primary/10 rounded-sm" />
              </div>
            </div>
          </div>

          {/* Marquee slider placeholder */}
          <div className="h-10 w-full rounded-xl border border-border-accent/40 animate-wave" />

          {/* Accordion list placeholder */}
          <div className="space-y-3 w-full flex flex-col">
            <div className="w-full bg-bg-secondary rounded-xl p-5 border border-border-accent/40 animate-pulse">
              <div className="h-6 w-full bg-fg-primary/10 rounded-md" />
            </div>
            <div className="w-full bg-bg-secondary rounded-xl p-5 border border-border-accent/40 animate-pulse">
              <div className="h-6 w-full bg-fg-primary/10 rounded-md" />
            </div>
            <div className="w-full bg-bg-secondary rounded-xl p-5 border border-border-accent/40 animate-pulse">
              <div className="h-6 w-full bg-fg-primary/10 rounded-md" />
            </div>
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

  const [relatedProducts, setRelatedProducts] = useState<any[]>(() => {
    return products
      .filter((p) => p.slug !== slug)
      .sort((a, b) => (a.category === (staticProduct?.category || 'wood') ? -1 : 1))
      .slice(0, 4);
  });

  // Fetch dynamic product from MongoDB
  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.product) {
            setDbProduct(data.product);
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

  // Fetch dynamic related products from MongoDB
  useEffect(() => {
    async function loadRelatedProducts() {
      try {
        const res = await fetch(`/api/products?limit=50`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.products)) {
            const currentCategory = dbProduct?.category || staticProduct?.category || 'wood';
            const filtered = data.products
              .filter((p: any) => p.slug !== slug)
              .sort((a: any, b: any) => (a.category === currentCategory ? -1 : 1))
              .slice(0, 4);
            setRelatedProducts(filtered);
          }
        }
      } catch (err) {
        console.error('Failed to load related products:', err);
      }
    }
    if (slug) {
      loadRelatedProducts();
    }
  }, [slug, dbProduct?.category, staticProduct?.category]);

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
    details: (dbProduct?.details || []) as ProductDetailSection[],
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
    if (selectedDimension && !dimensionsList.some((d: DimensionItem) => d.id === selectedDimension.id)) {
      setSelectedDimension(null);
    }
  }, [dimensionsList, selectedDimension]);

  // Compute active price
  const currentPrice = selectedDimension ? selectedDimension.price : activeProduct.price;
  const currentOriginalPrice = selectedDimension ? (selectedDimension.originalPrice ?? selectedDimension.price) : activeProduct.originalPrice;

  // Update quantity/variant state if the product changes
  useEffect(() => {
    setQuantity(1);
    setSelectedDimension(null);
    if (materialsList.length > 0) {
      setSelectedMaterial(materialsList[0]);
    } else {
      setSelectedMaterial('Oak');
    }
    setActiveImgIdx(0);
  }, [activeProduct.slug, dbProduct]);

  // Handle intersection observer to highlight active thumbnail as user scrolls gallery
  useEffect(() => {
    const scrollContainer = galleryScrollRef.current;
    const observers = activeProduct.images.map((_, idx) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveImgIdx(idx);
          }
        },
        {
          root: scrollContainer,
          threshold: 0.5,
        }
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
    setActiveImgIdx(idx);
    const el = document.getElementById(`image-${idx}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleAddToCart = async () => {
    if (!selectedDimension) {
      alert("Please select a dimension first.");
      return;
    }
    // Build cart entry
    const cartProduct = {
      ...activeProduct,
      price: currentPrice,
      selectedMaterial,
      selectedDimension: selectedDimension.label,
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

  const rightColumnRef = useRef<HTMLDivElement>(null);
  const galleryScrollRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const dimensionsRef = useRef<HTMLDivElement>(null);
  const shippingRef = useRef<HTMLDivElement>(null);

  // relatedProducts is loaded dynamically from database and managed in state.

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
        <section className="w-full lg:w-[calc(58%-6px)] py-3 px-3 lg:py-3 lg:pl-3 lg:pr-0 flex items-stretch h-[380px] sm:h-[480px] md:h-[600px] lg:h-full flex-shrink-0 transition-theme">
          <div className="h-full rounded-xl overflow-hidden relative border border-border-accent/40 w-full bg-bg-secondary/40 shadow-sm flex flex-col">
            <div ref={galleryScrollRef} className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto scrollbar-none h-full snap-x snap-mandatory lg:snap-none pb-4 lg:pb-0">
              {activeProduct.images.map((img, idx) => (
                <div
                  key={idx}
                  id={`image-${idx}`}
                  className="w-full h-full lg:w-full lg:h-auto lg:aspect-[3/4] flex-shrink-0 snap-center relative"
                >
                  <img src={img} alt={`${activeProduct.name} view ${idx + 1}`} className="object-cover w-full h-full" />
                </div>
              ))}
            </div>

            {/* Floating Sticky Thumbnails panel */}
            <div className="absolute bottom-6 left-0 right-0 hidden lg:flex justify-center z-20 pointer-events-none">
              <div className="bg-bg-primary/95 backdrop-blur-md p-2.5 rounded-2xl border border-border-accent/80 shadow-lg flex gap-2 pointer-events-auto transition-theme">
                {activeProduct.images.map((img, idx) => {
                  const isActive = activeImgIdx === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => scrollToImage(idx)}
                      className={`w-12 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer relative flex-shrink-0 ${isActive ? 'border-fg-primary scale-105 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
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
        <div ref={rightColumnRef} className="w-full lg:w-[calc(41%-6px)] py-3 px-3 lg:py-3 lg:pr-3 lg:pl-0 flex flex-col gap-3 transition-theme lg:h-full lg:overflow-y-auto scrollbar-none">

          {/* Main Details Card */}
          <div className="w-full bg-bg-secondary text-fg-primary rounded-xl p-8 md:p-12 lg:pt-20 lg:pb-12 lg:px-12 border border-border-accent/40 space-y-6 flex-shrink-0 shadow-sm flex flex-col transition-theme">

            {/* Sale tag and pricing */}
            <div className="space-y-3">
              {(activeProduct.discountBadge || saleBadges[activeProduct.slug]) && (
                <div className="bg-[#ef4444] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg w-fit uppercase tracking-wider">
                  {activeProduct.discountBadge || saleBadges[activeProduct.slug]}
                </div>
              )}
              <div className="flex items-baseline gap-3 animate-fade-in">
                <span className="font-dm-sans text-3xl font-bold text-fg-primary">
                  ${currentPrice}
                </span>
                {(activeProduct.discountBadge || saleBadges[activeProduct.slug]) && (
                  <span className="font-dm-sans text-lg text-fg-secondary/40 line-through">
                    ${currentOriginalPrice || (currentPrice * 2)}
                  </span>
                )}
              </div>
            </div>

            {/* Title & Tagline */}
            <div className="space-y-2">
              <h1 className="font-dm-sans text-4xl lg:text-5xl font-bold tracking-tight text-fg-primary">
                {activeProduct.name}
              </h1>
              <p className="text-base text-fg-secondary italic font-medium">
                {activeProduct.tagline}
              </p>
            </div>

            {/* Material Selector */}
            <div className="space-y-3 pt-4 border-t border-border-accent/60">
              <span className="font-dm-sans text-xs font-bold tracking-wider text-fg-secondary">Material</span>
              <div className="flex gap-2">
                {materialsList.map((mat) => {
                  const isActive = selectedMaterial === mat;
                  return (
                    <button
                      key={mat}
                      onClick={() => setSelectedMaterial(mat)}
                      className={`font-dm-sans px-5 py-2.5 rounded-sm border text-xs font-semibold tracking-wide transition-all cursor-pointer ${isActive
                        ? 'bg-border-accent/80 border-border-accent text-fg-primary shadow-md'
                        : 'bg-fg-primary/5 border-fg-primary/10 text-fg-primary hover:bg-fg-primary/10'
                        }`}
                    >
                      {mat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dimension Selector */}
            <div className="space-y-3 pt-4 border-t border-border-accent/60 animate-fade-in relative">
              <label htmlFor="dimension-select" className="font-dm-sans text-xs font-bold tracking-wider text-fg-secondary block">
                Dimension
              </label>
              <div className="relative">
                <select
                  id="dimension-select"
                  value={selectedDimension?.id || ''}
                  onChange={(e) => {
                    const selected = dimensionsList.find((d) => d.id === e.target.value);
                    if (selected) setSelectedDimension(selected);
                  }}
                  className="font-dm-sans w-full bg-bg-primary border border-border-accent text-fg-primary text-xs font-semibold rounded-sm py-3 px-4 pr-10 appearance-none cursor-pointer focus:outline-none focus:border-border-accent/80 transition-all shadow-sm transition-theme"
                >
                  <option value="" disabled>Select Dimension</option>
                  {dimensionsList.map((dim) => {
                    const firstPrice = dimensionsList[0]?.price || 0;
                    const priceDiff = dim.price - firstPrice;
                    return (
                      <option key={dim.id} value={dim.id} className="bg-bg-primary text-fg-primary">
                        {dim.label} {priceDiff > 0 ? `(+$${priceDiff})` : ''}
                      </option>
                    );
                  })}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-fg-secondary/60">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Quantity & Cart Action */}
            <div className="space-y-3 pt-4 border-t border-border-accent/60">
              <div className="flex items-center justify-between">
                <span className="font-dm-sans text-xs uppercase font-bold tracking-wider text-fg-secondary">Quantity</span>
                <span className="text-xs text-green-600 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
                  8 in stock
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full">
                <div className="flex gap-1.5 items-center w-full sm:w-auto">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="font-dm-sans w-11 h-11 flex items-center justify-center bg-fg-primary/5 hover:bg-fg-primary/10 rounded-sm text-lg text-fg-primary/60 hover:text-fg-primary focus:outline-none cursor-pointer transition-colors"
                    disabled={quantity <= 1}
                  >
                    &minus;
                  </button>
                  <div className="font-dm-sans w-14 h-11 flex items-center justify-center bg-bg-primary border border-border-accent rounded-sm text-sm font-semibold text-fg-primary select-none shadow-sm">
                    {quantity}
                  </div>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="font-dm-sans w-11 h-11 flex items-center justify-center bg-fg-primary/5 hover:bg-fg-primary/10 rounded-sm text-lg text-fg-primary/60 hover:text-fg-primary focus:outline-none cursor-pointer transition-colors"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="font-dm-sans w-full sm:flex-1 h-11 bg-fg-primary text-bg-primary rounded-sm font-bold uppercase tracking-wider text-xs hover:opacity-90 transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer relative overflow-hidden"
                >
                  <span>Add To Cart</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Add to Cart Feedback Notification */}
            {addedNotification && (
              <div className="bg-green-500/10 text-green-700 border border-green-500/20 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-bounce">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>Added {quantity}x {activeProduct.name} to your cart!</span>
              </div>
            )}

          </div>

          {/* Info Marquee Ticker Card */}
          <div className="flex-shrink-0 w-full h-12 overflow-hidden bg-fg-primary text-bg-primary border border-border-accent/40 flex items-center select-none transition-theme text-[10px] font-bold uppercase tracking-wider rounded-xl mt-2">
            <div className="flex whitespace-nowrap animate-marquee items-center">
              <div className="flex gap-8 px-4 items-center">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                  </svg>
                  <span>Free Returns</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  <span>Free Shipping over 40500€</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9h18" />
                  </svg>
                  <span>Worldwide Shipping</span>
                </div>
                <span>•</span>
              </div>
              <div className="flex gap-8 px-4 items-center" aria-hidden="true">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                  </svg>
                  <span>Free Returns</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  <span>Free Shipping over 500€</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9h18" />
                  </svg>
                  <span>Worldwide Shipping</span>
                </div>
                <span>•</span>
              </div>
            </div>
          </div>

          {/* Description Accordion Card */}
          <div className="w-full bg-bg-secondary text-fg-primary rounded-xl border border-border-accent/40 flex-shrink-0 overflow-hidden transition-theme">
            <button
              onClick={() => setIsDescOpen(!isDescOpen)}
              className="font-dm-sans w-full flex items-center justify-between px-5 md:px-6 py-5 md:py-6 text-base font-medium text-fg-primary focus:outline-none cursor-pointer"
            >
              <span>Description</span>
              <svg
                className={`w-4 h-4 text-fg-secondary flex-shrink-0 transition-transform duration-300 ease-in-out ${isDescOpen ? 'rotate-180' : 'rotate-0'}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              ref={descRef}
              style={{
                maxHeight: isDescOpen ? (descRef.current?.scrollHeight ?? 500) + 'px' : '0px',
                opacity: isDescOpen ? 1 : 0,
                transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease',
              }}
              className="overflow-hidden"
            >
              <div className="px-5 md:px-6 pb-5 md:pb-6 text-sm text-fg-secondary leading-relaxed">
                {activeProduct.description || `Elevate your lifestyle experience with the ${activeProduct.name}. A perfect blend of timeless design and modern craftsmanship. Designed to add warmth, comfort, and premium aesthetic value to your interior layouts.`}
              </div>
            </div>
          </div>

          {/* Dimensions Accordion Card */}
          <div className="w-full bg-bg-secondary text-fg-primary rounded-xl border border-border-accent/40 flex-shrink-0 overflow-hidden transition-theme">
            <button
              onClick={() => setIsDimensionsOpen(!isDimensionsOpen)}
              className="font-dm-sans w-full flex items-center justify-between px-5 md:px-6 py-5 md:py-6 text-base font-medium text-fg-primary focus:outline-none cursor-pointer"
            >
              <span>Dimensions</span>
              <svg
                className={`w-4 h-4 text-fg-secondary flex-shrink-0 transition-transform duration-300 ease-in-out ${isDimensionsOpen ? 'rotate-180' : 'rotate-0'}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              ref={dimensionsRef}
              style={{
                maxHeight: isDimensionsOpen ? (dimensionsRef.current?.scrollHeight ?? 500) + 'px' : '0px',
                opacity: isDimensionsOpen ? 1 : 0,
                transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease',
              }}
              className="overflow-hidden"
            >
              <div className="px-5 md:px-6 pb-5 md:pb-6">
                <table className="w-full text-xs text-left text-fg-secondary border-collapse">
                  <tbody>
                    <tr className="border-b border-border-accent/40">
                      <td className="font-dm-sans py-2.5 font-semibold text-fg-primary uppercase tracking-wide w-1/3">Material</td>
                      <td className="py-2.5">{selectedMaterial === 'Oak' ? (activeProduct.category === 'wood' ? 'Solid Oak Frame' : 'Premium Oak') : 'Solid Teak Frame'}</td>
                    </tr>
                    <tr className="border-b border-border-accent/40">
                      <td className="font-dm-sans py-2.5 font-semibold text-fg-primary uppercase tracking-wide">Finish</td>
                      <td className="py-2.5">Natural Matte protective finish</td>
                    </tr>
                    <tr className="border-b border-border-accent/40">
                      <td className="font-dm-sans py-2.5 font-semibold text-fg-primary uppercase tracking-wide">Dimensions</td>
                      <td className="py-2.5">{activeProduct.dimensions}</td>
                    </tr>
                    <tr className="border-b border-border-accent/40">
                      <td className="font-dm-sans py-2.5 font-semibold text-fg-primary uppercase tracking-wide">Weight</td>
                      <td className="py-2.5">6.5 - 8.0 kg</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Shipping Accordion Card */}
          <div className="w-full bg-bg-secondary text-fg-primary rounded-xl border border-border-accent/40 flex-shrink-0 overflow-hidden transition-theme">
            <button
              onClick={() => setIsShippingOpen(!isShippingOpen)}
              className="font-dm-sans w-full flex items-center justify-between px-5 md:px-6 py-5 md:py-6 text-base font-medium text-fg-primary focus:outline-none cursor-pointer"
            >
              <span>Shipping &amp; Returns</span>
              <svg
                className={`w-4 h-4 text-fg-secondary flex-shrink-0 transition-transform duration-300 ease-in-out ${isShippingOpen ? 'rotate-180' : 'rotate-0'}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              ref={shippingRef}
              style={{
                maxHeight: isShippingOpen ? (shippingRef.current?.scrollHeight ?? 500) + 'px' : '0px',
                opacity: isShippingOpen ? 1 : 0,
                transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease',
              }}
              className="overflow-hidden"
            >
              <div className="px-5 md:px-6 pb-5 md:pb-6 text-sm text-fg-secondary leading-relaxed space-y-2">
                <p>{activeProduct.shippingReturns}</p>
                <p>We ship securely within 14 business days. Delivery times vary by location, and tracking details are provided upon dispatch.</p>
              </div>
            </div>
          </div>

          {/* Share links */}
          <div className="grid grid-cols-2 gap-3 w-full flex-shrink-0">
            <a
              href="#"
              className="font-dm-sans flex items-center justify-between bg-bg-secondary rounded-xl p-4 text-fg-primary hover:bg-fg-primary/5 transition-all border border-border-accent/40"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-fg-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.42 7.63 11.16-.1-.95-.2-2.4.04-3.43.22-.93 1.4-5.93 1.4-5.93s-.36-.72-.36-1.77c0-1.66.96-2.9 2.18-2.9 1.03 0 1.52.77 1.52 1.7 0 1.03-.66 2.58-.99 4-.28 1.2.6 2.18 1.78 2.18 2.13 0 3.77-2.25 3.77-5.5 0-2.88-2.07-4.9-5.03-4.9-3.43 0-5.44 2.57-5.44 5.22 0 1.04.4 2.15.9 2.75.1.12.11.23.08.35l-.33 1.34c-.05.21-.18.26-.41.15-1.52-.7-2.48-2.92-2.48-4.7 0-3.83 2.78-7.34 8.02-7.34 4.21 0 7.48 3 7.48 7 0 4.18-2.63 7.55-6.28 7.55-1.23 0-2.38-.64-2.77-1.4l-.76 2.9c-.27 1.04-.98 2.34-1.46 3.12C9.53 23.82 10.74 24 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z" />
                </svg>
                <span className="text-sm font-medium">Pinterest</span>
              </div>
              <svg className="w-3.5 h-3.5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </a>
            <a
              href="#"
              className="font-dm-sans flex items-center justify-between bg-bg-secondary rounded-xl p-4 text-fg-primary hover:bg-fg-primary/5 transition-all border border-border-accent/40"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-fg-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                <span className="text-sm font-medium">Instagram</span>
              </div>
              <svg className="w-3.5 h-3.5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </a>
          </div>

        </div>
      </div>

      {/* ── Outer Content Wrapper (Full width below hero split) ── */}
      <div className="px-4 md:px-2 space-y-16 mt-8">

        {/* Storytelling craft details section */}
        <section className="space-y-3">
          {/* Centered Details Header Bar */}
          <div className="w-full bg-bg-secondary text-fg-primary border border-border-accent/40 rounded-xl py-4 flex items-center justify-center transition-theme">
            <h2 className="font-dm-sans text-base text-fg-primary tracking-wide">Details</h2>
          </div>

          {/* Zig-zag Split Grid Layout */}
          <div className="flex flex-col gap-3">
            {activeProduct.details && activeProduct.details.length > 0 ? (
              activeProduct.details.map((detail, index) => {
                const isEven = index % 2 === 0;
                if (isEven) {
                  return (
                    <div key={detail.id || index} className="w-full flex flex-col lg:flex-row gap-3 items-stretch animate-fade-in">
                      {/* Left Column: Image */}
                      <div className="w-full lg:w-[calc(60%-6px)] h-[350px] md:h-[450px] lg:h-[690px] rounded-xl overflow-hidden border border-border-accent/40 relative bg-bg-secondary/20">
                        {detail.imageUrl ? (
                          <img
                            src={detail.imageUrl}
                            alt={detail.heading}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-bg-secondary flex items-center justify-center text-fg-secondary/40 font-medium text-sm">
                            No image selected
                          </div>
                        )}
                      </div>

                      {/* Right Column: Text Card */}
                      <div className="w-full lg:w-[calc(40%-6px)] bg-bg-secondary text-fg-primary border border-border-accent/40 rounded-xl p-8 md:p-12 flex flex-col justify-center gap-6 transition-theme">
                        <h3 className="font-dm-sans text-2xl lg:text-[32px] font-bold tracking-tight text-fg-primary leading-tight">
                          {detail.heading}
                        </h3>
                        <div className="space-y-4 text-xs md:text-sm text-fg-secondary leading-relaxed font-normal whitespace-pre-wrap">
                          {detail.content}
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div key={detail.id || index} className="w-full flex flex-col lg:flex-row gap-3 items-stretch animate-fade-in">
                      {/* Left Column: Text Card */}
                      <div className="w-full lg:w-[calc(40%-6px)] bg-bg-secondary text-fg-primary border border-border-accent/40 rounded-xl p-8 md:p-12 flex flex-col justify-center gap-6 transition-theme">
                        <h3 className="font-dm-sans text-2xl lg:text-[32px] font-bold tracking-tight text-fg-primary leading-tight">
                          {detail.heading}
                        </h3>
                        <div className="space-y-4 text-xs md:text-sm text-fg-secondary leading-relaxed font-normal whitespace-pre-wrap">
                          {detail.content}
                        </div>
                      </div>

                      {/* Right Column: Image */}
                      <div className="w-full lg:w-[calc(60%-6px)] h-[350px] md:h-[450px] lg:h-[690px] rounded-xl overflow-hidden border border-border-accent/40 relative bg-bg-secondary/20">
                        {detail.imageUrl ? (
                          <img
                            src={detail.imageUrl}
                            alt={detail.heading}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-bg-secondary flex items-center justify-center text-fg-secondary/40 font-medium text-sm">
                            No image selected
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
              })
            ) : (
              <>
                {/* Row 1: Staged living room image (60%) & Designed for Modern Living text card (40%) */}
                <div className="w-full flex flex-col lg:flex-row gap-3 items-stretch">
                  {/* Left Column: Image */}
                  <div className="w-full lg:w-[calc(60%-6px)] h-[350px] md:h-[450px] lg:h-[690px] rounded-xl overflow-hidden border border-border-accent/40 relative">
                    <img
                      src="/images/FbYhXBQykrdhhjH7YhWUNmGW2Y_082b76.webp"
                      alt="Designed for Modern Living"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Right Column: Text Card */}
                  <div className="w-full lg:w-[calc(40%-6px)] bg-bg-secondary text-fg-primary border border-border-accent/40 rounded-xl p-8 md:p-12 flex flex-col justify-center gap-6 transition-theme">
                    <h3 className="font-dm-sans text-2xl lg:text-[32px] font-bold tracking-tight text-fg-primary leading-tight">
                      Designed for Modern Living
                    </h3>
                    <div className="space-y-4 text-xs md:text-sm text-fg-secondary leading-relaxed font-normal">
                      <p>
                        Our furniture is thoughtfully crafted to blend timeless Scandinavian design with modern functionality. Each piece is made with meticulous attention to detail, ensuring it fits seamlessly into your home. From the choice of premium materials to the sleek, minimalist aesthetic, we focus on creating furniture that is as practical as it is beautiful.
                      </p>
                      <p>
                        Whether you're hosting a gathering or enjoying a quiet evening, our designs are built to enhance your everyday moments with comfort and style.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Row 2: Quality That Lasts a Lifetime text card (40%) & Staged dining table image (60%) */}
                <div className="w-full flex flex-col lg:flex-row gap-3 items-stretch">
                  {/* Left Column: Text Card */}
                  <div className="w-full lg:w-[calc(40%-6px)] bg-bg-secondary text-fg-primary border border-border-accent/40 rounded-xl p-8 md:p-12 flex flex-col justify-between gap-6 transition-theme">
                    {/* Content */}
                    <div className="space-y-4 flex-grow flex flex-col justify-center">
                      <h3 className="font-dm-sans text-2xl lg:text-[32px] font-bold tracking-tight text-fg-primary leading-tight">
                        Quality That Lasts a Lifetime
                      </h3>
                      <div className="space-y-4 text-xs md:text-sm text-fg-secondary leading-relaxed font-normal">
                        <p>
                          At the heart of our philosophy is a commitment to quality and durability. We use sustainably sourced materials and expert craftsmanship to create furniture that stands the test of time. Every curve, joint, and finish is carefully considered to ensure lasting beauty and strength.
                        </p>
                        <p>
                          Our pieces are more than just furniture—they're an investment in your home and lifestyle. With every product, we aim to deliver a blend of elegance and reliability that you can trust for years to come.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Image */}
                  <div className="w-full lg:w-[calc(60%-6px)] h-[350px] md:h-[450px] lg:h-[690px] rounded-xl overflow-hidden border border-border-accent/40 relative">
                    <img
                      src="/images/tTnxI9bEGHuPLga5HlUAYCJjneY_bc98a1.webp"
                      alt="Quality That Lasts a Lifetime"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Related products grid with animated cards */}
        <section className="space-y-8  pt-16">
          <div className="w-full bg-bg-secondary text-fg-primary border border-border-accent/40 rounded-xl py-4 flex items-center justify-center transition-theme">
            <h2 className="font-dm-sans text-base text-fg-primary tracking-wide">You Might Like</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {relatedProducts.map((p) => (
              <div
                key={p.slug}
                className="w-full bg-bg-secondary/40 rounded-xl overflow-hidden group aspect-[8/11] relative border border-border-accent/40"
              >
                {/* Product Background Image */}
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="absolute inset-0 w-full h-full object-cover transition-[transform,filter] duration-700 group-hover:scale-[1.03] group-hover:blur-[6px]"
                />

                {/* Top-Right Sale Badge */}
                {(p.discountBadge || saleBadges[p.slug]) && (
                  <div className="absolute top-3 right-3 bg-white text-black text-[10px] font-bold px-2.5 py-1 rounded-lg z-10 tracking-wider uppercase">
                    {p.discountBadge || saleBadges[p.slug]}
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
                    className="bg-fg-primary text-bg-primary px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity underline underline-offset-4"
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
