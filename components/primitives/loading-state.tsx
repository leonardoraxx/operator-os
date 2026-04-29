import { cn } from "@/lib/cn";

interface SkeletonProps {
  className?: string;
}

function Block({ className }: SkeletonProps) {
  return (
    <div
      className={cn("rounded animate-shimmer", className)}
      aria-hidden
    />
  );
}

export function SkeletonRow({ className }: SkeletonProps) {
  return (
    <div className={cn("flex items-center gap-3 h-11 px-2", className)}>
      <Block className="w-7 h-7 rounded-lg" />
      <div className="flex-1 flex flex-col gap-1.5">
        <Block className="h-3 w-1/2" />
        <Block className="h-2.5 w-1/3" />
      </div>
      <Block className="h-3 w-12" />
    </div>
  );
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div
      className={cn("rounded-[var(--radius-card)] p-5 flex flex-col gap-3", className)}
      style={{
        background: "var(--bg-glass)",
        border: "1px solid var(--border-default)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <Block className="h-3 w-1/3" />
      <Block className="h-7 w-1/2" />
      <Block className="h-2.5 w-1/4" />
    </div>
  );
}

export function SkeletonChart({ className, height = 160 }: SkeletonProps & { height?: number }) {
  return (
    <div
      className={cn("rounded animate-shimmer w-full", className)}
      style={{ height }}
      aria-hidden
    />
  );
}
