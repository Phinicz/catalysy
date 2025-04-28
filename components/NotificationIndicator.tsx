import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { notificationUpdateEvent } from "./NotificationModal";

interface NotificationPayload {
  user_id: string;
  read: boolean;
  [key: string]: any;
}

export default function NotificationIndicator() {
  const [hasUnread, setHasUnread] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const playNotificationSound = async () => {
    console.log("🔊 Attempting to play notification sound...");
    try {
      const audio = new Audio("/notification.mp3");
      console.log("🎵 Audio object created");

      // Preload the audio
      console.log("⏳ Loading audio file...");
      await audio.load();
      console.log("✅ Audio file loaded");

      // Set volume to a reasonable level
      audio.volume = 0.5;
      console.log("🔉 Volume set to 0.5");

      // Play the sound
      console.log("▶️ Attempting to play...");
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("✅ Sound played successfully!");
          })
          .catch((error) => {
            console.error("❌ Error playing notification sound:", error);
            // Check if it's a user interaction error
            if (error.name === "NotAllowedError") {
              console.log("⚠️ Audio playback requires user interaction first");
              console.log("💡 Try clicking somewhere on the page first");
            }
          });
      }
    } catch (error) {
      console.error("❌ Error setting up notification sound:", error);
    }
  };

  useEffect(() => {
    console.log("🔄 Setting up notification listener...");
    checkUnreadNotifications();

    // Subscribe to notification changes
    const channel = supabase
      .channel("notification_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT", // Only listen for new notifications
          schema: "public",
          table: "notifications",
        },
        async (payload) => {
          console.log("📬 New notification received:", payload);

          const newNotification = payload.new as NotificationPayload;
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user && newNotification.user_id === session.user.id) {
            console.log("🎯 Notification is for current user");
            // Play sound immediately for new notifications
            await playNotificationSound();
            // Then update the count
            await checkUnreadNotifications();
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
        },
        async () => {
          console.log("🔄 Notification updated, refreshing count");
          await checkUnreadNotifications();
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Successfully subscribed to notification changes");
        }
      });

    // Check for unread notifications periodically as a fallback
    const intervalId = setInterval(checkUnreadNotifications, 30000);

    // Cleanup
    return () => {
      console.log("🔌 Cleaning up notification listener...");
      supabase.removeChannel(channel);
      clearInterval(intervalId);
    };
  }, []);

  // Add event listener for notification updates
  useEffect(() => {
    const handleNotificationUpdate = () => {
      console.log("🔄 Notification update event received, refreshing count...");
      checkUnreadNotifications();
    };

    window.addEventListener("notificationsUpdated", handleNotificationUpdate);

    return () => {
      window.removeEventListener(
        "notificationsUpdated",
        handleNotificationUpdate
      );
    };
  }, []);

  const checkUnreadNotifications = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        console.log("⚠️ No user session found");
        return;
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("read", false);

      if (error) throw error;
      const count = data?.length || 0;
      setUnreadCount(count);
      setHasUnread(count > 0);
    } catch (error) {}
  };

  // Add a test function to the window object for debugging
  useEffect(() => {
    (window as any).testNotificationSound = playNotificationSound;
    console.log(
      "🛠️ Test function added. Run testNotificationSound() in console to test the sound"
    );
    return () => {
      delete (window as any).testNotificationSound;
    };
  }, []);

  if (!hasUnread) return null;

  return (
    <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
      <span className="text-[10px] font-bold text-white leading-none">
        {unreadCount > 99 ? "99+" : unreadCount}
      </span>
    </div>
  );
}
