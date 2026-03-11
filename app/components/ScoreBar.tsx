"use client";

interface ScoreBarProps {
  label: string;
  value: number; // 1–10
}

/** Displays a labeled progress bar for a score out of 10 */
export default function ScoreBar({ label, value }: ScoreBarProps) {
  const pct = Math.round((value / 10) * 100);

  const color =
    value >= 8
      ? "bg-emerald-500"
      : value >= 5
        ? "bg-amber-400"
        : "bg-red-400";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm font-medium text-zinc-700">
        <span>{label}</span>
        <span>{value}/10</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-zinc-200">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
