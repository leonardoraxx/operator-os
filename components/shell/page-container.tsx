import { cn } from "@/lib/cn";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Page-level wrapper applying max-width and responsive page padding.
 * Replaces ad-hoc `max-w-[1600px] mx-auto` patterns in pages.
 *
 * Padding scale (matches §5.1 of refinement plan):
 *   mobile  16px
 *   sm      24px
 *   lg      32px
 *   2xl     48px
 *
 * Max-width:
 *   ≤xl   1280px
 *   2xl   1480px
 */
export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1400px] 2xl:max-w-[1720px]",
        "px-4 sm:px-6 lg:px-8 2xl:px-12",
        "py-6 lg:py-8 2xl:py-10",
        className,
      )}
    >
      {children}
    </div>
  );
}
