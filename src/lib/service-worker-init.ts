// Service worker initialization utility
// This handles registering the Firebase messaging service worker

export async function initializeServiceWorker() {
  // Only run in browser
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    console.warn("Service workers are not supported");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
      scope: "/",
    });

    await registration.update();
    const installingWorker = registration.installing;
    if (installingWorker) {
      await new Promise<void>((resolve, reject) => {
        installingWorker.addEventListener("statechange", () => {
          if (installingWorker.state === "activated") resolve();
          if (installingWorker.state === "redundant")
            reject(new Error("Firebase messaging service worker became redundant."));
        });
      });
    } else if (!registration.active) {
      await navigator.serviceWorker.ready;
    }

    if (import.meta.env.DEV) console.log("[AI PULSE] Service worker registration:", registration);
    return registration;
  } catch (error) {
    console.error("Service worker registration failed:", error);
    return null;
  }
}
