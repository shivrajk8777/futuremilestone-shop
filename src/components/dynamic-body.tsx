'use client';

import React from 'react';

export default function DynamicBody({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <body className="px-3 antialiased min-h-screen bg-bg-secondary transition-theme flex flex-col">
      {children}
    </body>
  );
}

