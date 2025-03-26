import { supabase } from "@/lib/supabase";
import { Achievement } from "@/types/Achievement";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievement: Achievement;
}

export default function AchievementModal({ isOpen, onClose, achievement }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const startTask = async ()=>{
    setIsLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      try {
        const { error: insertError } = await supabase
        .from("tasks")
        .insert({ 
          // id: achievement.id,
          user_id: session.user.id,
          title: achievement.title,
          description: achievement.description,
          status: "ongoing",
          created_at: new Date().toISOString(),
          progress: 0,
        });
        if (insertError) {
          console.error("Task creation error:", insertError);
          throw insertError;
        }
        window.open(achievement.game.deeplink, "_blank");
      } catch (err) {
        console.error("Task creation error:", err);
        throw new Error("Failed to subscribe to task. Please try again.");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"; // Disable scrolling
    } else {
      document.body.style.overflow = ""; // Re-enable scrolling
    }

    return () => {
      document.body.style.overflow = ""; // Clean up when component unmounts
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with blur effect */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden my-4 border border-gray-800">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/70 hover:text-white bg-black/50 hover:bg-black/70 p-1.5 rounded-full transition-all duration-200 z-10"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
          <div className="flex flex-col items-center justify-center mb-4">
            <div className="aspect-video relative">
              <img
                src={achievement.imageUrl}
                alt={achievement.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-4 w-full">
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={achievement.game.icon}
                  alt={achievement.game.name}
                  className="w-6 h-6 rounded"
                />
                <span className="text-sm text-text-secondary">
                  {achievement.game.name}
                </span>
              </div>
              <h3 className="font-medium text-text-primary mb-1">
                {achievement.title}
              </h3>
              <p className="text-sm text-text-secondary mb-3">
                {achievement.description}
              </p>
              <div className="flex items-center justify-between text-xs text-text-tertiary">
                <span>Start: {achievement.startDate}</span>
                <span>End: {achievement.endDate}</span>
              </div>
              <div
                className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  achievement.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {achievement.status === "active" ? "Active" : "Expired"}
              </div>
              <div className="w-full flex justify-end">
                  <button
                    className="w-52 py-2 px-4 bg-green-600 font-semibold text-white rounded-lg hover:bg-gray-800 transition-colors"
                    onClick={startTask}
                  >
                    Start Task
                  </button>
              </div>
            </div>
          </div>
      </div>
    </>
  );
}
