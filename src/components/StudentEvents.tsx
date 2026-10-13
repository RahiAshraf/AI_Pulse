import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { CalendarDays, Clock3, MapPin, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/EmptyState";
import { EventCard } from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEvents } from "@/hooks/useEvents";
import { branches, eventRegistrationSchema, sections, years } from "@/lib/validation";
import type { EventRegistrationValues } from "@/lib/validation";
import type { LearningEvent, Student } from "@/types";

export function StudentEvents({ student = null }: { student?: Student | null }) {
  const navigate = useNavigate();
  const { events, registrations, isLoading, registerForEvent } = useEvents(student);
  const [selected, setSelected] = useState<LearningEvent | null>(null);
  const [registrationEvent, setRegistrationEvent] = useState<LearningEvent | null>(null);
  const [confirmation, setConfirmation] = useState<{
    event: LearningEvent;
    name: string;
    email: string;
  } | null>(null);
  const [registering, setRegistering] = useState<string | null>(null);
  const registeredIds = new Set(registrations.map((registration) => registration.eventId));

  const handleRegister = async (event: LearningEvent) => {
    if (!student) {
      navigate({ to: "/login" });
      return;
    }
    setRegistering(event.id);
    try {
      const registration = await registerForEvent(event);
      setConfirmation({
        event,
        name: registration?.studentName ?? student.fullName,
        email: registration?.studentEmail ?? student.email,
      });
      toast.success("You are registered for this event.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to register for this event.");
    } finally {
      setRegistering(null);
    }
  };

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-sm font-bold tracking-[0.18em] uppercase">AI PULSE Events</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Explore upcoming workshops, talks and community activities.
        </p>
      </div>
      {isLoading ? (
        <div className="glass p-10 text-center text-sm text-muted-foreground">
          Loading events...
        </div>
      ) : events.filter((event) => event.active).length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No upcoming events yet."
          description="New AI PULSE events will appear here when published."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {events
            .filter((event) => event.active)
            .map((event) => (
              <EventCard
                key={event.id}
                event={event}
                registered={registeredIds.has(event.id)}
                onView={setSelected}
                onRegister={handleRegister}
                isRegistering={registering === event.id}
              />
            ))}
        </div>
      )}
      <EventDetails event={selected} onClose={() => setSelected(null)} />
      <GuestRegistrationDialog
        event={registrationEvent}
        student={student}
        isSubmitting={registering === registrationEvent?.id}
        onClose={() => setRegistrationEvent(null)}
        onSubmit={async (values) => {
          if (!registrationEvent) return;
          setRegistering(registrationEvent.id);
          try {
            const registration = await registerForEvent(registrationEvent, values);
            setRegistrationEvent(null);
            setConfirmation({
              event: registrationEvent,
              name: registration?.studentName ?? values.fullName,
              email: registration?.studentEmail ?? values.email,
            });
            toast.success("You are registered for this event.");
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : "Unable to register for this event.",
            );
          } finally {
            setRegistering(null);
          }
        }}
      />
      <RegistrationConfirmation confirmation={confirmation} onClose={() => setConfirmation(null)} />
    </section>
  );
}

