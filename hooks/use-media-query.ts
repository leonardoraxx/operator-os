"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe media query hook. Always returns `false` during SSR and on
 * the first client render to avoid hydration mismatches; updates after
 * mount.
 *
 * Common queries (align with globals breakpoints):
 *   "(min-width: 640px)"   sm
 *   "(min-width: 768px)"   md
 *   "(min-width: 1024px)"  lg
 *   "(min-width: 1280px)"  xl
 *   "(min-width: 1536px)"  2xl
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setMatches("matches" in e ? e.matches : false);
    };
    handler(mql);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
