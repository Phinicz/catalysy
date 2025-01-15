//components/Sidebar.tsx
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import Image from "next/image";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  profile_picture: string | null;
  role: "player" | "partner";
}

interface PointCategory {
  color: string;
  value: number;
}

interface UserStats {
  completed: number;
  ongoing: number;
  points: {
    purple: number;
    black: number;
    green: number;
    yellow: number;
    gray: number;
    orange: number;
    blue: number;
    red: number;
  };
}

export default function Sidebar() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    completed: 0,
    ongoing: 0,
    points: {
      purple: 0,
      black: 0,
      green: 0,
      yellow: 0,
      gray: 0,
      orange: 0,
      blue: 0,
      red: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch tasks stats
      const { count: completedCount } = await supabase
        .from("tasks")
        .select("*", { count: "exact" })
        .eq("user_id", session.user.id)
        .eq("status", "completed");

      const { count: ongoingCount } = await supabase
        .from("tasks")
        .select("*", { count: "exact" })
        .eq("user_id", session.user.id)
        .eq("status", "ongoing");

      // Fetch points from different categories
      const { data: pointsData } = await supabase
        .from("user_points")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      setStats({
        completed: completedCount || 0,
        ongoing: ongoingCount || 0,
        points: pointsData?.points || {
          purple: 0,
          black: 0,
          green: 0,
          yellow: 0,
          gray: 0,
          orange: 0,
          blue: 0,
          red: 0,
        },
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPoints = Object.values(stats.points).reduce((a, b) => a + b, 0);

  if (isLoading) {
    return (
      <div className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-surface border-r border-[var(--color-border)] p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-surface border-r border-[var(--color-border)] p-6 overflow-y-auto">
      <div className="space-y-6">
        {/* Profile Section */}
        <div className="text-center">
          {profile?.profile_picture ? (
            <Image
              src={profile.profile_picture}
              alt={profile.username}
              width={96}
              height={96}
              className="rounded-full mx-auto"
            />
          ) : (
            <div className="w-24 h-24 bg-primary rounded-full mx-auto flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {profile?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <h3 className="mt-3 font-medium text-text-primary">
            {profile?.username}
          </h3>
          <p className="text-sm text-text-secondary">{profile?.email}</p>
        </div>

        {/* Stats Section */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-text-secondary">Completed</span>
            <span className="font-medium text-text-primary">
              {stats.completed}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Ongoing</span>
            <span className="font-medium text-text-primary">
              {stats.ongoing}
            </span>
          </div>
          <div className="h-0.5 bg-[var(--color-border)]" />
        </div>

        {/* Points Section */}
        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-3">
            Points Collected
          </h4>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {Object.entries(stats.points).map(([color, value]) => (
              <div
                key={color}
                className="aspect-square rounded-lg flex items-center justify-center relative"
                style={{ backgroundColor: `var(--color-${color}-light)` }}
              >
                <span className="text-xs font-medium text-text-primary">
                  {value}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Total Points</span>
            <span className="font-medium text-text-primary">{totalPoints}</span>
          </div>
        </div>

        {/* Profile Settings Link */}
        <div className="pt-4 border-t border-[var(--color-border)]">
          <button
            onClick={() => (window.location.href = "/profile")}
            className="w-full px-4 py-2 text-sm bg-red-500 rounded-lg font-medium"
          >
            Profile Settings
          </button>
        </div>
        <div className="pt-1 ">
          <button
            onClick={() => (window.location.href = "/challenge")}
            className="w-full px-4 py-2 text-sm bg-red-500 rounded-lg font-medium"
          >
            Submit Challenge
          </button>
        </div>
      </div>
    </div>
  );
}
