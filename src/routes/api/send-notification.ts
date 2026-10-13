import { createFileRoute } from "@tanstack/react-router";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { getFirebaseAdminApp } from "@/lib/firebase-admin";

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status });
}

async function getAdminApp() {
  return getFirebaseAdminApp();
}

export const Route = createFileRoute("/api/send-notification")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            title?: string;
            message?: string;
            url?: string;
            authToken?: string;
          };

          const title = body.title?.trim();
          const message = body.message?.trim();
          if (!title || !message)
            return json({ success: false, error: "Title and message are required" }, 400);
          if (!body.authToken)
            return json({ success: false, error: "Authentication token required" }, 401);

          const app = await getAdminApp();
          const decodedToken = await getAuth(app).verifyIdToken(body.authToken);
          const db = getFirestore(app);
          const adminDoc = await db.collection("admins").doc(decodedToken.uid).get();
          if (!adminDoc.exists || adminDoc.data()?.["active"] !== true) {
            return json({ success: false, error: "Admin privileges required" }, 403);
          }

          const tokensSnapshot = await db
            .collection("notificationTokens")
            .where("enabled", "==", true)
            .get();
          const tokenDocs = tokensSnapshot.docs.filter(
            (tokenDoc) => typeof tokenDoc.data()["token"] === "string",
          );
          const tokens = tokenDocs.map((tokenDoc) => tokenDoc.data()["token"] as string);
          let successCount = 0;
          let failureCount = 0;

          if (process.env["NODE_ENV"] !== "production")
            console.log("[AI PULSE] Sending notification...");
          if (process.env["NODE_ENV"] !== "production")
            console.log("[AI PULSE] Tokens found:", tokens.length);
          if (tokens.length > 0) {
            const url = body.url?.trim();
            const productionUrl = process.env["PUBLIC_APP_URL"]?.replace(/\/$/, "");
            const link = url || (productionUrl ? `${productionUrl}/student/dashboard` : undefined);
            for (let start = 0; start < tokens.length; start += 500) {
              const batchTokens = tokens.slice(start, start + 500);
              const result = await getMessaging(app).sendEachForMulticast({
                notification: { title, body: message },
                data: { title, body: message, ...(url ? { url } : {}) },
                ...(link && /^https:\/\//i.test(link) ? { webpush: { fcmOptions: { link } } } : {}),
                tokens: batchTokens,
              });
              successCount += result.successCount;
              failureCount += result.failureCount;
              if (process.env["NODE_ENV"] !== "production")
                console.log("[AI PULSE] FCM send success:", result.successCount);
              if (process.env["NODE_ENV"] !== "production" && result.failureCount)
                console.log("[AI PULSE] FCM send failure:", result.failureCount);

              await Promise.all(
                result.responses.map(async (response, index) => {
                  const code = response.error?.code;
                  if (
                    response.success ||
                    (code !== "messaging/registration-token-not-registered" &&
                      code !== "messaging/invalid-registration-token")
                  )
                    return;
                  await tokenDocs[start + index]?.ref.update({
                    enabled: false,
                    updatedAt: FieldValue.serverTimestamp(),
                  });
                }),
              );
            }
          }

          const notificationDoc = await db.collection("notifications").add({
            title,
            message,
            url: body.url?.trim() || null,
            sentBy: decodedToken.uid,
            sentAt: FieldValue.serverTimestamp(),
            recipientCount: successCount,
            failedCount: failureCount,
            status: "sent",
          });

          return json({
            success: true,
            message: "Notification sent successfully",
            notificationId: notificationDoc.id,
            recipientCount: successCount,
            failedCount: failureCount,
          });
        } catch (error) {
          const code = (error as { code?: string }).code;
          console.error(
            "Error sending notification:",
            code ?? (error instanceof Error ? error.message : error),
          );
          if (code?.startsWith("auth/"))
            return json({ success: false, error: "Unauthorized" }, 401);
          return json({ success: false, error: "Failed to send notification" }, 500);
        }
      },
      GET: async () => json({ success: false, error: "Method not allowed" }, 405),
    },
  },
});
