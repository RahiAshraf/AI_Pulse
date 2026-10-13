import { useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  CalendarRange,
  Bell,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MitsLogo } from "@/components/MitsLogo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export type AdminSection =
  "dashboard" | "students" | "events" | "meetings" | "notifications" | "settings";

const items: Array<{ id: AdminSection; label: string; icon: LucideIcon }> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "students", label: "Students", icon: Users },
  { id: "events", label: "Events", icon: CalendarDays },
  { id: "meetings", label: "Meetings", icon: CalendarRange },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({
  active,
  onSelect,
}: {
  active: AdminSection;
  onSelect: (section: AdminSection) => void;
}) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/admin/login", replace: true });
  };

  return (
    <aside className="glass sticky top-20 hidden h-fit w-60 shrink-0 p-4 lg:block">
      <div className="flex items-center gap-3 px-2 pb-4">
        <MitsLogo className="h-9" />
        <span className="font-display text-xs font-bold tracking-[0.2em]">
          <span className="text-pulse">AI PULSE</span>
        </span>
      </div>

      <nav className="space-y-1 border-t border-border pt-4">
        {items.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold tracking-[0.14em] uppercase transition-colors",
              active === id
                ? "border border-cyan/40 bg-cyan/10 text-cyan"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}

        <button
          type="button"
          onClick={() => void handleLogout()}
          className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="size-4" />
          Logout
        </button>
      </nav>
    </aside>
  );
}

export function AdminMobileNav({
  active,
  onSelect,
}: {
  active: AdminSection;
  onSelect: (section: AdminSection) => void;
}) {
  return (
    <div className="glass -mx-1 flex gap-2 overflow-x-auto p-2 lg:hidden">
      {items.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelect(id)}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors",
            active === id
              ? "border border-cyan/40 bg-cyan/10 text-cyan"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="size-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
