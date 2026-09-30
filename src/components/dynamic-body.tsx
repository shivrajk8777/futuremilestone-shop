'use client';

import React from 'react';

export default function DynamicBody({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <body className="px-3 antialiased min-h-screen bg-bg-secondary transition-theme flex flex-col">
      <noscript>
        <iframe
          src="https://www.googletagmanager.com/ns.html?id=GTM-KV2S4JTD"
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
      {children}
    </body>
  );
}

