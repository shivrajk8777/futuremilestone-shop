'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { blogPosts as staticPosts } from '@/data/blog';

interface BlogPost {
  id?: string;
  slug: string;
  title: string;
  summary: string;
  image: string;
  date: string;
  readTime: string;
  category?: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const rightColumnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/blogs?limit=20')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.blogs?.length > 0) {
          setPosts(data.blogs);
        } else {
          // Fallback to static data
          setPosts(staticPosts as BlogPost[]);
        }
      })
      .catch(() => setPosts(staticPosts as BlogPost[]))
      .finally(() => setLoading(false));
  }, []);

  // Scroll priority — identical to FAQ page
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const el = rightColumnRef.current;
      if (!el) return;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
      const atTop = el.scrollTop <= 0;
      const pageAtTop = (window.scrollY || document.documentElement.scrollTop) <= 0;
      if (e.deltaY > 0) {
        if (!atBottom) { e.preventDefault(); el.scrollTop += e.deltaY; }
      } else if (e.deltaY < 0) {
        if (!pageAtTop) return;
        if (!atTop) { e.preventDefault(); el.scrollTop += e.deltaY; }
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  const featuredPost = posts[0];
  const otherPosts = posts.slice(1);

  if (loading) {
    return (
      <div className="w-full flex flex-col lg:flex-row gap-3 bg-bg-primary transition-theme relative lg:h-screen">
        <section className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pl-3 lg:pr-0 flex items-stretch h-[400px] lg:h-[calc(100vh-24px)] flex-shrink-0">
          <div className="h-full rounded-xl w-full bg-bg-secondary/40 animate-pulse border border-border-accent/10" />
        </section>
        <div className="w-full lg:w-[calc(50%-6px)] py-3 px-3 flex flex-col gap-3">
          <div className="h-36 rounded-xl bg-bg-secondary/40 animate-pulse border border-border-accent/10" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[3/4] rounded-xl bg-bg-secondary/40 animate-pulse border border-border-accent/10" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col lg:flex-row gap-3 bg-bg-primary select-text transition-theme relative lg:h-screen">

      {/* Left Column: Sticky Featured Post */}
      <section className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pl-3 lg:pr-0 flex items-stretch h-[400px] md:h-[600px] lg:h-[calc(100vh-24px)] lg:max-h-[calc(100vh-24px)] flex-shrink-0 transition-theme">
        {featuredPost && (
          <div className="h-full rounded-xl overflow-hidden relative border border-border-accent/40 w-full group shadow-sm bg-bg-secondary">
            <img
              src={featuredPost.image}
              alt={featuredPost.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.01]"
            />
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors duration-300" />

            {/* "New" tag */}
            <div className="absolute top-0 left-0 bg-bg-primary pr-6 pb-3 pt-3 pl-4 rounded-br-2xl select-none z-10 transition-theme border-r border-b border-border-accent/10">
              <div className="absolute top-0 -right-[18px] w-[18px] h-[18px] pointer-events-none rotate-90">
                <svg viewBox="0 0 18 18" className="w-[18px] h-[18px]" style={{ fill: 'var(--background-primary)' }}>
                  <path d="M 0 18 L 18 18 C 8.059 18 0 9.941 0 0 Z" />
                </svg>
              </div>
              <div className="absolute -bottom-[18px] left-0 w-[18px] h-[18px] pointer-events-none rotate-90">
                <svg viewBox="0 0 18 18" className="w-[18px] h-[18px]" style={{ fill: 'var(--background-primary)' }}>
                  <path d="M 0 18 L 18 18 C 8.059 18 0 9.941 0 0 Z" />
                </svg>
              </div>
              <span className="font-dm-sans font-bold text-fg-primary text-xs uppercase tracking-wider transition-colors">New</span>
            </div>

            {/* Sliding drawer */}
            <div className="absolute left-3 right-3 bottom-[-78px] md:bottom-[-78px] group-hover:bottom-3 max-md:bottom-3 transition-all duration-300 ease-out bg-bg-primary rounded-lg p-5 flex items-center justify-between shadow-xl z-10 transition-theme border border-border-accent/20">
              <span className="font-dm-sans font-bold text-fg-primary text-sm tracking-tight transition-colors line-clamp-1 mr-4">
                {featuredPost.title}
              </span>
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="relative pb-0.5 text-xs font-bold uppercase tracking-wider text-fg-primary hover:text-fg-secondary group/btn transition-colors flex-shrink-0"
              >
                Read
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-fg-primary transition-colors group-hover/btn:bg-fg-secondary" />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Right Column: Scrollable */}
      <div ref={rightColumnRef} className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pr-3 lg:pl-0 flex flex-col gap-3 transition-theme lg:h-[calc(100vh-24px)] lg:max-h-[calc(100vh-24px)] lg:overflow-y-auto scrollbar-none">

        {/* Header */}
        <div className="bg-bg-secondary p-8 md:p-12 rounded-xl border border-border-accent/40 transition-theme flex flex-col gap-4">
          <h1 className="font-dm-sans text-4xl md:text-5xl font-bold tracking-tight text-fg-primary">Blog</h1>
          <p className="text-sm md:text-base text-fg-secondary leading-relaxed font-medium">
            Explore design tips, craftsmanship insights, and creative inspiration from the Future Milestone Furniture team.
          </p>
        </div>

        {/* Grid of other posts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-12">
          {otherPosts.map((post) => (
            <div
              key={post.slug}
              className="aspect-[3/4] relative rounded-xl overflow-hidden group border border-border-accent/40 bg-bg-secondary transition-theme"
            >
              <img
                src={post.image}
                alt={post.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.01]"
              />
              <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors duration-300" />
              <div className="absolute left-3 right-3 bottom-[-78px] md:bottom-[-78px] group-hover:bottom-3 max-md:bottom-3 transition-all duration-300 ease-out bg-bg-primary rounded-lg p-5 flex items-center justify-between shadow-xl z-10 transition-theme border border-border-accent/20">
                <span className="font-dm-sans font-bold text-fg-primary text-sm tracking-tight transition-colors line-clamp-1 mr-4">
                  {post.title}
                </span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="relative pb-0.5 text-xs font-bold uppercase tracking-wider text-fg-primary hover:text-fg-secondary group/btn transition-colors flex-shrink-0"
                >
                  Read
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-fg-primary transition-colors group-hover/btn:bg-fg-secondary" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
