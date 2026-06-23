'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCollections } from '@/context/CollectionContext';
import { useProducts } from '@/context/ProductContext';

const saleBadges: Record<string, string> = {
  sage: '50% OFF',
  skala: '50% OFF',
  lykke: '54% OFF',
};

function ShopSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-in">
      {Array.from({ length: 8 }).map((_, idx) => (
        <div
          key={idx}
          className="w-full rounded-xl overflow-hidden aspect-[8/11] relative border border-border-accent/40 animate-wave"
        >
          {/* Top Left Title Tab Skeleton */}
          <div className="absolute top-0 left-0 bg-bg-primary pr-6 pb-3 pt-3 pl-4 rounded-br-2xl w-20 md:w-32 h-10 select-none z-10">
            <div className="h-4 bg-border-accent/30 rounded w-12 md:w-20 mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy] = useState<string>('default');
  const { state: collectionState } = useCollections();
  const collectionsList = collectionState.collections;

  const { state: productState, fetchMoreProducts } = useProducts();
  const productsList = productState.productsByCategory[selectedCategory] || [];
  const isPage1Loading =
    !productState.initialFetched ||
    (productState.loading[selectedCategory] && productsList.length === 0);
  const isMoreLoading = productState.loading[selectedCategory] && productsList.length > 0;
  const hasMore = productState.hasMore[selectedCategory];

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    } else {
      setSelectedCategory('all');
    }
  }, [searchParams]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isMoreLoading) {
          fetchMoreProducts(selectedCategory);
        }
      },
      { threshold: 0.1 }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [selectedCategory, hasMore, isMoreLoading, fetchMoreProducts]);

  const filteredProducts = [...productsList].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0;
  });

  const selectedCollection = collectionsList.find((c) => c.slug === selectedCategory);
  const currentHeader = selectedCollection
    ? { title: selectedCollection.name, desc: selectedCollection.description }
    : {
      title: 'Shop',
      desc: 'Explore our collections, where deep hues and refined finishes bring an air of sophistication and drama to any room.',
    };

  return (
    <div className="space-y-3">

      {/* ── Page Header — full-width, overlaps navbar ── */}
      <div className="-mt-[84px] px-6 md:px-12 bg-bg-secondary pt-32 pb-10 border-b border-border-accent transition-theme">
        <h1 className="font-dm-sans text-5xl md:text-4xl tracking-tight text-fg-primary">
          {currentHeader.title}
        </h1>
        <p className="text-sm text-fg-secondary leading-relaxed max-w-sm mt-3">
          {currentHeader.desc}
        </p>
      </div>

      {/* ── Category Filter Bar ── */}
      {collectionState.fetched && !collectionState.loading && collectionsList.length > 0 && (
        <div className="flex items-stretch gap-3 overflow-x-auto scrollbar-none flex-nowrap pb-1">

          {/* Left: All / back arrow */}
          <button
            onClick={() => setSelectedCategory('all')}
            aria-label="All products"
            className={`flex items-center justify-center px-5 py-4 rounded-xl border border-border-accent bg-bg-secondary hover:bg-fg-primary/5 transition-colors flex-shrink-0 ${selectedCategory === 'all' ? 'text-fg-primary' : 'text-fg-secondary'
              }`}
          >
            {selectedCategory === 'all' ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v11a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            )}
          </button>

          {/* Category buttons — each a separate card */}
          {collectionsList.map((cat) => {
            const isActive = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`flex-1 flex-shrink-0 min-w-[180px] flex items-center justify-between px-6 py-4 rounded-xl border transition-colors whitespace-nowrap ${isActive
                  ? 'bg-bg-secondary border-border-accent text-fg-primary'
                  : 'bg-bg-secondary border-border-accent text-fg-secondary hover:bg-fg-primary/5'
                  }`}
              >
                <span className="text-sm font-semibold">{cat.name}</span>
                <svg
                  className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-fg-primary' : 'text-fg-secondary/40'}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            );
          })}

        </div>
      )}


      {/* ── Product Grid ── */}
      <div className="pb-3">
        {isPage1Loading ? (
          <ShopSkeletonGrid />
        ) : filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {filteredProducts.map((product) => (
                <Link
                  href={`/shop/${product.slug}`}
                  key={product.slug}
                  className="block w-full bg-bg-secondary/40 rounded-xl overflow-hidden group aspect-[8/11] relative border border-border-accent/40 animate-fade-in"
                >
                  {/* Product Background Image */}
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-fill transition-[transform,filter] duration-700 group-hover:scale-[1.03] group-hover:blur-[6px]"
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-bg-secondary flex items-center justify-center text-fg-secondary text-xs">No image</div>
                  )}

                  {/* Top-Right Sale Badge */}
                  {(product.discountBadge || saleBadges[product.slug]) && (
                    <div className="absolute top-3 right-3 bg-black text-white text-[10px] font-bold px-2.5 py-1 rounded-lg z-10 tracking-wider uppercase shadow-md">
                      {product.discountBadge || saleBadges[product.slug]}
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
                      <span className="md:hidden">{product.name.split(' ')[0]}</span>
                      <span className="hidden md:inline">{product.name}</span>
                      <span className="opacity-0 max-w-0 inline-block overflow-hidden translate-x-[-4px] group-hover:opacity-100 group-hover:max-w-[20px] group-hover:translate-x-0 group-hover:ml-1.5 transition-all duration-300 ease-out">
                        ↗
                      </span>
                    </span>
                  </div>

                  {/* Animated Pop-up Bottom Price Bar */}
                  <div className="absolute left-3 right-3 bottom-3 bg-bg-primary rounded-xl p-5 flex items-center justify-between shadow-xl z-10 border border-border-accent/20 transition-all duration-500 [transition-timing-function:cubic-bezier(0.34,1.42,0.64,1)] opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 max-md:opacity-100 max-md:translate-y-0">
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-bold text-fg-primary">${product.price}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-[10px] text-fg-secondary line-through">${product.originalPrice}</span>
                      )}
                    </div>
                    <span
                      className="px-4 py-2 rounded-lg text-xs tracking-wider hover:opacity-90 transition-opacity underline underline-offset-4"
                    >
                      View
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Sentinel element for infinite scroll */}
            <div ref={sentinelRef} className="h-10 w-full flex items-center justify-center mt-6">
              {isMoreLoading && (
                <div className="flex items-center gap-2 text-xs text-fg-secondary font-medium animate-pulse">
                  <div className="w-5 h-5 rounded-full border-2 border-t-transparent border-fg-primary animate-spin" />
                  <span>Loading more items...</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-20 border border-dashed border-border-accent rounded-xl animate-fade-in">
            <svg className="w-16 h-16 text-fg-secondary/20 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-bold text-fg-primary">No products found</h3>
            <p className="text-sm text-fg-secondary mt-1">Try choosing another collection.</p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="mt-6 bg-fg-primary text-bg-primary px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              View All
            </button>
          </div>
        )}
      </div>{/* /grid-wrapper */}
    </div>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={
      <div className="space-y-3">
        {/* Skeleton Header mimicking the page header */}
        <div className="-mt-[84px] px-6 md:px-12 bg-bg-secondary pt-32 pb-10 border-b border-border-accent transition-theme">
          <div className="h-12 w-48 bg-border-accent/30 rounded animate-wave" />
          <div className="h-4 w-64 bg-border-accent/20 rounded mt-3 animate-wave" />
        </div>
        <div className="pb-3">
          <ShopSkeletonGrid />
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
