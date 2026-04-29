"use client";

interface Props {
  count: number;
}

export function MatrixOverflowButton({ count }: Props) {
  return (
    <button
      onClick={() => console.log(`[Matrix] expand quadrant: +${count} more`)}
      className="text-tiny text-left px-2 py-1 outline-none"
      style={{ color: "var(--text-muted)" }}
    >
      +{count} more
    </button>
  );
}
