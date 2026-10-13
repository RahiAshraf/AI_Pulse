import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { auth, db } from "@/lib/firebase";
import { initializeServiceWorker } from "@/lib/service-worker-init";

const notificationFallbackUrl = "/student/dashboard";

function getInternalNotificationUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return notificationFallbackUrl;

  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin || url.protocol !== window.location.protocol) {
      return notificationFallbackUrl;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return notificationFallbackUrl;
  }
}

export function useNotifications() {
  const [isLoading, setIsLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(
    typeof window === "undefined" || typeof Notification === "undefined"
      ? null
      : Notification.permission,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setIsEnabled(false);
      if (!user) return;

      void getDoc(doc(db, "notificationTokens", user.uid))
        .then((snapshot) => {
          const data = snapshot.data();
          const hasToken = typeof data?.["token"] === "string" && data["token"].length > 0;
          const permissionGranted =
            typeof Notification !== "undefined" && Notification.permission === "granted";
          setPermission(typeof Notification === "undefined" ? null : Notification.permission);
          setIsEnabled(
            snapshot.exists() && data?.["enabled"] === true && hasToken && permissionGranted,
          );
        })
        .catch((readError) => {
          console.error("Unable to read notification settings:", readError);
        });
    });
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !isEnabled || permission !== "granted" || typeof window === "undefined") return;

    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    void import("firebase/messaging")
      .then(({ getMessaging, onMessage }) => {
        if (cancelled) return;
        const messaging = getMessaging(auth.app);
        unsubscribe = onMessage(messaging, (payload) => {
          if (import.meta.env.DEV)
            console.log("[AI PULSE] Foreground notification received:", payload);
          const title =
            payload.notification?.title || payload.data?.["title"] || "AI PULSE Notification";
          const body =
            payload.notification?.body ||
            payload.data?.["body"] ||
            payload.data?.["message"] ||
            "You have a new message";
          if (Notification.permission === "granted") {
            const notification = new Notification(title, {
              body,
              icon: "/ai-club.png",
              data: { url: payload.data?.["url"] },
            });
            notification.onclick = () => {
              const destination = getInternalNotificationUrl(payload.data?.["url"]);
              window.focus();
              window.location.assign(destination);
            };
          } else {
            toast.success(body);
          }
        });
      })
      .catch((messagingError) =>
        console.error("Unable to register foreground notifications:", messagingError),
      );

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [isEnabled, permission]);

  const requestNotificationPermission = useCallback(async () => {
    if (typeof window === "undefined") {
      setError("Notifications are only available in a browser.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      const msg = "Please login first to enable notifications.";
      console.warn(msg);
      toast.error(msg);
      setError(msg);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      if (!("Notification" in window)) {
        throw new Error("This browser does not support notifications.");
      }

      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission !== "granted") {
        const message =
          "Notifications are blocked. Please allow notifications for this site in your browser settings and try again.";
        toast.error(message);
        setError(message);
        return;
      }

      const vapidKey = import.meta.env["VITE_FIREBASE_VAPID_KEY"];
      if (!vapidKey) throw new Error("VAPID key is missing from the client configuration.");

      if (import.meta.env.DEV) console.log("[AI PULSE] Notification permission:", permission);
      const { getMessaging, getToken } = await import("firebase/messaging");
      const app = (await import("@/lib/firebase")).default;
      const messaging = getMessaging(app);
      const registration = await initializeServiceWorker();
      if (!registration) throw new Error("Firebase messaging service worker is unavailable.");

      const token = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: registration,
      });
      if (!token) throw new Error("FCM token is unavailable.");
      if (import.meta.env.DEV) console.log("[AI PULSE] FCM token obtained:", token);

      const tokenRef = doc(db, "notificationTokens", user.uid);
      const existingToken = await getDoc(tokenRef);
      const tokenData = {
        userId: user.uid,
        token,
        enabled: true,
        updatedAt: serverTimestamp(),
        ...(existingToken.exists() ? {} : { createdAt: serverTimestamp() }),
      };
      await setDoc(tokenRef, tokenData, { merge: true });
      if (import.meta.env.DEV)
        console.log("[AI PULSE] FCM token saved:", `notificationTokens/${user.uid}`);
      toast.success("Notifications enabled!");
      setIsEnabled(true);
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      const message = error instanceof Error ? error.message : "Failed to enable notifications.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    requestNotificationPermission,
    isLoading,
    isEnabled,
    permission,
    error,
  };
}
