import type { LucideIcon } from "lucide-react";

export function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <article className="glow-card group p-6">
      <span className="inline-flex size-11 items-center justify-center rounded-xl border border-cyan/35 bg-cyan/10 text-cyan transition-colors group-hover:bg-cyan/20">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-5 text-sm font-bold tracking-[0.14em] uppercase">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </article>
  );
}