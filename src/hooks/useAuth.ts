import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { Student } from "@/types";

export interface AuthState {
  student: Student | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isConnected: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  role: "admin" | "student" | null;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [student, setStudent] = useState<Student | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [role, setRole] = useState<"admin" | "student" | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsConnected(true);

      if (!user) {
        setStudent(null);
        setRole(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const adminSnap = await getDoc(doc(db, "admins", user.uid));

        if (adminSnap.exists() && adminSnap.data()?.active === true) {
          setStudent(null);
          setRole("admin");
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        const profileSnap = await getDoc(doc(db, "students", user.uid));

        if (profileSnap.exists()) {
          const data = profileSnap.data();
          if (data.status === "disabled") {
            setStudent(null);
            setRole(null);
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
          }
          setStudent({
            id: profileSnap.id,
            fullName: String(data.name ?? ""),
            rollNumber: String(data.rollNumber ?? ""),
            email: String(data.email ?? ""),
            phone: String(data.phone ?? ""),
            branch: String(data.programme ?? data.branch ?? ""),
            year: String(data.year ?? ""),
            section: String(data.section ?? ""),
            status: data.status === "disabled" ? "disabled" : "active",
            registeredAt:
              typeof data.registeredAt?.toDate === "function"
                ? data.registeredAt.toDate().toISOString()
                : String(data.registeredAt ?? new Date().toISOString()),
          });
          setRole("student");
          setIsAuthenticated(true);
        } else {
          setStudent(null);
          setRole(null);
          setIsAuthenticated(false);
        }
      } catch {
        setStudent(null);
        setRole(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return {
    student,
    isAuthenticated,
    isLoading,
    isConnected,
    isAdmin: role === "admin",
    isStudent: role === "student",
    role,
    signOut: async () => {
      await firebaseSignOut(auth);
    },
  };
}