import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface NotificationPayload {
  user_id: string;
  read: boolean;
  [key: string]: any;
}

export default function NotificationIndicator() {
  const [hasUnread, setHasUnread] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    checkUnreadNotifications();

    // Subscribe to notification changes
    const channel = supabase
      .channel("notification_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        async (
          payload: RealtimePostgresChangesPayload<NotificationPayload>
        ) => {
          console.log("[Notification Debug] Change detected:", payload);
          // Check if this notification is for the current user
          const {
            data: { session },
          } = await supabase.auth.getSession();

          const newNotification = payload.new as NotificationPayload | null;
          if (
            session?.user &&
            newNotification &&
            newNotification.user_id === session.user.id
          ) {
            console.log(
              "[Notification Debug] New notification for current user"
            );
            await checkUnreadNotifications();
          }
        }
      )
      .subscribe((status) => {
        console.log("[Notification Debug] Subscription status:", status);
      });

    // Check for unread notifications periodically as a fallback
    const intervalId = setInterval(checkUnreadNotifications, 30000); // Check every 30 seconds

    return () => {
      supabase.removeChannel(channel);
      clearInterval(intervalId);
    };
  }, []);

  const checkUnreadNotifications = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        console.log("[Notification Debug] No active session found");
        setHasUnread(false);
        return;
      }

      console.log(
        "[Notification Debug] Checking unread notifications for user:",
        session.user.id
      );

      const { data, count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact" })
        .eq("user_id", session.user.id)
        .eq("read", false)
        .limit(1); // We only need to know if there are any unread notifications

      if (error) {
        console.error(
          "[Notification Debug] Error checking notifications:",
          error
        );
        throw error;
      }

      const hasUnreadNotifications = count ? count > 0 : false;
      console.log("[Notification Debug] Unread notifications check result:", {
        count,
        hasUnread: hasUnreadNotifications,
        userId: session.user.id,
      });

      setDebugInfo({
        count,
        lastCheck: new Date().toISOString(),
        userId: session.user.id,
      });
      setHasUnread(hasUnreadNotifications);
    } catch (error: any) {
      console.error(
        "[Notification Debug] Error checking notifications:",
        error
      );
      setDebugInfo({ error: error?.message || "Unknown error" });
      // Don't update hasUnread state on error to preserve previous state
    }
  };

  // Add this if you want to see debug info in development
  if (process.env.NODE_ENV === "development" && debugInfo) {
    console.log("[Notification Debug] Indicator state:", debugInfo);
  }

  if (!hasUnread) return null;

  return (
    <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
  );
}
