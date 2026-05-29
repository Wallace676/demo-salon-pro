import { useEffect, useRef } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";

const LAST_ROUTE_KEY = "bs_last_route_v1";

// Don't restore these — they're transient/auth flows
const SKIP_PATHS = ["/login", "/signup"];

export function RoutePersistence() {
  const router = useRouter();
  const location = useRouterState({ select: (s) => s.location });
  const restoredRef = useRef(false);

  // Restore once on first mount, only if currently on "/"
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(LAST_ROUTE_KEY);
      if (saved && window.location.pathname === "/" && saved !== "/" && !SKIP_PATHS.includes(saved)) {
        router.navigate({ to: saved, replace: true });
      }
    } catch {}

    // Register Service Worker — but NOT inside the Lovable editor preview
    // iframe/preview hosts, where a caching SW would serve stale builds.
    const isInIframe = (() => {
      try {
        return window.self !== window.top;
      } catch {
        return true;
      }
    })();
    const host = window.location.hostname;
    const isPreviewHost =
      host.includes("id-preview--") ||
      host.includes("lovableproject.com") ||
      host.includes(".lovable.app") && host.includes("-dev");

    if (isPreviewHost || isInIframe) {
      navigator.serviceWorker?.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      }).catch(() => {});
    } else if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      });
    }
  }, [router]);

  // Persist on every change
  useEffect(() => {
    if (typeof window === "undefined") return;
    const path = location.pathname + (location.searchStr || "");
    try {
      localStorage.setItem(LAST_ROUTE_KEY, path);
    } catch {}
  }, [location]);

  return null;
}
