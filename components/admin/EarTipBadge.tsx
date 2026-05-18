"use client";

export default function EarTipBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
      <svg viewBox="0 0 16 16" width="12" height="12" fill="none">
        <polygon points="4,12 2,2 10,9" fill="#C8C8D8" />
        <polygon points="2,2 4,5 5,3" fill="#FF8C42" />
      </svg>
      TNR ✓
    </span>
  );
}
