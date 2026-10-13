import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, CalendarClock, LogOut, MessageCircleMore, UserRound } from "lucide-react";
import { MitsLogo } from "@/components/MitsLogo";
import { EmptyState } from "@/components/EmptyState";
import { MeetingCard } from "@/components/MeetingCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useMeetings } from "@/hooks/useMeetings";
import { useNotifications } from "@/hooks/useNotifications";
import { StudentEvents } from "@/components/StudentEvents";

export const Route = createFileRoute("/student/dashboard")({
  head: () => ({
    meta: [
      { title: "Student Dashboard — AI PULSE | AI Learning Hub" },
      { name: "description", content: "Your AI Learning Hub profile and upcoming meetings." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Student Dashboard — AI PULSE | AI Learning Hub" },
      { property: "og:description", content: "AI Learning Hub member dashboard at MITS." },
    ],
  }),
  component: StudentDashboardPage,
});

const profileFields = ["Name", "Roll Number", "Email", "Branch", "Year", "Section"] as const;

function StudentDashboardPage() {
  const navigate = useNavigate();
  const { student, isAuthenticated, isLoading, isStudent, signOut } = useAuth();
  const { upcoming } = useMeetings();
  const {
    requestNotificationPermission,
    isLoading: notificationsLoading,
    isEnabled,
    error,
  } = useNotifications();
  const [activeTab, setActiveTab] = useState<"overview" | "events">("overview");

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isStudent)) {
      navigate({ to: "/login", replace: true });
    }
  }, [isAuthenticated, isLoading, isStudent, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/login", replace: true });
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <MitsLogo className="h-9" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-sm font-bold tracking-[0.2em]">
                <span className="text-pulse">AI PULSE</span>
              </span>
              <span className="mt-1 text-[9px] tracking-[0.2em] text-muted-foreground uppercase">
                Student Dashboard
              </span>
            </span>
          </Link>
          <Button variant="neon" size="sm" onClick={handleLogout}>
            <LogOut className="size-4" />
            Logout
          </Button>
        </div>
      </header>

      <nav className="border-b border-border bg-background/40">
        <div className="mx-auto flex max-w-6xl gap-6 px-4 sm:px-6 lg:px-8">
          {(["overview", "events"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-1 py-3 text-xs font-semibold tracking-[0.16em] uppercase transition-colors ${activeTab === tab ? "border-cyan text-cyan" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {tab === "overview" ? "Dashboard" : "Events"}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        {activeTab === "events" && student ? <StudentEvents student={student} /> : null}
        {activeTab === "events" && !student ? (
          <div className="glass p-6 text-sm text-muted-foreground">
            Sign in to browse and register for AI PULSE events.
          </div>
        ) : null}
        {activeTab === "overview" ? (
          <>
            <section className="glass grid-circuit p-6 sm:p-8">
              <h1 className="text-xl font-bold tracking-wide uppercase sm:text-2xl">
                <span className="text-pulse">
                  {student ? `Welcome, ${student.fullName}` : "Welcome to AI Learning Hub"}
                </span>
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {student
                  ? "Here are your profile details and upcoming AI Learning Hub sessions."
                  : "Sign in to load your profile and upcoming sessions."}
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold tracking-[0.18em] uppercase">My Profile</h2>
              <div className="mt-5">
                {student ? (
                  <dl className="glass grid gap-5 p-6 sm:grid-cols-2">
                    <Detail label="Name" value={student.fullName} />
                    <Detail label="Roll Number" value={student.rollNumber} />
                    <Detail label="Email" value={student.email} />
                    <Detail label="Branch" value={student.branch} />
                    <Detail label="Year" value={student.year} />
                    <Detail label="Section" value={student.section} />
                  </dl>
                ) : (
                  <div className="glass p-6">
                    <p className="text-sm text-muted-foreground">
                      Profile details are loaded from your member account after sign-in.
                    </p>
                    <ul className="mt-4 grid gap-2 sm:grid-cols-3">
                      {profileFields.map((f) => (
                        <li
                          key={f}
                          className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-[11px] tracking-[0.14em] text-muted-foreground uppercase"
                        >
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <Button asChild variant="hero">
                        <Link to="/login">Login</Link>
                      </Button>
                      <Button asChild variant="neon">
                        <Link to="/join">Join AI Learning Hub</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {student ? (
              <section className="glass relative overflow-hidden p-5 sm:p-6">
                <div className="absolute -right-12 -top-12 size-32 rounded-full bg-[image:var(--gradient-pulse)] opacity-15 blur-3xl" />
                <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl border border-cyan/30 bg-cyan/10 text-cyan">
                      <MessageCircleMore className="size-6" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                        Community Updates
                      </p>
                      <h3 className="text-lg font-bold tracking-wide uppercase text-foreground">
                        Join AI Learning Hub
                      </h3>
                      <p className="max-w-xl text-sm text-muted-foreground">
                        Join our official WhatsApp group for announcements, meetings, updates and
                        learning activities.
                      </p>
                    </div>
                  </div>

                  <a
                    href="https://chat.whatsapp.com/FD7Q1RMTwqb4EFp9fWBkVz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-[11px] font-semibold tracking-[0.18em] text-emerald-300 uppercase transition-transform hover:scale-[1.01]"
                  >
                    JOIN WHATSAPP GROUP
                  </a>
                </div>
              </section>
            ) : null}

            {student ? (
              <section className="glass flex flex-col gap-5 p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl border border-cyan/30 bg-cyan/10 text-cyan">
                    <Bell className="size-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold tracking-wide uppercase">Notifications</h2>
                    <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                      Enable notifications to receive important AI PULSE announcements, meeting
                      updates, and other student notifications.
                    </p>
                    {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
                  </div>
                </div>
                <Button
                  variant="neon"
                  disabled={notificationsLoading || isEnabled}
                  onClick={() => void requestNotificationPermission()}
                >
                  <Bell className="size-4" />
                  {notificationsLoading
                    ? "Enabling..."
                    : isEnabled
                      ? "Notifications Enabled"
                      : "Enable Notifications"}
                </Button>
              </section>
            ) : null}

            <section>
              <h2 className="text-sm font-bold tracking-[0.18em] uppercase">Upcoming Meetings</h2>
              <div className="mt-5">
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
                    description="Sessions published by the club will appear here."
                  />
                )}
              </div>
            </section>

            <section className="glass flex flex-wrap items-center justify-between gap-4 p-6">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-10 items-center justify-center rounded-lg border border-cyan/30 bg-cyan/10 text-cyan">
                  <UserRound className="size-5" />
                </span>
                <p className="text-sm text-muted-foreground">
                  Account actions are available once authentication is connected.
                </p>
              </div>
              <Button variant="neon" onClick={handleLogout}>
                Logout
              </Button>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold">{value}</dd>
    </div>
  );
}
