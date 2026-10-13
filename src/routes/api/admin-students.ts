import { createFileRoute } from "@tanstack/react-router";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getFirebaseAdminApp } from "@/lib/firebase-admin";

type StudentInput = {
  fullName?: string;
  rollNumber?: string;
  email?: string;
  phone?: string;
  branch?: string;
  year?: string;
  section?: string;
  password?: string;
};

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status });
}

async function getAdminApp() {
  return getFirebaseAdminApp();
}

async function requireAdmin(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return { error: json({ error: "Authentication required." }, 401) };

  try {
    const app = await getAdminApp();
    const decoded = await getAuth(app).verifyIdToken(token);
    const firestore = getFirestore(app);
    const admin = await firestore.collection("admins").doc(decoded.uid).get();
    if (!admin.exists || admin.data()?.["active"] !== true) {
      return { error: json({ error: "Admin privileges required." }, 403) };
    }
    return { app, firestore, uid: decoded.uid };
  } catch (error) {
    console.error("Admin authorization failed:", error instanceof Error ? error.message : error);
    return { error: json({ error: "Unable to verify administrator access." }, 401) };
  }
}

function cleanInput(input: StudentInput) {
  return {
    name: input.fullName?.trim() ?? "",
    rollNumber: input.rollNumber?.trim() ?? "",
    email: input.email?.trim().toLowerCase() ?? "",
    phone: input.phone?.trim() ?? "",
    programme: input.branch?.trim() ?? "",
    year: input.year?.trim() ?? "",
    section: input.section?.trim().toUpperCase() ?? "",
  };
}

function validateStudent(input: StudentInput, includePassword = false) {
  const data = cleanInput(input);
  if (
    !data.name ||
    !data.rollNumber ||
    !data.email ||
    !data.programme ||
    !data.year ||
    !data.section
  ) {
    return { error: "Name, roll number, email, branch, year and section are required." };
  }
  if (!/^[^\s@]+@mits\.ac\.in$/i.test(data.email))
    return { error: "Use a valid MITS email address." };
  if (includePassword && (!input.password || input.password.length < 6)) {
    return { error: "A password of at least 6 characters is required." };
  }
  return { data };
}

export const Route = createFileRoute("/api/admin-students")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const access = await requireAdmin(request);
        if ("error" in access) return access.error;
        const snapshot = await access.firestore.collection("students").get();
        return json({
          students: snapshot.docs.map((student) => ({ id: student.id, ...student.data() })),
        });
      },
      POST: async ({ request }) => {
        const access = await requireAdmin(request);
        if ("error" in access) return access.error;
        const input = (await request.json()) as StudentInput;
        const validated = validateStudent(input, true);
        if (validated.error) return json({ error: validated.error }, 400);

        try {
          const authUser = await getAuth(access.app).createUser({
            email: validated.data.email,
            password: input.password,
            displayName: validated.data.name,
          });
          const rollRef = access.firestore
            .collection("rollNumbers")
            .doc(validated.data.rollNumber.toLowerCase());
          const existingRoll = await rollRef.get();
          if (existingRoll.exists) {
            await getAuth(access.app).deleteUser(authUser.uid);
            return json({ error: "That roll number is already registered." }, 409);
          }
          await access.firestore
            .collection("students")
            .doc(authUser.uid)
            .set({
              uid: authUser.uid,
              ...validated.data,
              status: "active",
              registeredAt: FieldValue.serverTimestamp(),
              updatedAt: FieldValue.serverTimestamp(),
            });
          await rollRef.set({ uid: authUser.uid, rollNumber: validated.data.rollNumber });
          return json({ success: true, id: authUser.uid }, 201);
        } catch (error) {
          console.error(
            "Admin student creation failed:",
            error instanceof Error ? error.message : error,
          );
          return json({ error: "Unable to create the student account." }, 500);
        }
      },
      PATCH: async ({ request }) => {
        const access = await requireAdmin(request);
        if ("error" in access) return access.error;
        const body = (await request.json()) as StudentInput & {
          id?: string;
          status?: "active" | "disabled";
        };
        if (!body.id) return json({ error: "Student id is required." }, 400);
        const validated = validateStudent(body);
        if (validated.error) return json({ error: validated.error }, 400);
        const studentRef = access.firestore.collection("students").doc(body.id);
        const current = await studentRef.get();
        if (!current.exists) return json({ error: "Student record not found." }, 404);

        try {
          const oldRoll = String(current.data()?.["rollNumber"] ?? "").toLowerCase();
          const newRoll = validated.data.rollNumber.toLowerCase();
          if (oldRoll !== newRoll) {
            const rollRef = access.firestore.collection("rollNumbers").doc(newRoll);
            const existingRoll = await rollRef.get();
            if (existingRoll.exists && existingRoll.data()?.["uid"] !== body.id) {
              return json({ error: "That roll number is already registered." }, 409);
            }
            await access.firestore
              .collection("rollNumbers")
              .doc(oldRoll)
              .delete()
              .catch(() => undefined);
            await rollRef.set({ uid: body.id, rollNumber: validated.data.rollNumber });
          }
          await getAuth(access.app).updateUser(body.id, {
            email: validated.data.email,
            displayName: validated.data.name,
          });
          await studentRef.update({
            ...validated.data,
            status: body.status === "disabled" ? "disabled" : "active",
            updatedAt: FieldValue.serverTimestamp(),
          });
          return json({ success: true });
        } catch (error) {
          console.error(
            "Admin student update failed:",
            error instanceof Error ? error.message : error,
          );
          return json({ error: "Unable to update the student account." }, 500);
        }
      },
      DELETE: async ({ request }) => {
        const access = await requireAdmin(request);
        if ("error" in access) return access.error;
        const body = (await request.json()) as { id?: string };
        if (!body.id) return json({ error: "Student id is required." }, 400);
        const studentRef = access.firestore.collection("students").doc(body.id);
        const student = await studentRef.get();
        if (!student.exists) return json({ error: "Student record not found." }, 404);
        try {
          const roll = String(student.data()?.["rollNumber"] ?? "").toLowerCase();
          await getAuth(access.app).deleteUser(body.id);
          await studentRef.delete();
          if (roll)
            await access.firestore
              .collection("rollNumbers")
              .doc(roll)
              .delete()
              .catch(() => undefined);
          await access.firestore
            .collection("notificationTokens")
            .doc(body.id)
            .delete()
            .catch(() => undefined);
          return json({ success: true });
        } catch (error) {
          console.error(
            "Admin student deletion failed:",
            error instanceof Error ? error.message : error,
          );
          return json({ error: "Unable to delete the student account." }, 500);
        }
      },
    },
  },
});
