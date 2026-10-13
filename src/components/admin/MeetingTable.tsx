import { CalendarRange, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { MeetingFormDialog } from "@/components/admin/MeetingFormDialog";
import { db } from "@/lib/firebase";
import type { Meeting } from "@/types";

export function MeetingTable({ meetings }: { meetings: Meeting[] }) {
  const handleDelete = async (meeting: Meeting) => {
    try {
      await deleteDoc(doc(db, "meetings", meeting.id));
      toast.success("Meeting deleted.");
    } catch (error) {
      console.error("Delete meeting failed:", error);
      toast.error("Unable to delete the meeting. Please try again.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          Meeting Management
        </p>
        <MeetingFormDialog
          trigger={
            <Button variant="hero">
              <Plus className="size-4" />
              Add Meeting
            </Button>
          }
        />
      </div>

      {meetings.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title="No meetings created yet."
          description="Published meetings will be listed here and shown on the student website."
        />
      ) : (
        <div className="glass overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Venue</th>
                <th className="px-4 py-3">Classroom</th>
                <th className="px-4 py-3">Speaker</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map((m) => (
                <tr key={m.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 font-semibold">{m.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.date}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {m.startTime} – {m.endTime}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{m.venue}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.classroom}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.speaker}</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{m.status}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <MeetingFormDialog
                        meeting={m}
                        trigger={
                          <Button variant="ghost" size="icon" aria-label="Edit meeting">
                            <Pencil className="size-4" />
                          </Button>
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete meeting"
                        onClick={() => handleDelete(m)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}