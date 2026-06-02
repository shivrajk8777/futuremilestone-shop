"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { getPageAssets, getPageComponent } from "../../lib/page-registry";

export default function PageClientShell({ pageName }) {
  const [mounted, setMounted] = useState(false);
  const PageComponent = getPageComponent(pageName);
  const assets = getPageAssets(pageName);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !PageComponent) {
    return null;
  }

  return (
    <>
      <link href={assets.cssHref} rel="stylesheet" />
      <PageComponent />
      <Script
        src="https://framerusercontent.com/sites/sBirGZiDbsdgIGpBpsXaC/script_main.B-4lJfzb.mjs"
        strategy="afterInteractive"
        type="module"
      />
      <Script src={assets.jsHref} strategy="afterInteractive" />
    </>
  );
}
