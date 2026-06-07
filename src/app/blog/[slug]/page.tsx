'use client';

import { use, useRef, useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { blogPosts as staticPosts } from '@/data/blog';

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface BlogPost {
  id?: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  image: string;
  date: string;
  readTime: string;
  category?: string;
}

export default function BlogPost({ params }: PageProps) {
  const { slug } = use(params);

  const [post, setPost]           = useState<BlogPost | null>(null);
  const [related, setRelated]     = useState<BlogPost[]>([]);
  const [loading, setLoading]     = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);

  const rightColumnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Try DB first (search by slug which can also be used as id)
    fetch(`/api/blogs/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.blog) {
          setPost(data.blog);
          // Fetch related: get all and filter
          fetch('/api/blogs?limit=20')
            .then(r => r.json())
            .then(all => {
              if (all.success) {
                setRelated(all.blogs.filter((b: BlogPost) => b.slug !== slug).slice(0, 2));
              }
            });
        } else {
          // Fall back to static data
          const staticPost = staticPosts.find(p => p.slug === slug);
          if (staticPost) {
            setPost(staticPost as BlogPost);
            setRelated(staticPosts.filter(p => p.slug !== slug).slice(0, 2) as BlogPost[]);
          } else {
            setNotFoundFlag(true);
          }
        }
      })
      .catch(() => {
        const staticPost = staticPosts.find(p => p.slug === slug);
        if (staticPost) {
          setPost(staticPost as BlogPost);
          setRelated(staticPosts.filter(p => p.slug !== slug).slice(0, 2) as BlogPost[]);
        } else {
          setNotFoundFlag(true);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Scroll priority — identical to FAQ / blog list pages
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const el = rightColumnRef.current;
      if (!el) return;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
      const atTop    = el.scrollTop <= 0;
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

  if (loading) {
    return (
      <div className="w-full flex flex-col lg:flex-row gap-3 bg-bg-primary transition-theme relative lg:h-screen">
        <section className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pl-3 lg:pr-0 flex items-stretch h-[400px] lg:h-[calc(100vh-24px)] flex-shrink-0">
          <div className="h-full rounded-xl w-full bg-bg-secondary/40 animate-pulse border border-border-accent/10" />
        </section>
        <div className="w-full lg:w-[calc(50%-6px)] py-3 px-3 flex flex-col gap-3">
          {[1,2,3].map(i => <div key={i} className="h-32 rounded-xl bg-bg-secondary/40 animate-pulse border border-border-accent/10" />)}
        </div>
      </div>
    );
  }

  if (notFoundFlag || !post) {
    notFound();
  }

  const category         = post!.category || 'Design';
  const readTimeFormatted = (post!.readTime || '5 min read').replace(' min read', ' Min').replace(' mins read', ' Min');

  return (
    <div className="w-full flex flex-col lg:flex-row gap-3 bg-bg-primary select-text transition-theme relative lg:h-screen">

      {/* Left Column: Post Image */}
      <section className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pl-3 lg:pr-0 flex items-stretch h-[400px] md:h-[600px] lg:h-[calc(100vh-24px)] lg:max-h-[calc(100vh-24px)] flex-shrink-0 transition-theme">
        <div className="h-full rounded-xl overflow-hidden relative border border-border-accent/40 w-full group shadow-sm bg-bg-secondary">
          {post!.image && (
            <img
              src={post!.image}
              alt={post!.title}
              className="absolute inset-0 w-full h-full object-cover brightness-[0.95]"
            />
          )}
          <div className="absolute inset-0 bg-black/5" />

          {/* Date tag */}
          <div className="absolute bottom-0 right-0 bg-bg-primary pr-5 pb-3.5 pt-3.5 pl-6 rounded-tl-2xl select-none z-10 transition-theme border-t border-l border-border-accent/10">
            <div className="absolute bottom-0 -left-[18px] w-[18px] h-[18px] pointer-events-none">
              <svg viewBox="0 0 18 18" className="w-[18px] h-[18px]" style={{ fill: 'var(--background-primary)' }}>
                <path d="M 0 18 L 18 18 C 8.059 18 0 9.941 0 0 Z" />
              </svg>
            </div>
            <div className="absolute -top-[18px] right-0 w-[18px] h-[18px] pointer-events-none rotate-180">
              <svg viewBox="0 0 18 18" className="w-[18px] h-[18px]" style={{ fill: 'var(--background-primary)' }}>
                <path d="M 0 18 L 18 18 C 8.059 18 0 9.941 0 0 Z" />
              </svg>
            </div>
            <span className="font-dm-sans font-bold text-fg-primary text-xs uppercase tracking-wider">{post!.date}</span>
          </div>
        </div>
      </section>

      {/* Right Column: Scrollable Content */}
      <div ref={rightColumnRef} className="w-full lg:w-[calc(50%-6px)] py-3 px-3 lg:py-3 lg:pr-3 lg:pl-0 flex flex-col gap-3 transition-theme lg:h-[calc(100vh-24px)] lg:max-h-[calc(100vh-24px)] lg:overflow-y-auto scrollbar-none">

        {/* Post Header Card */}
        <div className="bg-bg-secondary p-8 md:p-12 rounded-xl border border-border-accent/40 transition-theme flex flex-col gap-6">
          <div>
            <span className="inline-block bg-bg-primary text-fg-primary text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-full border border-border-accent/30">
              {category}
            </span>
          </div>
          <h1 className="font-dm-sans text-3xl md:text-4xl font-bold tracking-tight text-fg-primary leading-tight">
            {post!.title}
          </h1>
          <p className="text-sm md:text-base text-fg-secondary leading-relaxed font-medium">
            {post!.summary}
          </p>
          <div>
            <a
              href="#post-content"
              className="inline-flex items-center justify-center bg-fg-primary text-bg-primary px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-sm"
            >
              Read Article ↗
            </a>
          </div>
        </div>

        {/* Metadata Card */}
        <div className="bg-bg-secondary border border-border-accent/40 rounded-xl p-6 flex justify-between items-center transition-theme">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-fg-secondary">Category</span>
            <span className="text-sm font-bold text-fg-primary capitalize">{category}</span>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <span className="text-[10px] uppercase tracking-widest text-fg-secondary">Reading Time</span>
            <span className="text-sm font-bold text-fg-primary">{readTimeFormatted}</span>
          </div>
        </div>

        {/* Content Card */}
        <div
          id="post-content"
          className="bg-bg-secondary p-8 md:p-12 rounded-xl border border-border-accent/40 transition-theme scroll-mt-24"
        >
          <div
            className="prose dark:prose-invert max-w-none text-fg-secondary text-sm md:text-base leading-relaxed space-y-6
              [&_h2]:text-fg-primary [&_h2]:font-bold [&_h2]:text-xl [&_h2]:mt-6 [&_h2]:mb-3
              [&_h3]:text-fg-primary [&_h3]:font-bold [&_h3]:text-base [&_h3]:mt-5 [&_h3]:mb-2
              [&_strong]:text-fg-primary
              [&_a]:text-fg-primary [&_a]:underline
              [&_ul]:list-disc [&_ul]:pl-5
              [&_ol]:list-decimal [&_ol]:pl-5
              [&_blockquote]:border-l-4 [&_blockquote]:border-border-accent [&_blockquote]:pl-4 [&_blockquote]:italic"
            dangerouslySetInnerHTML={{ __html: post!.content }}
          />
        </div>

        {/* Social Share */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { name: 'Pinterest', href: 'https://pinterest.com' },
            { name: 'Facebook', href: 'https://facebook.com' },
            { name: 'Instagram', href: 'https://instagram.com' },
          ].map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-bg-secondary border border-border-accent/40 rounded-xl py-5 px-6 flex justify-between items-center transition-theme group hover:border-fg-primary/30"
            >
              <span className="font-dm-sans text-xs font-bold text-fg-primary uppercase tracking-widest">{social.name}</span>
              <span className="text-fg-secondary group-hover:text-fg-primary transition-colors text-xs font-medium">↗</span>
            </a>
          ))}
        </div>

        {/* Related Articles */}
        {related.length > 0 && (
          <>
            <div className="w-full bg-bg-secondary border border-border-accent/40 rounded-xl py-4 px-6 flex justify-between items-center transition-theme">
              <h3 className="font-dm-sans text-xs font-bold text-fg-primary uppercase tracking-widest">Related Articles ↗</h3>
              <Link href="/blog" className="text-[10px] font-bold uppercase tracking-wider text-fg-secondary hover:text-fg-primary transition-colors">View All</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-12">
              {related.map((p) => (
                <div key={p.slug} className="aspect-[3/4] relative rounded-xl overflow-hidden group border border-border-accent/40 bg-bg-secondary transition-theme">
                  {p.image && (
                    <img src={p.image} alt={p.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.01]" />
                  )}
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors duration-300" />
                  <div className="absolute left-3 right-3 bottom-[-78px] md:bottom-[-78px] group-hover:bottom-3 max-md:bottom-3 transition-all duration-300 ease-out bg-bg-primary rounded-lg p-5 flex items-center justify-between shadow-xl z-10 transition-theme border border-border-accent/20">
                    <span className="font-dm-sans font-bold text-fg-primary text-sm tracking-tight transition-colors line-clamp-1 mr-4">{p.title}</span>
                    <Link href={`/blog/${p.slug}`} className="relative pb-0.5 text-xs font-bold uppercase tracking-wider text-fg-primary hover:text-fg-secondary group/btn transition-colors flex-shrink-0">
                      Read
                      <span className="absolute bottom-0 left-0 w-full h-[1px] bg-fg-primary transition-colors group-hover/btn:bg-fg-secondary" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </div>

    </div>
  );
}
