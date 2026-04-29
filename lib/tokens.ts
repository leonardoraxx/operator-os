/**
 * Typed reader for CSS custom properties.
 * Server-safe (returns empty string when document is unavailable).
 * Used by chart components and any code that needs runtime token values.
 *
 * Components consuming static tokens should reference them via
 * `style={{ color: "var(--text-primary)" }}` directly — this reader
 * is only for code that can't accept a CSS-var string (e.g. Recharts
 * fill/stroke props that are sometimes computed numerically).
 */

export const TOKEN_NAMES = [
  "--bg-canvas",
  "--bg-canvas-elevated",
  "--bg-glass",
  "--bg-glass-elevated",
  "--bg-glass-subtle",
  "--border-subtle",
  "--border-default",
  "--border-strong",
  "--text-primary",
  "--text-secondary",
  "--text-muted",
  "--text-subtle",
  "--accent",
  "--accent-strong",
  "--accent-soft",
  "--on-accent",
  "--status-success",
  "--status-success-bg",
  "--status-warning",
  "--status-warning-bg",
  "--status-danger",
  "--status-danger-bg",
  "--status-info",
  "--status-info-bg",
] as const;

export type TokenName = (typeof TOKEN_NAMES)[number];

export type TokenMap = Record<TokenName, string>;

export function readToken(name: TokenName): string {
  if (typeof document === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function readTokens(): TokenMap {
  const map = {} as TokenMap;
  if (typeof document === "undefined") {
    for (const name of TOKEN_NAMES) map[name] = "";
    return map;
  }
  const styles = getComputedStyle(document.documentElement);
  for (const name of TOKEN_NAMES) {
    map[name] = styles.getPropertyValue(name).trim();
  }
  return map;
}
