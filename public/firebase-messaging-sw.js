// Firebase Cloud Messaging Service Worker
// This handles background push notifications for the AI PULSE Learning Hub

importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAyHROSyzJqKfSqHp9uaC_K2JT6fdqTgR8",
  authDomain: "ai-pulse-learning-hub.firebaseapp.com",
  projectId: "ai-pulse-learning-hub",
  storageBucket: "ai-pulse-learning-hub.firebasestorage.app",
  messagingSenderId: "810301846557",
  appId: "1:810301846557:web:47161d3525e2d7102802f4",
});

try {
  const messaging = firebase.messaging();
  const notificationFallbackUrl = "/student/dashboard";

  function getInternalNotificationUrl(value) {
    if (typeof value !== "string" || !value.trim()) return notificationFallbackUrl;

    try {
      const url = new URL(value, self.location.origin);
      if (url.origin !== self.location.origin || url.protocol !== self.location.protocol) {
        return notificationFallbackUrl;
      }
      return url.href;
    } catch {
      return notificationFallbackUrl;
    }
  }

  // Handle background messages
  messaging.onBackgroundMessage((payload) => {
    console.log("[AI PULSE] Background notification received");

    // FCM automatically displays notification payloads while the page is hidden.
    if (payload.notification) return;

    const notificationTitle = payload.data?.title || "AI PULSE Notification";
    const notificationOptions = {
      body: payload.data?.body || payload.data?.message || "You have a new message",
      icon: payload.data?.icon || "/ai-club.png",
      badge: "/favicon.ico",
      tag: "ai-pulse-notification",
      requireInteraction: false,
      data: payload.data || {},
    };

    // Show the notification
    self.registration.showNotification(notificationTitle, notificationOptions);
  });

  // Handle notification clicks
  self.addEventListener("notificationclick", (event) => {
    console.log("Notification clicked:", event.notification);
    event.notification.close();

    // Define the URL to navigate to
    const targetUrl = getInternalNotificationUrl(event.notification.data?.url);

    // Check if there's already a window/tab with the target URL open
    event.waitUntil(
      clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
        // Reuse an existing AI PULSE tab before opening a new one.
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === targetUrl && "focus" in client) {
            return client.focus();
          }
        }
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.startsWith(self.location.origin) && "navigate" in client && "focus" in client) {
            return client.navigate(targetUrl).then(() => client.focus());
          }
        }
        // If no existing tab found, open a new one
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
    );
  });

  console.log("Firebase Cloud Messaging initialized in service worker");
} catch (error) {
  console.error("Error initializing Firebase in service worker:", error);
}

