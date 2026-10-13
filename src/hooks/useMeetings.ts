import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { Meeting } from "@/types";

export function useMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let unsubscribeMeetings: (() => void) | undefined;
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeMeetings?.();
      if (!user) {
        setMeetings([]);
        setIsLoading(false);
        setIsConnected(false);
        return;
      }
      unsubscribeMeetings = onSnapshot(
        collection(db, "meetings"),
        (snapshot) => {
          const nextMeetings = snapshot.docs
            .map((document) => {
              const data = document.data();
              return {
                id: document.id,
                title: String(data.title ?? ""),
                description: String(data.description ?? ""),
                date: String(data.date ?? ""),
                startTime: String(data.startTime ?? ""),
                endTime: String(data.endTime ?? ""),
                venue: String(data.venue ?? ""),
                classroom: String(data.classroom ?? ""),
                speaker: String(data.speaker ?? ""),
                status: String(data.status ?? "upcoming") as Meeting["status"],
              } satisfies Meeting;
            })
            .sort((a, b) => {
              const dateCompare = (a.date || "").localeCompare(b.date || "");
              if (dateCompare !== 0) return dateCompare;
              return (a.startTime || "").localeCompare(b.startTime || "");
            });

          setMeetings(nextMeetings);
          setIsLoading(false);
          setIsConnected(true);
        },
        (error) => {
          console.error("Failed to load meetings:", error);
          setMeetings([]);
          setIsLoading(false);
          setIsConnected(false);
        },
      );
    });

    return () => {
      unsubscribeMeetings?.();
      unsubscribeAuth();
    };
  }, []);

  return {
    meetings,
    upcoming: meetings.filter((m) => m.status === "upcoming"),
    past: meetings.filter((m) => m.status !== "upcoming"),
    isLoading,
    isConnected,
  };
}
