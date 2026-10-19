import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/layouts/SiteLayout";
import { MitsLogo } from "@/components/MitsLogo";
import { RegistrationForm } from "@/components/RegistrationForm";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title: "Join AI Learning Hub — AI PULSE | MITS" },
      {
        name: "description",
        content:
          "Register as a member of the AI Learning at Madanapalle Institute of Technology & Science.",
      },
      { property: "og:title", content: "Join AI Learning Hub - MITS" },
      {
        property: "og:description",
        content: "Become a member of the AI Learning Hub Community at MITS.",
      },
    ],
  }),
  component: JoinPage,
});

function JoinPage() {
  return (
    <SiteLayout>
      <section className="section-pad">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="glass grid-circuit relative overflow-hidden p-6 sm:p-10">
            <div className="absolute -top-24 -right-16 size-64 rounded-full bg-[image:var(--gradient-pulse)] opacity-20 blur-3xl" />
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <MitsLogo className="h-16" />
                <h1 className="mt-6 text-2xl font-bold tracking-wide uppercase sm:text-3xl">
                  <span className="text-pulse">Join AI Learning Hub</span>
                </h1>
                <p className="mt-3 text-sm text-muted-foreground">
                  Become a member of the AI Learning Hub community.
                </p>
              </div>

              <div className="mt-10">
                <RegistrationForm />
              </div>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-cyan hover:underline">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}