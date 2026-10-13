"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationButtonProps {
  onClickCallback?: () => void;
}

export function NotificationButton({ onClickCallback }: NotificationButtonProps) {
  const { requestNotificationPermission, isLoading, isEnabled } = useNotifications();

  const handleClick = async () => {
    await requestNotificationPermission();
    onClickCallback?.();
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading || isEnabled}
      variant="outline"
      size="sm"
      className="h-9 px-4"
      title={isEnabled ? "Notifications enabled" : "Enable notifications"}
    >
      <Bell className="size-4" />
      {isEnabled ? "Enabled" : "Enable"}
    </Button>
  );
}
