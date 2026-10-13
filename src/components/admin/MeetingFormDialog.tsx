import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db } from "@/lib/firebase";
import { meetingSchema, meetingStatuses } from "@/lib/validation";
import type { MeetingValues } from "@/lib/validation";
import type { Meeting } from "@/types";

export function MeetingFormDialog({
  trigger,
  meeting,
}: {
  trigger: ReactNode;
  meeting?: Meeting;
}) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MeetingValues>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: meeting?.title ?? "",
      description: meeting?.description ?? "",
      date: meeting?.date ?? "",
      startTime: meeting?.startTime ?? "",
      endTime: meeting?.endTime ?? "",
      venue: meeting?.venue ?? "",
      classroom: meeting?.classroom ?? "",
      speaker: meeting?.speaker ?? "",
      status: meeting?.status ?? "upcoming",
    },
  });

  useEffect(() => {
    reset({
      title: meeting?.title ?? "",
      description: meeting?.description ?? "",
      date: meeting?.date ?? "",
      startTime: meeting?.startTime ?? "",
      endTime: meeting?.endTime ?? "",
      venue: meeting?.venue ?? "",
      classroom: meeting?.classroom ?? "",
      speaker: meeting?.speaker ?? "",
      status: meeting?.status ?? "upcoming",
    });
  }, [meeting, reset, open]);

  const onSubmit = async (values: MeetingValues) => {
    try {
      if (meeting) {
        await updateDoc(doc(db, "meetings", meeting.id), {
          ...values,
          updatedAt: serverTimestamp(),
        });
        toast.success("Meeting updated.");
      } else {
        await addDoc(collection(db, "meetings"), {
          ...values,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast.success("Meeting created.");
      }

      setOpen(false);
    } catch (error) {
      console.error("Meeting save failed:", error);
      toast.error("Unable to save the meeting. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="tracking-wide uppercase">
            {meeting ? "Edit Meeting" : "Add Meeting"}
          </DialogTitle>
          <DialogDescription>
            Meeting details published here appear on the student website.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Meeting Title</Label>
            <Input placeholder="Session title" {...register("title")} />
            {errors.title ? <p className="text-xs text-destructive">{errors.title.message}</p> : null}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Description</Label>
            <Textarea rows={4} placeholder="What will this session cover?" {...register("description")} />
            {errors.description ? (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" {...register("date")} />
            {errors.date ? <p className="text-xs text-destructive">{errors.date.message}</p> : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input type="time" {...register("startTime")} />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input type="time" {...register("endTime")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Venue</Label>
            <Input placeholder="Venue" {...register("venue")} />
            {errors.venue ? <p className="text-xs text-destructive">{errors.venue.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label>Classroom</Label>
            <Input placeholder="Classroom / block" {...register("classroom")} />
          </div>

          <div className="space-y-2">
            <Label>Speaker / Faculty</Label>
            <Input placeholder="Speaker or faculty name" {...register("speaker")} />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={watch("status")}
              onValueChange={(v) => setValue("status", v as MeetingValues["status"])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {meetingStatuses.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2">
            <Button type="submit" variant="hero" size="xl" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : meeting ? "Save Changes" : "Add Meeting"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}