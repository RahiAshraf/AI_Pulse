import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="section-pad">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass grid-circuit relative overflow-hidden px-6 py-14 text-center sm:px-12">
          <div className="absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-[image:var(--gradient-pulse)] opacity-25 blur-3xl" />
          <div className="relative">
            <h2 className="text-2xl font-bold tracking-wide uppercase sm:text-3xl">
              <span className="text-pulse">Be part of the AI Pulse</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
              Join the AI Learning Hub and grow with a student community focused on learning,
              exploring and building with Artificial Intelligence.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild variant="hero" size="xl">
                <Link to="/join">Join AI Learning Hub</Link>
              </Button>
              <Button asChild variant="neon" size="xl">
                <Link to="/meetings">View Meetings</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}