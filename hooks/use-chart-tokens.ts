"use client";

import { useEffect, useState } from "react";
import { useMounted } from "./use-mounted";
import { readTokens, type TokenMap } from "@/lib/tokens";

/**
 * Reads chart-relevant CSS variables from :root and re-reads them
 * whenever the theme class on <html> changes.
 *
 * Phase 1 token names from globals.css (Pearl/Graphite system).
 * Legacy callers receiving { text, textMuted, accent, ... } continue
 * to work via the mapped output below.
 */
export interface ChartTokens {
  text: string;
  textMuted: string;
  textSubtle: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  gridLine: string;
  border: string;
  bgGlass: string;
}

const SSR_FALLBACK: ChartTokens = {
  text: "#F2F2F4",
  textMuted: "#7A7A80",
  textSubtle: "#50505A",
  accent: "#D4A24C",
  success: "#6FA181",
  warning: "#C9A05A",
  danger: "#C57676",
  gridLine: "rgba(255,255,255,0.05)",
  border: "rgba(255,255,255,0.08)",
  bgGlass: "rgba(28,28,32,0.40)",
};

function mapTokens(t: TokenMap): ChartTokens {
  return {
    text: t["--text-primary"] || SSR_FALLBACK.text,
    textMuted: t["--text-muted"] || SSR_FALLBACK.textMuted,
    textSubtle: t["--text-subtle"] || SSR_FALLBACK.textSubtle,
    accent: t["--accent"] || SSR_FALLBACK.accent,
    success: t["--status-success"] || SSR_FALLBACK.success,
    warning: t["--status-warning"] || SSR_FALLBACK.warning,
    danger: t["--status-danger"] || SSR_FALLBACK.danger,
    gridLine: t["--border-subtle"] || SSR_FALLBACK.gridLine,
    border: t["--border-default"] || SSR_FALLBACK.border,
    bgGlass: t["--bg-glass"] || SSR_FALLBACK.bgGlass,
  };
}

export function useChartTokens(): ChartTokens {
  const mounted = useMounted();
  const [tokens, setTokens] = useState<ChartTokens>(SSR_FALLBACK);

  useEffect(() => {
    if (!mounted) return;

    const refresh = () => setTokens(mapTokens(readTokens()));
    refresh();

    const observer = new MutationObserver(refresh);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, [mounted]);

  return tokens;
}
