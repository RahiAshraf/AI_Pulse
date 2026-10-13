import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { sendPasswordResetEmail } from "firebase/auth";
import { SiteLayout } from "@/layouts/SiteLayout";
import { MitsLogo } from "@/components/MitsLogo";
import { LoginForm } from "@/components/LoginForm";
import { auth } from "@/lib/firebase";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — AI PULSE | AI Learning Hub, MITS" },
      {
        name: "description",
        content: "Sign in to your AI Learning Hub student account at MITS.",
      },
      { property: "og:title", content: "Login — AI PULSE | AI Learning Hub, MITS" },
      {
        property: "og:description",
        content: "Member sign-in for the AI Learning Hub at MITS.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const handleForgotPassword = async () => {
    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement | null;
    const email = emailInput?.value.trim().toLowerCase() ?? "";

    if (!email) {
      toast.error("Enter your college email first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent. Check your inbox.");
    } catch (error) {
      const code = (error as { code?: string })?.code;

      if (code === "auth/invalid-email") {
        toast.error("Please enter a valid MITS email address.");
        return;
      }

      if (code === "auth/user-not-found") {
        toast.error("No student account found for this email.");
        return;
      }

      if (code === "auth/network-request-failed") {
        toast.error("Network issue while sending the reset email. Please try again.");
        return;
      }

      toast.error("Unable to send the password reset email. Please try again.");
    }
  };

  return (
    <SiteLayout>
      <section className="section-pad">
        <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
          <div className="glass grid-circuit relative overflow-hidden p-6 sm:p-8">
            <div className="absolute -top-20 -left-16 size-56 rounded-full bg-[image:var(--gradient-pulse)] opacity-20 blur-3xl" />
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <MitsLogo className="h-14" />
                <h1 className="mt-6 text-2xl font-bold tracking-wide uppercase">
                  <span className="text-pulse">Welcome Back</span>
                </h1>
                <p className="mt-2 text-xs font-semibold tracking-[0.3em] text-cyan uppercase">
                  AI Learning Hub
                </p>
              </div>

              <div className="mt-8">
                <LoginForm />
              </div>

              <div className="mt-6 space-y-2 text-center text-sm">
                <button
                  type="button"
                  className="text-muted-foreground transition-colors hover:text-cyan"
                  onClick={handleForgotPassword}
                >
                  Forgot Password?
                </button>
                <p className="text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link to="/join" className="font-semibold text-cyan hover:underline">
                    Join AI Learning Hub
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}