function GuestRegistrationDialog({
  event,
  student,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  event: LearningEvent | null;
  student: Student | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: EventRegistrationValues) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventRegistrationValues>({
    resolver: zodResolver(eventRegistrationSchema),
    defaultValues: {
      fullName: "",
      rollNumber: "",
      email: "",
      phone: "",
      branch: "",
      year: "",
      section: "",
    },
  });

  useEffect(() => {
    if (event) {
      reset({
        fullName: student?.fullName ?? "",
        rollNumber: student?.rollNumber ?? "",
        email: student?.email ?? "",
        phone: student?.phone ?? "",
        branch: String(student?.branch ?? ""),
        year: String(student?.year ?? ""),
        section: student?.section ?? "",
      });
    }
  }, [event, reset, student]);

  return (
    <Dialog open={Boolean(event)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Register for {event?.title}</DialogTitle>
          <DialogDescription>
            {student
              ? "Your student profile has filled these details for you."
              : "Register for this event without joining AI Learning Hub."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
          <FormField label="Full Name" error={errors.fullName?.message}>
            <Input {...register("fullName")} />
          </FormField>
          <FormField label="Roll Number" error={errors.rollNumber?.message}>
            <Input {...register("rollNumber")} />
          </FormField>
          <FormField label="Email" error={errors.email?.message}>
            <Input type="email" {...register("email")} />
          </FormField>
          <FormField label="Phone Number" error={errors.phone?.message}>
            <Input inputMode="numeric" {...register("phone")} />
          </FormField>
          <SelectField
            label="Branch"
            value={watch("branch")}
            error={errors.branch?.message}
            options={branches}
            onChange={(value) => setValue("branch", value, { shouldValidate: true })}
          />
          <SelectField
            label="Year"
            value={watch("year")}
            error={errors.year?.message}
            options={years}
            onChange={(value) => setValue("year", value, { shouldValidate: true })}
          />
          <SelectField
            label="Section"
            value={watch("section")}
            error={errors.section?.message}
            options={sections}
            onChange={(value) => setValue("section", value, { shouldValidate: true })}
          />
          <Button type="submit" variant="hero" className="sm:col-span-2" disabled={isSubmitting}>
            {isSubmitting ? "Registering..." : "Register for Event"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  error,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  error: string | undefined;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function RegistrationConfirmation({
  confirmation,
  onClose,
}: {
  confirmation: { event: LearningEvent; name: string; email: string } | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={Boolean(confirmation)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registration Successful!</DialogTitle>
          <DialogDescription>You are registered for {confirmation?.event.title}.</DialogDescription>
        </DialogHeader>
        {confirmation ? (
          <div className="space-y-2 rounded-lg border border-cyan/30 bg-cyan/5 p-4 text-sm">
            <p>
              <span className="text-muted-foreground">Name:</span> {confirmation.name}
            </p>
            <p>
              <span className="text-muted-foreground">Email:</span> {confirmation.email}
            </p>
            <p>
              <span className="text-muted-foreground">When:</span> {confirmation.event.date} at{" "}
              {confirmation.event.time}
            </p>
            <p>
              <span className="text-muted-foreground">Venue:</span> {confirmation.event.venue}
            </p>
          </div>
        ) : null}
        <Button variant="neon" onClick={onClose}>
          Done
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function EventDetails({ event, onClose }: { event: LearningEvent | null; onClose: () => void }) {
  return (
    <Dialog
      open={Boolean(event)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{event?.title}</DialogTitle>
          <DialogDescription>Event details and registration information.</DialogDescription>
        </DialogHeader>
        {event ? (
          <div className="space-y-5">
            {event.posterUrl ? (
              <img
                src={event.posterUrl}
                alt={`${event.title} poster`}
                className="max-h-80 w-full rounded-lg object-cover"
              />
            ) : null}
            <p className="text-sm leading-relaxed text-muted-foreground">{event.description}</p>
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <Detail icon={CalendarDays} label="Date" value={event.date} />
              <Detail icon={Clock3} label="Time" value={event.time} />
              <Detail icon={MapPin} label="Venue" value={event.venue} />
              <Detail icon={UserRound} label="Organizer" value={event.organizer} />
              <div>
                <dt className="text-xs text-muted-foreground">Registration deadline</dt>
                <dd className="mt-1 font-semibold">
                  {event.registrationDeadline
                    ? new Date(event.registrationDeadline).toLocaleString()
                    : "Not specified"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Available seats</dt>
                <dd className="mt-1 font-semibold">
                  {event.capacity > 0
                    ? Math.max(event.capacity - event.registrationCount, 0)
                    : "Unlimited"}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close event details"
          onClick={onClose}
          className="absolute top-4 right-4"
        >
          <X className="size-4" />
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 text-cyan" />
      <div>
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="font-semibold">{value}</dd>
      </div>
    </div>
  );
}
