import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import MainWrapper from '@/components/main-wrapper';
import SocialBar from '@/components/social-bar';
import DynamicBody from '@/components/dynamic-body';
import { CollectionProvider } from '@/context/CollectionContext';
import { ProductProvider } from '@/context/ProductContext';
import { UserProvider } from '@/context/UserContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { ToastProvider } from '@/context/ToastContext';
import { CurrencyProvider } from '@/context/CurrencyContext';

export const metadata: Metadata = {
  title: 'Future Milestone - Scandinavian Furniture',
  description: 'A clean and modern Framer E-Commerce template with local state. Designed for flexibility, responsiveness, and premium aesthetics.',
  openGraph: {
    title: 'Future Milestone - Scandinavian Furniture',
    description: 'A clean and modern Framer E-Commerce template ported to Next.js and Tailwind CSS.',
    images: ['/images/1p2B6gt3Cs8RGOysOJc9iQ2xaIg_d5da0f.webp'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <SettingsProvider>
        <DynamicBody>
          <CollectionProvider>
            <ProductProvider>
              <UserProvider>
                <CurrencyProvider>
                <ToastProvider>
                <div className="flex-grow flex flex-col bg-bg-primary rounded-2xl relative overflow-hidden transition-theme">
                  <Navbar />
                  <MainWrapper>
                    {children}
                  </MainWrapper>
                  <SocialBar />
                  <Footer />
                </div>
              </ToastProvider>
                </CurrencyProvider>
              </UserProvider>
            </ProductProvider>
          </CollectionProvider>
        </DynamicBody>
      </SettingsProvider>
    </html>
  );
}
