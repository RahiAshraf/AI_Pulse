import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { MitsLogo } from "@/components/MitsLogo";
import { LoginForm } from "@/components/LoginForm";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Sign In — AI PULSE | AI Learning Hub" },
      { name: "description", content: "Administrator sign-in for the AI Learning Hub at MITS." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Sign In — AI PULSE | AI Learning Hub" },
      { property: "og:description", content: "Administrator access to the AI Learning Hub console." },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  return (
    <div className="grid-circuit flex min-h-screen items-center justify-center px-4 py-16">
      <div className="glass relative w-full max-w-md overflow-hidden p-6 sm:p-8">
        <div className="absolute -top-24 right-0 size-56 rounded-full bg-[image:var(--gradient-pulse)] opacity-20 blur-3xl" />
        <div className="relative">
          <div className="flex flex-col items-center text-center">
            <MitsLogo className="h-14" />
            <h1 className="mt-6 text-xl font-bold tracking-wide uppercase sm:text-2xl">
              <span className="text-pulse">AI Learning Hub Admin</span>
            </h1>
            <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[10px] font-semibold tracking-[0.16em] text-gold uppercase">
              <ShieldCheck className="size-3.5" />
              Admin access only
            </p>
          </div>

          <div className="mt-8">
            <LoginForm emailLabel="Email" submitLabel="Sign In" variant="admin" />
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/" className="font-semibold text-cyan hover:underline">
              Back to AI Pulse
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}