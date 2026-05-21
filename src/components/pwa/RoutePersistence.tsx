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
      if (!saved) return;
      if (window.location.pathname !== "/") return;
      if (saved === "/" || SKIP_PATHS.includes(saved)) return;
      router.navigate({ to: saved, replace: true });
    } catch {}
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
