import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[500px] flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto">
      <div className="space-y-2">
        <span className="text-xs uppercase font-bold tracking-wider text-fg-secondary">Error Code 404</span>
        <h1 className="font-dm-sans text-6xl font-bold tracking-tighter text-fg-primary">Lost in Space</h1>
      </div>
      
      <p className="text-sm text-fg-secondary leading-relaxed">
        The page you are looking for might have been moved, renamed, or is temporarily offline. Let us guide you back to comfortable surroundings.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full pt-4">
        <Link
          href="/"
          className="flex-1 bg-fg-primary text-bg-primary py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity text-center shadow-md"
        >
          Return Home
        </Link>
        <Link
          href="/shop"
          className="flex-1 bg-bg-secondary text-fg-primary border border-border-accent py-3 rounded-lg text-sm font-semibold hover:bg-bg-secondary/70 transition-colors text-center"
        >
          Browse Catalog
        </Link>
      </div>
    </div>
  );
}
