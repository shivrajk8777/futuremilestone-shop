import "./globals.css";

export const metadata = {
  title: "Fjord - E-Commerce",
  description:
    "A clean and modern e-commerce experience with a flexible, responsive storefront designed to perform well across devices.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
