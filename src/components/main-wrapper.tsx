'use client';

import { usePathname } from 'next/navigation';

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main className={`flex-grow w-full transition-all duration-300 ${pathname === '/' || pathname === '/about' || pathname === '/contact' || pathname === '/faq' || pathname === '/account' || pathname.startsWith('/checkout') || pathname.startsWith('/blog') ? 'pt-0' : 'pt-24'
      }`}>
      {children}
    </main>
  );
}
