'use client';

import { usePathname } from 'next/navigation';
import { useSettings } from '@/context/SettingsContext';

export default function DynamicBody({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { settings, loading } = useSettings();
  const isHome = pathname === '/';

  const showMarquee = !loading && settings.marqueeVisible;

  // Homepage with marquee visible classes: px-3 pt-6 antialiased min-h-screen p-[12px] bg-bg-secondary transition-theme flex flex-col
  // Homepage with marquee hidden OR other pages classes: px-3 antialiased min-h-screen bg-bg-secondary transition-theme flex flex-col (remove pt-6 and p-[12px])
  const bodyClassName = (isHome && showMarquee)
    ? 'px-3 pt-6 antialiased min-h-screen p-[12px] bg-bg-secondary transition-theme flex flex-col'
    : 'px-3 antialiased min-h-screen bg-bg-secondary transition-theme flex flex-col';

  return <body className={bodyClassName}>{children}</body>;
}
