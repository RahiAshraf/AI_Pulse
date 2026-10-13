import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  type AuthError,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { auth, db } from "@/lib/firebase";
import { branches, registrationSchema, sections, years } from "@/lib/validation";
import type { RegistrationValues } from "@/lib/validation";

const authErrorMessages: Record<string, string> = {
  "auth/email-already-in-use": "This email is already registered. Please log in or use a different college email.",
  "auth/invalid-email": "Please enter a valid MITS email address.",
  "auth/weak-password": "Password is too weak. Use at least 6 characters.",
  "auth/network-request-failed": "Network issue while creating your account. Please check your connection and try again.",
};

export function RegistrationForm() {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: "",
      rollNumber: "",
      email: "",
      phone: "",
      branch: "",
      year: "",
      section: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegistrationValues) => {
    setSubmitError(null);

    const email = values.email.trim().toLowerCase();
    const rollNumber = values.rollNumber.trim();
    const normalizedRollNumber = rollNumber.toLowerCase();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, values.password);

      try {
        await setDoc(doc(db, "rollNumbers", normalizedRollNumber), {
          uid: userCredential.user.uid,
          rollNumber,
        });
      } catch (rollNumberError) {
        await deleteUser(userCredential.user).catch(() => undefined);
        const errorCode = (rollNumberError as { code?: string })?.code;
        setSubmitError(
          errorCode === "permission-denied"
            ? "This roll number is already registered or cannot be used."
            : "We could not verify this roll number. Please try again.",
        );
        return;
      }

      try {
        await setDoc(doc(db, "students", userCredential.user.uid), {
          uid: userCredential.user.uid,
          name: values.fullName.trim(),
          rollNumber,
          email,
          phone: values.phone.trim(),
          programme: values.branch,
          year: values.year,
          section: values.section,
          status: "active",
          registeredAt: serverTimestamp(),
        });
      } catch (firestoreError) {
        await deleteUser(userCredential.user).catch(() => undefined);
        console.error("Firestore profile creation failed:", firestoreError);
        setSubmitError("We could not create your profile. Please try again.");
        return;
      }

      setIsSuccess(true);
      toast.success("Registration successful.");
    } catch (error) {
      const firebaseError = error as AuthError;
      const friendlyMessage = authErrorMessages[firebaseError?.code ?? ""] ?? "Unable to create your account. Please try again.";
      setSubmitError(friendlyMessage);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-6 rounded-xl border border-border/60 bg-background/80 p-6 text-center shadow-sm">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-pulse uppercase">Registration Successful</p>
          <h2 className="text-2xl font-bold tracking-wide text-foreground">Welcome to AI Learning Hub!</h2>
          <p className="text-sm text-muted-foreground">Your account has been created successfully.</p>
        </div>

        <Button
          type="button"
          variant="hero"
          size="xl"
          className="w-full"
          onClick={() => navigate({ to: "/login" })}
        >
          LOGIN TO AI LEARNING HUB
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 sm:grid-cols-2">
      <Field label="Full Name" error={errors.fullName?.message}>
        <Input placeholder="Enter your full name" autoComplete="name" {...register("fullName")} />
      </Field>

      <Field label="Roll Number" error={errors.rollNumber?.message}>
        <Input placeholder="e.g. 23XXXXXXXX" {...register("rollNumber")} />
      </Field>

      <Field label="College Email" error={errors.email?.message}>
        <Input type="email" placeholder="you@mits.ac.in" autoComplete="email" {...register("email")} />
      </Field>

      <Field label="Phone Number" error={errors.phone?.message}>
        <Input inputMode="numeric" placeholder="10-digit number" {...register("phone")} />
      </Field>

      <Field label="UG PROGRAMME / BRANCH" error={errors.branch?.message}>
        <Select value={watch("branch")} onValueChange={(v) => setValue("branch", v, { shouldValidate: true })}>
          <SelectTrigger>
            <SelectValue placeholder="Select programme / branch" />
          </SelectTrigger>
          <SelectContent>
            {branches.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-5">
        <Field label="Year" error={errors.year?.message}>
          <Select value={watch("year")} onValueChange={(v) => setValue("year", v, { shouldValidate: true })}>
            <SelectTrigger>
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Section" error={errors.section?.message}>
          <Select value={watch("section")} onValueChange={(v) => setValue("section", v, { shouldValidate: true })}>
            <SelectTrigger>
              <SelectValue placeholder="Section" />
            </SelectTrigger>
            <SelectContent>
              {sections.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="Password" error={errors.password?.message}>
        <Input
          type="password"
          placeholder="Minimum 6 characters"
          autoComplete="new-password"
          {...register("password")}
        />
      </Field>

      <Field label="Confirm Password" error={errors.confirmPassword?.message}>
        <Input
          type="password"
          placeholder="Re-enter password"
          autoComplete="new-password"
          {...register("confirmPassword")}
        />
      </Field>

      <div className="sm:col-span-2">
        {submitError ? (
          <p className="mb-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {submitError}
          </p>
        ) : null}

        <Button type="submit" variant="hero" size="xl" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="inline-flex items-center justify-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Creating account...
            </span>
          ) : (
            "Join AI Learning Hub"
          )}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}