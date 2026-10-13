import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, onSnapshot, query, where, type Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { EventRegistrationValues } from "@/lib/validation";
import type { EventRegistration, LearningEvent, Student } from "@/types";

function toIso(value: unknown) {
  return typeof (value as Timestamp | undefined)?.toDate === "function"
    ? (value as Timestamp).toDate().toISOString()
    : String(value ?? "");
}

function mapEvent(document: { id: string; data: () => Record<string, unknown> }): LearningEvent {
  const data = document.data();
  return {
    id: document.id,
    title: String(data["title"] ?? ""),
    description: String(data["description"] ?? ""),
    posterUrl: String(data["posterUrl"] ?? ""),
    date: String(data["date"] ?? ""),
    time: String(data["time"] ?? ""),
    venue: String(data["venue"] ?? ""),
    organizer: String(data["organizer"] ?? ""),
    registrationDeadline: toIso(data["registrationDeadline"]),
    capacity: Number(data["capacity"] ?? 0),
    registrationCount: Number(data["registrationCount"] ?? 0),
    active: data["active"] === true,
    createdAt: toIso(data["createdAt"]),
  };
}

export function useEvents(student: Student | null) {
  const [events, setEvents] = useState<LearningEvent[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let unsubscribeEvents: (() => void) | undefined;
    const unsubscribeAuth = onAuthStateChanged(auth, () => {
      unsubscribeEvents?.();
      unsubscribeEvents = onSnapshot(
        query(collection(db, "events"), where("active", "==", true)),
        (snapshot) => {
          setEvents(
            snapshot.docs
              .map((document) => mapEvent(document))
              .sort((a, b) => a.date.localeCompare(b.date)),
          );
          setIsLoading(false);
          setIsConnected(true);
        },
        (error) => {
          console.error("Failed to load events:", error);
          setEvents([]);
          setIsLoading(false);
          setIsConnected(false);
        },
      );
    });
    return () => {
      unsubscribeEvents?.();
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    if (!student) {
      setRegistrations([]);
      return;
    }
    return onSnapshot(
      query(collection(db, "eventRegistrations"), where("studentId", "==", student.id)),
      (snapshot) =>
        setRegistrations(
          snapshot.docs.map(
            (document) =>
              ({
                id: document.id,
                ...document.data(),
                registeredAt: toIso(document.data()["registeredAt"]),
              }) as EventRegistration,
          ),
        ),
      (error) => console.error("Failed to load event registrations:", error),
    );
  }, [student]);

  const registerForEvent = async (event: LearningEvent, guest?: EventRegistrationValues) => {
    const token = await auth.currentUser?.getIdToken();
    if (!student && !guest) throw new Error("Registration details are required.");
    const response = await fetch("/api/event-register", {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ eventId: event.id, ...guest }),
    });
    const result = (await response.json()) as {
      error?: string;
      message?: string;
      registration?: { studentName: string; studentEmail: string };
    };
    if (!response.ok)
      throw new Error(result.message ?? result.error ?? "Unable to register for this event.");
    return result.registration;
  };

  return { events, registrations, isLoading, isConnected, registerForEvent };
}

export function eventRegistrationId(eventId: string, studentId: string) {
  return `${eventId}_${studentId}`;
}
