"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCookieConsent } from "@/lib/cookies/consent";
import { trackPageView } from "@/lib/firestore/analytics";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const { consent, loaded } = useCookieConsent();

  useEffect(() => {
    if (!loaded) return;
    if (!consent?.analiticas) return;
    if (!pathname) return;
    if (pathname.startsWith("/admin")) return; // no contamos visitas al panel
    void trackPageView(pathname);
  }, [pathname, loaded, consent?.analiticas]);

  return null;
}
