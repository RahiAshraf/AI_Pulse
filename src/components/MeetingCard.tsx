import { CalendarDays, Clock, DoorOpen, MapPin, UserRound } from "lucide-react";
import type { Meeting } from "@/types";

const statusStyles: Record<Meeting["status"], string> = {
  upcoming: "border-cyan/40 bg-cyan/10 text-cyan",
  completed: "border-gold/40 bg-gold/10 text-gold",
  cancelled: "border-destructive/40 bg-destructive/10 text-destructive",
};

/** Reusable meeting card — renders Firestore `meetings` documents. */
export function MeetingCard({ meeting }: { meeting: Meeting }) {
  return (
    <article className="glow-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-base font-bold tracking-wide uppercase">{meeting.title}</h3>
        <span
          className={`rounded-full border px-3 py-1 text-[10px] font-semibold tracking-[0.16em] uppercase ${statusStyles[meeting.status]}`}
        >
          {meeting.status}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{meeting.description}</p>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CalendarDays className="size-4 text-cyan" />
          <dd>{meeting.date}</dd>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="size-4 text-cyan" />
          <dd>
            {meeting.startTime} – {meeting.endTime}
          </dd>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="size-4 text-cyan" />
          <dd>{meeting.venue}</dd>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <DoorOpen className="size-4 text-cyan" />
          <dd>{meeting.classroom}</dd>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
          <UserRound className="size-4 text-cyan" />
          <dd>{meeting.speaker}</dd>
        </div>
      </dl>
    </article>
  );
}