import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MitsLogo } from "@/components/MitsLogo";
import { NotificationButton } from "@/components/NotificationButton";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/meetings", label: "Meetings" },
  { to: "/#events", label: "Events" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-3" onClick={() => setOpen(false)}>
          <MitsLogo className="h-9 sm:h-10" />
          <span className="flex flex-col leading-none">
            <span className="whitespace-nowrap font-display text-base font-bold tracking-[0.2em]">
              <span className="text-pulse">AI PULSE</span>
            </span>
            <span className="mt-1 text-[9px] tracking-[0.22em] text-muted-foreground uppercase">
              AI Learning Hub
            </span>
          </span>
        </Link>

        <ul className="hidden items-center gap-5 lg:gap-8 md:flex">
          {navLinks.map((l) =>
            l.to === "/#events" ? (
              <li key={l.to}>
                <a
                  href="/#events"
                  className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase transition-colors hover:text-foreground"
                >
                  {l.label}
                </a>
              </li>
            ) : (
              <li key={l.to}>
                <Link
                  to={l.to}
                  activeOptions={{ exact: l.to === "/" }}
                  activeProps={{ className: "text-cyan" }}
                  inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
                  className="text-xs font-semibold tracking-[0.18em] uppercase transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ),
          )}
        </ul>

        <div className="hidden shrink-0 items-center gap-2 lg:gap-3 md:flex">
          <NotificationButton />
          <Button asChild variant="hero" size="sm" className="h-9 px-3 lg:px-4">
            <Link to="/join">Join AI Learning Hub</Link>
          </Button>
          <Button asChild variant="neon" size="sm" className="h-9 px-3 lg:px-4">
            <Link to="/login">Login</Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-10 items-center justify-center rounded-lg border border-border text-foreground md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open ? (
        <div className="border-t border-border bg-background/95 px-4 py-4 backdrop-blur-xl md:hidden">
          <ul className="flex flex-col gap-1">
            {navLinks.map((l) =>
              l.to === "/#events" ? (
                <li key={l.to}>
                  <a
                    href="/#events"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-3 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase"
                  >
                    {l.label}
                  </a>
                </li>
              ) : (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    onClick={() => setOpen(false)}
                    activeOptions={{ exact: l.to === "/" }}
                    activeProps={{ className: "text-cyan" }}
                    className="block rounded-lg px-3 py-3 text-xs font-semibold tracking-[0.18em] uppercase"
                  >
                    {l.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
          <div className="mt-4 flex flex-col gap-3">
            <NotificationButton onClickCallback={() => setOpen(false)} />
            <Button asChild variant="hero" onClick={() => setOpen(false)}>
              <Link to="/join">Join AI Learning Hub</Link>
            </Button>
            <Button asChild variant="neon" onClick={() => setOpen(false)}>
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
