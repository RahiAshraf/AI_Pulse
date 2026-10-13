import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarClock, History } from "lucide-react";
import { SiteLayout } from "@/layouts/SiteLayout";
import { SectionHeading } from "@/components/SectionHeading";
import { MeetingCard } from "@/components/MeetingCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { useMeetings } from "@/hooks/useMeetings";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meetings & Workshops — AI PULSE | MITS" },
      {
        name: "description",
        content:
          "Upcoming and past AI Learning Hub meetings, workshops and sessions for MITS students.",
      },
      { property: "og:title", content: "Meetings & Workshops — AI PULSE | MITS" },
      {
        property: "og:description",
        content: "Track upcoming and past AI Learning Hub sessions at MITS.",
      },
    ],
  }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const { upcoming, past } = useMeetings();

  return (
    <SiteLayout>
      <section className="section-pad">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="AI Pulse sessions"
            title="Upcoming Meetings"
            description="Sessions, workshops and discussions organised by the AI Learning Hub."
          />

          <div className="mt-10">
            {upcoming.length > 0 ? (
              <div className="grid gap-6 lg:grid-cols-2">
                {upcoming.map((m) => (
                  <MeetingCard key={m.id} meeting={m} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={CalendarClock}
                title="No upcoming meetings scheduled yet."
                description="New sessions will appear here as soon as they are published."
                action={
                  <Button asChild variant="neon">
                    <Link to="/join">Join AI Learning Hub</Link>
                  </Button>
                }
              />
            )}
          </div>

          <div className="mt-20">
            <SectionHeading eyebrow="Archive" title="Past Meetings" />
            <div className="mt-10">
              {past.length > 0 ? (
                <div className="grid gap-6 lg:grid-cols-2">
                  {past.map((m) => (
                    <MeetingCard key={m.id} meeting={m} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={History}
                  title="No past meetings recorded yet."
                  description="Completed sessions will be archived here."
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}