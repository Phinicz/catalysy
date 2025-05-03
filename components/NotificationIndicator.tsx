import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { notificationUpdateEvent } from "./NotificationModal";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";

interface NotificationPayload {
  user_id: string;
  read: boolean;
  [key: string]: any;
}

function NotificationAnimation() {
  return (
    <motion.div
      initial={{ x: "100vw", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "-100vw", opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      className="fixed bottom-24 right-3 z-[9999]"
    >
      <motion.div
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.5 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
        className="bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
      >
        <Bell className="w-5 h-5" />
        <span className="font-medium">New Notification!</span>
      </motion.div>
    </motion.div>
  );
}

export default function NotificationIndicator() {
  const [hasUnread, setHasUnread] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio on mount
  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
    audioRef.current.volume = 0.5;
    audioRef.current.load();
  }, []);

  const playNotificationSound = async () => {
    if (!audioRef.current) return;

    try {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          if (error.name === "NotAllowedError") {
            console.log("⚠️ Audio playback requires user interaction first");
          }
        });
      }
    } catch (error) {
      console.error("❌ Error playing notification sound:", error);
    }
  };

  // Show animation when new notification arrives
  const showNotificationAnimation = async () => {
    setShowAnimation(true);
    await playNotificationSound();
    setTimeout(() => {
      setShowAnimation(false);
    }, 2000); // Hide after 2 seconds
  };

  useEffect(() => {
    checkUnreadNotifications();

    // Subscribe to notification changes
    const channel = supabase
      .channel("notification_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        async (payload) => {
          const newNotification = payload.new as NotificationPayload;
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user && newNotification.user_id === session.user.id) {
            await showNotificationAnimation();
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
          await checkUnreadNotifications();
        }
      )
      .subscribe();

    // Check for unread notifications periodically as a fallback
    const intervalId = setInterval(checkUnreadNotifications, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const handleNotificationUpdate = () => {
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
      if (!session?.user) return;

      const { data, error } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("read", false);

      if (error) throw error;
      const count = data?.length || 0;

      // Show animation if count increased
      if (count > unreadCount) {
        await showNotificationAnimation();
      }

      setUnreadCount(count);
      setHasUnread(count > 0);
    } catch (error) {
      console.error("Error checking notifications:", error);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showAnimation && <NotificationAnimation />}
      </AnimatePresence>

      {hasUnread && (
        <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
          <span className="text-[10px] font-bold text-white leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        </div>
      )}
    </>
  );
}
