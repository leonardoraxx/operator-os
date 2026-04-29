import { cn } from "@/lib/cn";

interface SectionGridProps {
  children: React.ReactNode;
  className?: string;
  /** Override gap. Defaults to responsive 16/20/24. */
  gap?: "sm" | "md" | "lg";
}

const GAP = {
  sm: "gap-3",
  md: "gap-4 lg:gap-5 2xl:gap-6",
  lg: "gap-5 lg:gap-6 2xl:gap-8",
} as const;

/**
 * 12-column grid wrapper with documented gap presets.
 * Children use `col-span-{n}` utilities directly.
 */
export function SectionGrid({
  children,
  className,
  gap = "md",
}: SectionGridProps) {
  return (
    <div className={cn("grid grid-cols-12 items-start", GAP[gap], className)}>
      {children}
    </div>
  );
}
