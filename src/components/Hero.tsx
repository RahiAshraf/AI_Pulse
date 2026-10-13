import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { NeuralVisual } from "@/components/NeuralVisual";
import { MitsLogo } from "@/components/MitsLogo";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="grid-circuit pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div>
          <div className="glass inline-flex items-center gap-3 px-3 py-2">
            <MitsLogo className="h-7" />
            <span className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
              Madanapalle Institute of Technology &amp; Science
            </span>
          </div>

          <h1 className="mt-7 font-display text-5xl font-black tracking-[0.08em] sm:text-6xl lg:text-7xl">
            <span className="text-pulse">AI PULSE</span>
          </h1>
          <p className="mt-3 text-lg font-semibold tracking-[0.3em] uppercase sm:text-xl">
            <span className="text-gold-grad">AI Learning Hub</span>
          </p>
          <p className="mt-4 text-xs font-semibold tracking-[0.4em] text-cyan uppercase sm:text-sm">
            Learn • Explore • Innovate
          </p>

          <p className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground">
            A student-driven AI community where students can learn, explore emerging technologies,
            discover practical AI tools and build innovative ideas together.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="hero" size="xl">
              <Link to="/join">Join AI Learning Hub</Link>
            </Button>
            <Button asChild variant="neon" size="xl">
              <Link to="/meetings">View Meetings</Link>
            </Button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg animate-float-slow">
          <NeuralVisual className="aspect-square w-full" />
        </div>
      </div>
    </section>
  );
}