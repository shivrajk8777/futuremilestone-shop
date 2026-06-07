'use client';

import { useState, useRef, useEffect } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  category: string;
  items: FAQItem[];
}

export default function FAQ() {
  const [expandedIndex, setExpandedIndex] = useState<string | null>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);

  // Scroll priority:
  //  ↓ Down  → right column first → then page (footer/social appear)
  //  ↑ Up    → page first (footer/social disappear) → then right column
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const el = rightColumnRef.current;
      if (!el) return;

      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
      const atTop    = el.scrollTop <= 0;
      const pageAtTop = (window.scrollY || document.documentElement.scrollTop) <= 0;

      if (e.deltaY > 0) {
        // ↓ Scrolling DOWN — right column has priority
        if (!atBottom) {
          e.preventDefault();
          el.scrollTop += e.deltaY;
        }
        // right column at bottom → let page scroll naturally (footer/social visible)
      } else if (e.deltaY < 0) {
        // ↑ Scrolling UP — page has priority (to scroll footer back out first)
        if (!pageAtTop) {
          // Page still scrolled → don't intercept, let page scroll up
          return;
        }
        // Page is fully at top → now scroll right column up
        if (!atTop) {
          e.preventDefault();
          el.scrollTop += e.deltaY;
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  const faqs: FAQCategory[] = [
    {
      category: 'Shipping & Delivery',
      items: [
        {
          question: 'How long does shipping take?',
          answer: 'Shipping typically takes 5–7 business days for domestic orders. International delivery times may vary based on location.'
        },
        {
          question: 'Do you ship internationally?',
          answer: 'Yes, we ship to select countries. Additional customs fees or duties may apply depending on your location.'
        },
        {
          question: 'How can I track my order?',
          answer: 'Once your order ships, we’ll send you a tracking link via email to monitor its progress.'
        },
        {
          question: 'What should I do if my order arrives damaged?',
          answer: 'Please contact our support team immediately with photos of the damage. We’ll arrange a replacement or refund.'
        },
        {
          question: 'Are there any shipping fees?',
          answer: 'Shipping fees vary by location and order size. The exact cost will be calculated at checkout.'
        }
      ]
    },
    {
      category: 'Returns & Exchanges',
      items: [
        {
          question: 'What is your return policy?',
          answer: 'You can return items in their original condition within 30 days of delivery for a refund or exchange.'
        },
        {
          question: 'How do I initiate a return or exchange?',
          answer: 'Contact our support team with your order details, and we’ll guide you through the process.'
        },
        {
          question: 'Are there any fees for returning items?',
          answer: 'We cover return shipping for defective or damaged items. For other returns, a small fee may apply.'
        },
        {
          question: 'Can I return custom or made-to-order furniture?',
          answer: 'Unfortunately, custom or made-to-order items are non-refundable unless they arrive damaged or defective.'
        },
        {
          question: 'How long does it take to process a refund?',
          answer: 'Refunds are typically processed within 5–7 business days after we receive and inspect the returned item.'
        }
      ]
    },
    {
      category: 'Orders & Payments',
      items: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept major credit cards, PayPal, and other secure payment options at checkout.'
        },
        {
          question: 'Can I change or cancel my order?',
          answer: 'Orders can be changed or canceled within 24 hours of placement. Contact us immediately for assistance.'
        },
        {
          question: 'Do you offer discounts or promotions?',
          answer: 'Yes, we occasionally run promotions. Sign up for our newsletter to stay updated on special offers.'
        },
        {
          question: 'Will I receive a receipt for my purchase?',
          answer: 'Yes, a receipt will be emailed to you after completing your order.'
        },
        {
          question: 'How can I check the status of my order?',
          answer: 'Log in to your account to view your order status, or contact us for updates.'
        }
      ]
    }
  ];

  const handleToggle = (catIdx: number, itemIdx: number) => {
    const key = `${catIdx}-${itemIdx}`;
    setExpandedIndex(expandedIndex === key ? null : key);
  };

  const socialCards = [
    { name: 'Twitter', href: 'https://twitter.com' },
    { name: 'Instagram', href: 'https://instagram.com' },
    { name: 'Pinterest', href: 'https://pinterest.com' },
    { name: 'Behance', href: 'https://behance.net' }
  ];

  return (
    <div className="w-full flex flex-col lg:flex-row gap-3 bg-bg-primary select-text transition-theme relative lg:h-screen">

      {/* Left Column: Image (Stable on Desktop) */}
      <section className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pl-3 lg:pr-0 flex items-stretch h-[400px] md:h-[600px] lg:h-[calc(100vh-24px)] lg:max-h-[calc(100vh-24px)] flex-shrink-0 transition-theme">
        <div className="h-full rounded-xl overflow-hidden relative border border-border-accent/40 w-full group shadow-sm">
          <img
            src="/images/xz7hJ6ESQ5b48HiLq5UkSZLMyM_a48801.webp"
            alt="FAQ"
            className="absolute inset-0 w-full h-full object-cover brightness-[0.95] transition-transform duration-700 group-hover:scale-101"
          />
          <div className="absolute inset-0 bg-black/5" />
        </div>
      </section>

      {/* Right Column: Scrollable Content */}
      <div ref={rightColumnRef} className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pr-3 lg:pl-0 flex flex-col gap-3 transition-theme lg:h-[calc(100vh-24px)] lg:max-h-[calc(100vh-24px)] lg:overflow-y-auto scrollbar-none">
        
        {/* Header Card */}
        <div className="w-full bg-bg-secondary border border-border-accent/40 p-8 md:p-12 lg:p-16 rounded-xl transition-theme flex flex-col gap-4">
          <h1 className="font-dm-sans text-4xl md:text-5xl font-bold tracking-tight text-fg-primary">
            FAQ
          </h1>
          <p className="text-sm md:text-base text-fg-secondary leading-relaxed font-medium">
            Welcome to our FAQ page! Here, you’ll find answers to the most common questions about our products, shipping, returns, and more.
          </p>
        </div>

        {/* Categories & Accordions */}
        <div className="flex flex-col gap-8 pb-12">
          {faqs.map((cat, catIdx) => (
            <div key={catIdx} className="flex flex-col gap-3">
              {/* Category Title Card */}
              <div className="w-full bg-bg-secondary border border-border-accent/40 rounded-xl py-4 flex items-center justify-center transition-theme">
                <h2 className="font-dm-sans text-xs font-bold text-fg-primary uppercase tracking-widest text-center">
                  {cat.category}
                </h2>
              </div>

              {/* Accordion Stack */}
              <div className="flex flex-col gap-3">
                {cat.items.map((item, itemIdx) => {
                  const key = `${catIdx}-${itemIdx}`;
                  const isOpen = expandedIndex === key;
                  return (
                    <div
                      key={itemIdx}
                      className="bg-bg-secondary border border-border-accent/40 rounded-xl overflow-hidden transition-theme"
                    >
                      <button
                        onClick={() => handleToggle(catIdx, itemIdx)}
                        className="w-full flex items-center justify-between text-left px-6 py-5 text-sm sm:text-base font-bold text-fg-primary focus:outline-none transition-theme cursor-pointer"
                      >
                        <span className="pr-4">{item.question}</span>
                        {/* Rotating plus sign */}
                        <svg
                          className={`w-5 h-5 text-fg-secondary flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-45 text-fg-primary' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[300px] border-t border-border-accent/30' : 'max-h-0'}`}
                      >
                        <div className="px-6 py-5 text-sm text-fg-secondary leading-relaxed bg-bg-secondary/10 font-medium">
                          {item.answer}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
