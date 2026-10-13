import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bell, CalendarCheck, CalendarClock, LogOut, ShieldCheck, Users } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase";
import { MitsLogo } from "@/components/MitsLogo";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { AdminMobileNav, AdminSidebar } from "@/components/admin/AdminSidebar";
import type { AdminSection } from "@/components/admin/AdminSidebar";
import { StudentTable } from "@/components/admin/StudentTable";
import { MeetingTable } from "@/components/admin/MeetingTable";
import { AdminNotifications } from "@/components/admin/AdminNotifications";
import { AdminEvents } from "@/components/admin/AdminEvents";
import { useMeetings } from "@/hooks/useMeetings";
import { useStudents } from "@/hooks/useStudents";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin Console — AI PULSE | AI Learning Hub" },
      { name: "description", content: "Manage AI Learning Hub students and meetings." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Console — AI PULSE | AI Learning Hub" },
      {
        property: "og:description",
        content: "Student and meeting management for the AI Learning Hub.",
      },
    ],
  }),
  component: AdminDashboardPage,
});

export function AdminDashboardPage({
  initialSection = "dashboard",
}: { initialSection?: AdminSection } = {}) {
  const navigate = useNavigate();
  const [section, setSection] = useState<AdminSection>(initialSection);
  const { students, isLoading: studentsLoading } = useStudents();
  const { meetings, upcoming, past } = useMeetings();
  const { isAuthenticated, isAdmin, isLoading, signOut } = useAuth();
  const [adminEmail, setAdminEmail] = useState<string>("admin@mits.ac.in");
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (isAdmin) {
      void getDocs(collection(db, "notifications"))
        .then((snapshot) => setNotificationCount(snapshot.size))
        .catch(() => undefined);
    }
  }, [isAdmin]);

  const selectSection = (nextSection: AdminSection) => {
    setSection(nextSection);
    if (nextSection === "students") navigate({ to: "/admin/students" });
    else if (nextSection === "dashboard") navigate({ to: "/admin/dashboard" });
  };

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      navigate({ to: "/admin/login", replace: true });
      return;
    }

    setAdminEmail(auth.currentUser?.email ?? "admin@mits.ac.in");
  }, [isAuthenticated, isAdmin, isLoading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/admin/login", replace: true });
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <MitsLogo className="h-9" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-sm font-bold tracking-[0.2em]">
                <span className="text-pulse">AI PULSE</span>
              </span>
              <span className="mt-1 text-[9px] tracking-[0.2em] text-muted-foreground uppercase">
                Admin Console
              </span>
            </span>
          </div>
          <Button variant="neon" size="sm" onClick={handleLogout}>
            <LogOut className="size-4" />
            Logout
          </Button>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <AdminSidebar active={section} onSelect={selectSection} />

        <div className="min-w-0 flex-1 space-y-6">
          <AdminMobileNav active={section} onSelect={selectSection} />

          {section === "dashboard" ? (
            <div className="space-y-6">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
                <StatCard icon={Users} label="Total Students" value={students.length} />
                <StatCard
                  icon={Users}
                  label="Active Students"
                  value={students.filter((student) => student.status === "active").length}
                />
                <StatCard
                  icon={Users}
                  label="Disabled Students"
                  value={students.filter((student) => student.status === "disabled").length}
                />
                <StatCard icon={Bell} label="Total Notifications" value={notificationCount} />
                <StatCard icon={CalendarClock} label="Upcoming Meetings" value={upcoming.length} />
              </div>

              <div className="glass p-5">
                <div className="flex items-center gap-3">
                  <div className="inline-flex size-10 items-center justify-center rounded-lg border border-cyan/30 bg-cyan/10 text-cyan">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                      Admin Information
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{adminEmail}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="neon" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          {section === "students" ? (
            <StudentTable students={students} isLoading={studentsLoading} />
          ) : null}
          {section === "events" ? <AdminEvents /> : null}
          {section === "meetings" ? <MeetingTable meetings={meetings} /> : null}
          {section === "notifications" ? <AdminNotifications /> : null}
          {section === "settings" ? (
            <div className="glass p-6">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Admin Information
              </p>
              <p className="mt-3 text-sm font-semibold">{adminEmail}</p>
              <div className="mt-4">
                <Button variant="neon" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
