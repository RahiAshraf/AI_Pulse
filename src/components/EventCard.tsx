import { CalendarDays, Clock3, MapPin, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LearningEvent } from "@/types";

function deadlinePassed(event: LearningEvent) {
  const deadline = new Date(event.registrationDeadline).getTime();
  return !Number.isNaN(deadline) && Date.now() > deadline;
}

export function EventCard({
  event,
  registered,
  onView,
  onRegister,
  isRegistering,
}: {
  event: LearningEvent;
  registered: boolean;
  onView: (event: LearningEvent) => void;
  onRegister: (event: LearningEvent) => void;
  isRegistering: boolean;
}) {
  const closed = deadlinePassed(event);
  const full = event.capacity > 0 && event.registrationCount >= event.capacity;
  const unavailable = !event.active || closed || full;
  return (
    <article className="event-card group overflow-hidden">
      {event.posterUrl ? (
        <img
          src={event.posterUrl}
          alt={`${event.title} poster`}
          className="aspect-[16/9] w-full object-cover"
        />
      ) : (
        <div className="grid aspect-[16/9] place-items-center bg-secondary text-xs tracking-[0.16em] text-muted-foreground uppercase">
          AI PULSE EVENT
        </div>
      )}
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-bold tracking-wide uppercase">{event.title}</h3>
          <span className="shrink-0 rounded-full border border-cyan/30 bg-cyan/10 px-2 py-1 text-[10px] font-semibold tracking-[0.12em] text-cyan uppercase">
            {event.registrationCount}
            {event.capacity ? ` / ${event.capacity}` : ""}
          </span>
        </div>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {event.description}
        </p>
        <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="size-4 text-cyan" />
            {event.date}
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock3 className="size-4 text-cyan" />
            {event.time}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="size-4 text-cyan" />
            {event.venue}
          </span>
          <span className="inline-flex items-center gap-2">
            <UserRound className="size-4 text-cyan" />
            {event.organizer}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => onView(event)}>
            View Details
          </Button>
          <Button
            variant="neon"
            disabled={registered || unavailable || isRegistering}
            onClick={() => onRegister(event)}
          >
            {registered
              ? "Registered"
              : full
                ? "Event Full"
                : closed || !event.active
                  ? "Registration Closed"
                  : isRegistering
                    ? "Registering..."
                    : "Register"}
          </Button>
        </div>
      </div>
    </article>
  );
}
