"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

const DEFAULT_UMAMI_WEBSITE_ID = "97da7dd6-c82f-469b-a02a-20201b4df044";

export default function UmamiAnalytics() {
  const pathname = usePathname();

  // Avoid tracking sensitive admin pages or collecting admin session data
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const websiteId =
    process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || DEFAULT_UMAMI_WEBSITE_ID;

  return (
    <Script
      defer
      src="https://cloud.umami.is/script.js"
      data-website-id={websiteId}
      strategy="afterInteractive"
    />
  );
}
