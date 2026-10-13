import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="glow-card p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          {label}
        </p>
        <span className="inline-flex size-9 items-center justify-center rounded-lg border border-cyan/30 bg-cyan/10 text-cyan">
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-4 text-3xl font-bold text-cyan">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}