"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Notification } from "@/types";

export function AdminNotifications() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Load notification history
  useEffect(() => {
    setHistoryLoading(true);
    const q = query(
      collection(db, "notifications"),
      orderBy("sentAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          sentAt: doc.data().sentAt instanceof Timestamp
            ? doc.data().sentAt.toDate().toISOString()
            : doc.data().sentAt,
        } as Notification));
        setNotifications(notifs);
        setHistoryLoading(false);
      },
      (error) => {
        console.error("Error loading notifications:", error);
        toast.error("Failed to load notification history");
        setHistoryLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      toast.error("Please fill in title and message");
      return;
    }

    if (!auth.currentUser) {
      toast.error("Not authenticated");
      return;
    }

    setIsLoading(true);

    try {
      // Get the auth token
      const authToken = await auth.currentUser.getIdToken();

      // Call server endpoint
      const response = await fetch("/api/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          url: url.trim() || undefined,
          authToken,
        }),
      });

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        throw new Error("Notification API returned an unexpected non-JSON response");
      }
      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
        recipientCount?: number;
      };
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to send notification");
      }
      toast.success(`Notification sent to ${result.recipientCount} students`);

      // Reset form
      setTitle("");
      setMessage("");
      setUrl("");
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send notification");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Send Notification Form */}
      <div className="glass rounded-lg p-6">
        <h2 className="mb-6 text-lg font-semibold">Send Notification</h2>

        <form onSubmit={handleSendNotification} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title"
              disabled={isLoading}
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Notification message"
              disabled={isLoading}
              rows={4}
              maxLength={500}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">URL (Optional)</label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              type="url"
              disabled={isLoading}
            />
          </div>

          <div className="rounded-lg bg-secondary p-4">
            <p className="text-sm text-muted-foreground">Send to: All subscribed students</p>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
            variant="neon"
          >
            {isLoading ? "Sending..." : "Send Notification"}
          </Button>
        </form>
      </div>

      {/* Notification History */}
      <div className="glass rounded-lg p-6">
        <h2 className="mb-6 text-lg font-semibold">Notification History</h2>

        {historyLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No notifications sent yet
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif) => (
              <div key={notif.id} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h3 className="font-semibold">{notif.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                  </div>
                  <div
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      notif.status === "sent"
                        ? "bg-green-500/10 text-green-500"
                        : notif.status === "pending"
                          ? "bg-yellow-500/10 text-yellow-500"
                          : "bg-red-500/10 text-red-500"
                    }`}
                  >
                    {notif.status.charAt(0).toUpperCase() + notif.status.slice(1)}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Sent: {new Date(notif.sentAt).toLocaleString()}</p>
                  <p>Recipients: {notif.recipientCount}</p>
                  {notif.url && <p>URL: {notif.url}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
