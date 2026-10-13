import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, onSnapshot, orderBy, query } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { Student } from "@/types";

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const authUnsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe?.();
      unsubscribe = undefined;

      if (!user) {
        setStudents([]);
        setIsLoading(false);
        setIsConnected(false);
        return;
      }

      try {
        const adminSnap = await getDoc(doc(db, "admins", user.uid));

        if (!adminSnap.exists() || adminSnap.data()?.active !== true) {
          setStudents([]);
          setIsLoading(false);
          setIsConnected(false);
          return;
        }

        const studentsQuery = query(collection(db, "students"), orderBy("registeredAt", "desc"));

        unsubscribe = onSnapshot(
          studentsQuery,
          (snapshot) => {
            const nextStudents = snapshot.docs.map((document) => {
              const data = document.data();
              const registeredAt =
                typeof data.registeredAt?.toDate === "function"
                  ? data.registeredAt.toDate().toISOString()
                  : String(data.registeredAt ?? new Date().toISOString());

              return {
                id: document.id,
                fullName: String(data.name ?? data.fullName ?? ""),
                rollNumber: String(data.rollNumber ?? ""),
                email: String(data.email ?? ""),
                phone: String(data.phone ?? ""),
                branch: String(data.programme ?? data.branch ?? ""),
                year: String(data.year ?? ""),
                section: String(data.section ?? ""),
                status: data.status === "disabled" ? "disabled" : "active",
                registeredAt,
              } satisfies Student;
            });

            setStudents(nextStudents);
            setIsLoading(false);
            setIsConnected(true);
          },
          (error) => {
            console.error("Failed to load students:", error);
            setStudents([]);
            setIsLoading(false);
            setIsConnected(false);
          },
        );
      } catch (error) {
        console.error("Failed to validate admin access:", error);
        setStudents([]);
        setIsLoading(false);
        setIsConnected(false);
      }
    });

    return () => {
      unsubscribe?.();
      authUnsubscribe();
    };
  }, []);

  return { students, isLoading, isConnected };
}