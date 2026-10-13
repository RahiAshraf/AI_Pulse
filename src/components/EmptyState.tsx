import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="glass grid-circuit flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="inline-flex size-14 items-center justify-center rounded-full border border-cyan/30 bg-background/60 text-cyan">
        <Icon className="size-6" />
      </span>
      <p className="mt-5 text-sm font-semibold tracking-[0.14em] uppercase">{title}</p>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}