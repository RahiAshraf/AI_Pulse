import { Link } from "@tanstack/react-router";
import { MitsLogo } from "@/components/MitsLogo";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/meetings", label: "Meetings" },
  { to: "/join", label: "Join" },
] as const;

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <MitsLogo className="h-11" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-base font-bold tracking-[0.2em]">
                <span className="text-pulse">AI PULSE</span>
              </span>
              <span className="mt-1 text-[9px] tracking-[0.22em] text-muted-foreground uppercase">
                AI Learning Hub
              </span>
            </span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Madanapalle Institute of Technology &amp; Science
          </p>
          <p className="mt-1 text-xs tracking-[0.2em] text-cyan uppercase">
            Learn • Explore • Innovate
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold tracking-[0.2em] uppercase">Explore</h3>
          <ul className="mt-4 space-y-2">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="text-sm text-muted-foreground transition-colors hover:text-cyan"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold tracking-[0.2em] uppercase">Institution</h3>
          <a
            href="https://mits.ac.in"
            target="_blank"
            rel="noreferrer noopener"
            className="mt-4 inline-block text-sm text-muted-foreground transition-colors hover:text-cyan"
          >
            mits.ac.in
          </a>
        </div>
      </div>

      <div className="border-t border-border px-4 py-5 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
        AI PULSE — AI Learning Hub · Madanapalle Institute of Technology &amp; Science
      </div>
    </footer>
  );
}