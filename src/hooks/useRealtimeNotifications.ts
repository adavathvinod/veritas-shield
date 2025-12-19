import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ScanAlert {
  id: string;
  username_scanned: string | null;
  verification_status: string;
  alert_message: string | null;
  scanned_at: string;
}

export const useRealtimeNotifications = (userId: string | undefined, enabled: boolean = true) => {
  const notificationPermission = useRef<NotificationPermission>("default");

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        notificationPermission.current = permission;
      });
    }
  }, []);

  const showNotification = useCallback((scan: ScanAlert) => {
    // Show toast notification
    toast.error(`Alert: @${scan.username_scanned || "Unknown"}`, {
      description: scan.alert_message || "Suspicious content detected",
      duration: 8000,
    });

    // Show browser notification if permitted
    if (notificationPermission.current === "granted" && "Notification" in window) {
      new Notification("Veritas Alert", {
        body: `@${scan.username_scanned}: ${scan.alert_message || "Suspicious content detected"}`,
        icon: "/favicon.ico",
        tag: scan.id, // Prevent duplicate notifications
      });
    }

    // Play alert sound (optional)
    try {
      const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2telezoAHIXL9cBSEwApjaez/3pFMF1YkPvdZT8vVjx+8cdxXDs9OGfl03xiIipbfsTyrGMeJVSAyPK6bB0");
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore autoplay restrictions
    } catch {}
  }, []);

  useEffect(() => {
    if (!userId || !enabled) return;

    console.log("Setting up realtime notifications for user:", userId);

    const channel = supabase
      .channel("scan-alerts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "scan_history",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("New scan detected:", payload);
          const scan = payload.new as ScanAlert;
          
          if (scan.verification_status === "alert") {
            showNotification(scan);
          }
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
      });

    return () => {
      console.log("Cleaning up realtime subscription");
      supabase.removeChannel(channel);
    };
  }, [userId, enabled, showNotification]);

  const requestPermission = useCallback(async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      notificationPermission.current = permission;
      return permission === "granted";
    }
    return false;
  }, []);

  return { requestPermission };
};
