import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, db } from "@/lib/firebase";
import { loginSchema } from "@/lib/validation";
import type { LoginValues } from "@/lib/validation";
import { doc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword, signOut, type AuthError } from "firebase/auth";

const authErrorMessages: Record<string, string> = {
  "auth/invalid-credential": "Invalid email or password. Please try again.",
  "auth/user-not-found": "No account found for this email.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/invalid-email": "Please enter a valid MITS email address.",
  "auth/operation-not-allowed":
    "Email/password sign-in is disabled in Firebase. Enable it in Firebase Authentication.",
  "auth/configuration-not-found":
    "Firebase Authentication is not configured for this project. Check the Firebase settings.",
  "auth/too-many-requests": "Too many sign-in attempts. Please wait a moment and try again.",
  "auth/network-request-failed": "Network issue while signing in. Please check your connection and try again.",
};

export function LoginForm({
  emailLabel = "College Email",
  submitLabel = "Login",
  variant = "student",
}: {
  emailLabel?: string;
  submitLabel?: string;
  variant?: "student" | "admin";
}) {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    setLoginError(null);

    try {
      // STEP 1: Firebase Authentication
      console.log("=== AUTH SIGN-IN START ===");
      console.log("Email:", values.email.trim().toLowerCase());

      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email.trim().toLowerCase(),
        values.password,
      );

      console.log("=== AUTH SIGN-IN SUCCESS ===");
      console.log("UID:", userCredential.user.uid);
      console.log("Email:", userCredential.user.email);


      // Check the profile required by this login page
      if (variant === "admin") {
        const adminSnap = await getDoc(
          doc(db, "admins", userCredential.user.uid)
        );

        if (
          adminSnap.exists() &&
          adminSnap.data()?.active === true &&
          adminSnap.data()?.role === "admin"
        ) {
          navigate({ to: "/admin", replace: true });
          return;
        }

        await signOut(auth);
        setLoginError("This account is not an active administrator.");
        return;
      }

      const studentSnap = await getDoc(
        doc(db, "students", userCredential.user.uid)
      );

      if (studentSnap.exists()) {
        navigate({ to: "/student/dashboard", replace: true });
        return;
      }

      await signOut(auth);
      setLoginError("No student profile was found for this account.");

    } catch (error) {
      const firebaseError = error as AuthError;
      console.error("=== AUTH ERROR ===");
      console.error("Firebase auth error:", firebaseError.code, firebaseError.message);
      const friendlyMessage =
        authErrorMessages[firebaseError?.code ?? ""] ?? "Unable to sign in. Please try again.";
      setLoginError(friendlyMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          {emailLabel}
        </Label>
        <Input type="email" placeholder="email@mits.ac.in" autoComplete="email" {...register("email")} />
        {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          Password
        </Label>
        <Input
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        ) : null}
      </div>

      {loginError ? <p className="text-xs text-destructive">{loginError}</p> : null}

      <Button type="submit" variant="hero" size="xl" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <span className="inline-flex items-center justify-center gap-2">
            <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Signing in...
          </span>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}