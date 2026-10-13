import { useEffect, useState } from "react";
import { CalendarDays, Eye, Pencil, Plus, Trash2, Users, X } from "lucide-react";
import { toast } from "sonner";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/EmptyState";
import type { EventRegistration, LearningEvent } from "@/types";

const emptyForm = {
  title: "",
  description: "",
  posterUrl: "",
  date: "",
  time: "",
  venue: "",
  organizer: "",
  registrationDeadline: "",
  capacity: "",
  active: true,
};
type EventForm = typeof emptyForm;

function toLocalDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
function eventFromDoc(id: string, data: Record<string, unknown>): LearningEvent {
  return {
    id,
    title: String(data.title ?? ""),
    description: String(data.description ?? ""),
    posterUrl: String(data.posterUrl ?? ""),
    date: String(data.date ?? ""),
    time: String(data.time ?? ""),
    venue: String(data.venue ?? ""),
    organizer: String(data.organizer ?? ""),
    registrationDeadline: String(data.registrationDeadline ?? ""),
    capacity: Number(data.capacity ?? 0),
    registrationCount: Number(data.registrationCount ?? 0),
    active: data.active === true,
    createdAt: String(data.createdAt ?? ""),
  };
}

export function AdminEvents() {
  const [events, setEvents] = useState<LearningEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LearningEvent | null>(null);
  const [selected, setSelected] = useState<LearningEvent | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, "events"), orderBy("date", "asc")),
        (snapshot) => {
          setEvents(snapshot.docs.map((item) => eventFromDoc(item.id, item.data())));
          setLoading(false);
        },
        (error) => {
          console.error("Failed to load events:", error);
          toast.error("Unable to load events.");
          setLoading(false);
        },
      ),
    [],
  );
  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const save = async (values: EventForm) => {
    setSaving(true);
    try {
      const data = {
        title: values.title.trim(),
        description: values.description.trim(),
        posterUrl: values.posterUrl.trim(),
        date: values.date,
        time: values.time,
        venue: values.venue.trim(),
        organizer: values.organizer.trim(),
        registrationDeadline: new Date(values.registrationDeadline).toISOString(),
        capacity: Number(values.capacity),
        active: values.active,
        ...(editing
          ? { updatedAt: serverTimestamp() }
          : { registrationCount: 0, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }),
      };
      if (editing) await updateDoc(doc(db, "events", editing.id), data);
      else await addDoc(collection(db, "events"), data);
      toast.success(editing ? "Event updated." : "Event created.");
      setFormOpen(false);
    } catch (error) {
      console.error("Event save failed:", error);
      toast.error("Unable to save event. Check the date and deadline.");
    } finally {
      setSaving(false);
    }
  };
  const remove = async (event: LearningEvent) => {
    if (!window.confirm("Permanently delete this event and its registrations?")) return;
    try {
      const registrations = await getDocs(
        query(collection(db, "eventRegistrations"), orderBy("registeredAt", "desc")),
      );
      await Promise.all(
        registrations.docs
          .filter((item) => item.data().eventId === event.id)
          .map((item) => deleteDoc(item.ref)),
      );
      await deleteDoc(doc(db, "events", event.id));
      toast.success("Event deleted.");
    } catch (error) {
      console.error("Event deletion failed:", error);
      toast.error("Unable to delete event.");
    }
  };
  const toggle = async (event: LearningEvent) => {
    try {
      await updateDoc(doc(db, "events", event.id), {
        active: !event.active,
        updatedAt: serverTimestamp(),
      });
      toast.success(event.active ? "Event deactivated." : "Event activated.");
    } catch {
      toast.error("Unable to update event status.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Event Management
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create events and monitor registrations.
          </p>
        </div>
        <Button variant="hero" onClick={openCreate}>
          <Plus className="size-4" /> Add Event
        </Button>
      </div>
      {loading ? (
        <div className="glass p-10 text-center text-sm text-muted-foreground">
          Loading events...
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No events created yet."
          description="Published events will appear on the student dashboard."
        />
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <EventRow
              key={event.id}
              event={event}
              onEdit={() => {
                setEditing(event);
                setFormOpen(true);
              }}
              onView={() => setSelected(event)}
              onToggle={() => void toggle(event)}
              onDelete={() => void remove(event)}
            />
          ))}
        </div>
      )}
      <EventFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        event={editing}
        onSave={save}
        saving={saving}
      />
      <RegistrationDialog event={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function EventRow({
  event,
  onEdit,
  onView,
  onToggle,
  onDelete,
}: {
  event: LearningEvent;
  onEdit: () => void;
  onView: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="glass flex flex-col gap-4 p-4 sm:flex-row">
      <div className="w-full shrink-0 sm:w-40">
        {event.posterUrl ? (
          <img
            src={event.posterUrl}
            alt={`${event.title} poster`}
            className="aspect-video w-full rounded-md object-cover"
          />
        ) : (
          <div className="grid aspect-video place-items-center rounded-md bg-secondary text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
            No poster
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold">{event.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {event.date} at {event.time} · {event.venue}
            </p>
          </div>
          <span
            className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase ${event.active ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" : "border-border text-muted-foreground"}`}
          >
            {event.active ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5 text-cyan" />
            {event.registrationCount}
            {event.capacity ? ` / ${event.capacity}` : " registered"}
          </span>
          <span>Deadline: {new Date(event.registrationDeadline).toLocaleString()}</span>
          <span>{event.organizer}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-1">
          <Button
            variant="ghost"
            size="icon"
            title="View registrations"
            aria-label="View registrations"
            onClick={onView}
          >
            <Eye className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Edit event"
            aria-label="Edit event"
            onClick={onEdit}
          >
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            {event.active ? "Deactivate" : "Activate"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Delete event"
            aria-label="Delete event"
            onClick={onDelete}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      </div>
    </article>
  );
}

function EventFormDialog({
  open,
  onOpenChange,
  event,
  onSave,
  saving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: LearningEvent | null;
  onSave: (values: EventForm) => Promise<void>;
  saving: boolean;
}) {
  const [values, setValues] = useState<EventForm>(emptyForm);
  useEffect(() => {
    if (open)
      setValues(
        event
          ? {
              title: event.title,
              description: event.description,
              posterUrl: event.posterUrl,
              date: event.date,
              time: event.time,
              venue: event.venue,
              organizer: event.organizer,
              registrationDeadline: toLocalDateTime(event.registrationDeadline),
              capacity: String(event.capacity),
              active: event.active,
            }
          : emptyForm,
      );
  }, [open, event]);
  const update = (key: keyof EventForm, value: string | boolean) =>
    setValues((current) => ({ ...current, [key]: value }));
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !values.title.trim() ||
      !values.description.trim() ||
      !values.date ||
      !values.time ||
      !values.venue.trim() ||
      !values.organizer.trim() ||
      !values.registrationDeadline ||
      Number(values.capacity) < 1
    ) {
      toast.error("Complete all event fields with a valid capacity.");
      return;
    }
    void onSave(values);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "Create Event"}</DialogTitle>
          <DialogDescription>
            Published event details appear on the student Events tab.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Event Title"
            value={values.title}
            onChange={(value) => update("title", value)}
          />
          <div className="space-y-2 sm:col-span-2">
            <Label>Description</Label>
            <Textarea
              rows={4}
              value={values.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>
          <Field
            label="Poster Image URL"
            value={values.posterUrl}
            onChange={(value) => update("posterUrl", value)}
          />
          <Field
            label="Organizer"
            value={values.organizer}
            onChange={(value) => update("organizer", value)}
          />
          <Field
            label="Date"
            type="date"
            value={values.date}
            onChange={(value) => update("date", value)}
          />
          <Field label="Time" value={values.time} onChange={(value) => update("time", value)} />
          <Field
            label="Registration Deadline"
            type="datetime-local"
            value={values.registrationDeadline}
            onChange={(value) => update("registrationDeadline", value)}
          />
          <Field
            label="Maximum Participants"
            type="number"
            value={values.capacity}
            onChange={(value) => update("capacity", value)}
          />
          <Field label="Venue" value={values.venue} onChange={(value) => update("venue", value)} />
          <div className="flex items-center gap-2 pt-6">
            <input
              id="event-active"
              type="checkbox"
              checked={values.active}
              onChange={(e) => update("active", e.target.checked)}
              className="size-4 accent-cyan"
            />
            <Label htmlFor="event-active">Active</Label>
          </div>
          {values.posterUrl ? (
            <div className="space-y-2 sm:col-span-2">
              <Label>Poster Preview</Label>
              <img
                src={values.posterUrl}
                alt="Poster preview"
                className="max-h-48 rounded-md object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          ) : null}
          <div className="flex justify-end gap-3 sm:col-span-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={saving}>
              {saving ? "Saving..." : "Save Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function RegistrationDialog({
  event,
  onClose,
}: {
  event: LearningEvent | null;
  onClose: () => void;
}) {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  useEffect(() => {
    if (!event) return;
    return onSnapshot(
      query(collection(db, "eventRegistrations"), orderBy("registeredAt", "desc")),
      (snapshot) =>
        setRegistrations(
          snapshot.docs
            .filter((item) => item.data().eventId === event.id)
            .map(
              (item) =>
                ({
                  id: item.id,
                  ...item.data(),
                  registeredAt: String(item.data().registeredAt ?? ""),
                }) as EventRegistration,
            ),
        ),
    );
  }, [event]);
  return (
    <Dialog
      open={Boolean(event)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event?.title} Registrations</DialogTitle>
          <DialogDescription>{registrations.length} registered student(s).</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {registrations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No registrations yet.</p>
          ) : (
            registrations.map((registration) => (
              <div key={registration.id} className="rounded-md border border-border p-3 text-sm">
                <p className="font-semibold">{registration.studentName}</p>
                <p className="text-muted-foreground">
                  {registration.rollNumber} · {registration.studentEmail}
                </p>
                <p className="mt-1 text-xs font-semibold tracking-wide text-cyan uppercase">
                  {registration.source === "public" ? "Public Registration" : "Logged-in Student"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Registered{" "}
                  {registration.registeredAt && !registration.registeredAt.startsWith("[object")
                    ? new Date(registration.registeredAt).toLocaleString()
                    : "recently"}
                </p>
              </div>
            ))
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close registrations"
          onClick={onClose}
          className="absolute top-4 right-4"
        >
          <X className="size-4" />
        </Button>
      </DialogContent>
    </Dialog>
  );
}
