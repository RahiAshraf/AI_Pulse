import { createFileRoute } from "@tanstack/react-router";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getFirebaseAdminApp } from "@/lib/firebase-admin";

type GuestDetails = {
  fullName?: string;
  rollNumber?: string;
  email?: string;
  phone?: string;
  branch?: string;
  year?: string;
  section?: string;
};

async function registrationHash(email: string, rollNumber: string) {
  const input = new TextEncoder().encode(`${email}\0${rollNumber}`);
  const digest = await crypto.subtle.digest("SHA-256", input);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status });
}

function invalidRegistration() {
  return json({ success: false, message: "Invalid registration data" }, 400);
}

export const Route = createFileRoute("/api/event-register")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
          let body: ({ eventId?: string; studentId?: string } & GuestDetails) | null;
          try {
            const parsed = (await request.json()) as unknown;
            body = parsed !== null && typeof parsed === "object" ? (parsed as typeof body) : null;
          } catch {
            return invalidRegistration();
          }
          const eventId = typeof body?.eventId === "string" ? body.eventId.trim() : "";
          if (!eventId) return invalidRegistration();
          const app = getFirebaseAdminApp();
          const firestore = getFirestore(app);
          let studentId: string | null = null;
          let details: Required<GuestDetails>;
          if (token) {
            const decoded = await getAuth(app).verifyIdToken(token);
            const student = await firestore.collection("students").doc(decoded.uid).get();
            if (!student.exists || student.data()?.["status"] === "disabled")
              return json({ error: "Only active students can register." }, 403);
            const profile = student.data() ?? {};
            studentId = decoded.uid;
            details = {
              fullName: String(profile["name"] ?? ""),
              rollNumber: String(profile["rollNumber"] ?? ""),
              email: String(profile["email"] ?? decoded.email ?? "")
                .trim()
                .toLowerCase(),
              phone: String(profile["phone"] ?? ""),
              branch: String(profile["programme"] ?? profile["branch"] ?? ""),
              year: String(profile["year"] ?? ""),
              section: String(profile["section"] ?? ""),
            };
          } else {
            details = {
              fullName: String(body?.fullName ?? "").trim(),
              rollNumber: String(body?.rollNumber ?? "").trim(),
              email: String(body?.email ?? "")
                .trim()
                .toLowerCase(),
              phone: String(body?.phone ?? "").trim(),
              branch: String(body?.branch ?? "").trim(),
              year: String(body?.year ?? "").trim(),
              section: String(body?.section ?? "").trim(),
            };
            if (
              details.fullName.length < 3 ||
              details.rollNumber.length < 2 ||
              !/^\S+@\S+\.\S+$/.test(details.email) ||
              !/^\d{10}$/.test(details.phone) ||
              !details.branch ||
              !details.year ||
              !details.section
            )
              return invalidRegistration();
          }
          const eventRef = firestore.collection("events").doc(eventId);
          const registrationCollection = firestore.collection("eventRegistrations");
          const registrationId = studentId
            ? `${eventId}_${studentId}`
            : `${eventId}_public_${await registrationHash(details.email, details.rollNumber)}`;
          const registrationRef = registrationCollection.doc(registrationId);
          await firestore.runTransaction(async (transaction) => {
            const event = await transaction.get(eventRef);
            const registration = await transaction.get(registrationRef);
            const existingRegistrations = await transaction.get(
              registrationCollection.where("eventId", "==", eventId),
            );
            if (!event.exists) throw new Error("EVENT_NOT_FOUND");
            if (registration.exists) throw new Error("ALREADY_REGISTERED");
            if (
              existingRegistrations.docs.some((item) => {
                const data = item.data();
                return (
                  item.id !== registrationRef.id &&
                  (data["studentEmail"] === details.email ||
                    data["rollNumber"] === details.rollNumber)
                );
              })
            )
              throw new Error("ALREADY_REGISTERED");
            const data = event.data() ?? {};
            const deadline = new Date(String(data["registrationDeadline"] ?? "")).getTime();
            const count = Number(data["registrationCount"] ?? 0);
            if (data["active"] !== true) throw new Error("EVENT_INACTIVE");
            if (!Number.isNaN(deadline) && Date.now() > deadline)
              throw new Error("REGISTRATION_CLOSED");
            if (Number(data["capacity"] ?? 0) > 0 && count >= Number(data["capacity"]))
              throw new Error("EVENT_FULL");
            transaction.set(registrationRef, {
              eventId,
              studentId,
              studentName: details.fullName,
              studentEmail: details.email,
              rollNumber: details.rollNumber,
              phone: details.phone,
              branch: details.branch,
              year: details.year,
              section: details.section,
              source: studentId ? "student" : "public",
              registeredAt: FieldValue.serverTimestamp(),
            });
            transaction.update(eventRef, {
              registrationCount: count + 1,
              updatedAt: FieldValue.serverTimestamp(),
            });
          });
          return json(
            {
              success: true,
              message: "Successfully registered",
              registration: { studentName: details.fullName, studentEmail: details.email },
            },
            200,
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : "";
          if (message === "ALREADY_REGISTERED")
            return json({ success: false, message: "Already registered" }, 409);
          const knownErrors: Record<string, string> = {
            EVENT_NOT_FOUND: "Event not found.",
            EVENT_INACTIVE: "Registration is closed for this event.",
            REGISTRATION_CLOSED: "The registration deadline has passed.",
            EVENT_FULL: "This event is full.",
          };
          if (knownErrors[message])
            return json({ success: false, message: knownErrors[message] }, 409);
          console.error("Event registration failed", {
            name: error instanceof Error ? error.name : "unknown",
            message: message || "unknown error",
            code:
              typeof error === "object" && error !== null && "code" in error
                ? error.code
                : undefined,
          });
          return json({ success: false, message: "Unable to register for event" }, 500);
        }
      },
    },
  },
});
