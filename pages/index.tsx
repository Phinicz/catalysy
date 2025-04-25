//pages/index.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import SlidingBanner from "../components/Banner/SlidingBanner";
import {
  Gamepad2,
  Trophy,
  Gift,
  Users,
  Target,
  Star,
  User,
} from "lucide-react";
import { useRouter } from "next/router";
import { useApi } from "@/context/ApiContext";
import { Achievement } from "@/types/Achievement";

export default function HomePage() {
  const [userRole, setUserRole] = useState<"player" | "partner" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [usercount, setUserCount] = useState(0);
  const [trendingAchievements, setTrendingAchievements] = useState<
    Achievement[]
  >([]);
  const router = useRouter();

  const { getUserCount } = useApi();

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const response = await getUserCount({
          organizationId: process.env.NEXT_PUBLIC_ORGANIZATION_ID || "",
          websiteId: process.env.NEXT_PUBLIC_WEBSITE_ID || "",
        });
        setUserCount(response.totalCount);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUserCount();
  }, [getUserCount]);

  useEffect(() => {
    fetchUserRole();
    fetchTrendingAchievements();
  }, []);

  const fetchTrendingAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      setTrendingAchievements(data || []);
    } catch (error) {
      console.error("Error fetching trending achievements:", error);
    }
  };

  const fetchUserRole = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        setUserRole(data?.role || null);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching user role:", error);
      setIsLoading(false);
    }
  };

  const playerContent = {
    bannerItems: trendingAchievements.map((achievement) => ({
      id: achievement.id,
      imageUrl: achievement.imageUrl,
      title: achievement.title,
      description: achievement.description,
    })),
    howItWorks: [
      {
        icon: <Gamepad2 className="w-8 h-8 text-gray-500" />,
        title: "Play Games",
        description:
          "Connect your gaming accounts and start playing your favorite games",
      },
      {
        icon: <Trophy className="w-8 h-8 text-gray-500" />,
        title: "Complete Achievements",
        description:
          "Accomplish in-game tasks and earn points for your success",
      },
      {
        icon: <Gift className="w-8 h-8 text-gray-500" />,
        title: "Earn Rewards",
        description:
          "Redeem your points for exclusive gaming rewards and perks",
      },
    ],
  };

  const partnerContent = {
    bannerItems: [
      {
        id: "1",
        imageUrl: "/partner-banner1.jpg",
        title: "Boost Players' Experience",
        description: "Help gamers achieve their goals and earn while doing it",
      },
      {
        id: "2",
        imageUrl: "/partner-banner2.jpg",
        title: "Flexible Scheduling",
        description: "Choose your own hours and games to boost",
      },
      {
        id: "3",
        imageUrl: "/partner-banner3.jpg",
        title: "Competitive Earnings",
        description: "Earn competitive rates for your gaming expertise",
      },
    ],
    howItWorks: [
      {
        icon: <Users className="w-8 h-8 text-primary" />,
        title: "Join Our Network",
        description: "Become part of our trusted network of gaming experts",
      },
      {
        icon: <Target className="w-8 h-8 text-primary" />,
        title: "Choose Your Services",
        description: "Select the games and services you want to offer",
      },
      {
        icon: <Star className="w-8 h-8 text-primary" />,
        title: "Start Earning",
        description: "Help players achieve their goals and earn rewards",
      },
    ],
  };

  const content = userRole === "partner" ? partnerContent : playerContent;

  return (
    <div className="pt-16">
      <div className="max-w-7xl mx-auto px-4">
        <SlidingBanner items={content.bannerItems} />

        <div className="mt-16 mb-20">
          <h2 className="text-3xl text-white font-bold text-text-primary text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {content.howItWorks.map((item, index) => (
              <div
                key={index}
                className="p-6 bg-surface rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-text-primary mb-4">
                  {item.title}
                </h3>
                <p className="text-text-secondary">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-text-primary text-white text-center mb-12">
            {userRole === "partner" ? "Why Choose Us" : "Featured Games"}
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {userRole === "partner" ? (
              <>
                <div className="p-6 bg-surface rounded-lg text-center">
                  <h4 className="text-2xl font-bold text-primary mb-2">
                    $500+
                  </h4>
                  <p className="text-text-secondary">Average Weekly Earnings</p>
                </div>
                <div className="p-6 bg-surface rounded-lg text-center">
                  <h4 className="text-2xl font-bold text-primary mb-2">
                    1000+
                  </h4>
                  <p className="text-text-secondary">Active Players</p>
                </div>
                <div className="p-6 bg-surface rounded-lg text-center">
                  <h4 className="text-2xl font-bold text-primary mb-2">24/7</h4>
                  <p className="text-text-secondary">Support Available</p>
                </div>
                <div className="p-6 bg-surface rounded-lg text-center">
                  <h4 className="text-2xl font-bold text-primary mb-2">100%</h4>
                  <p className="text-text-secondary">Secure Payments</p>
                </div>
              </>
            ) : (
              trendingAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-surface rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/achievements`)}
                >
                  <div className="aspect-video bg-gray-200 relative">
                    <img
                      src={achievement.imageUrl}
                      alt={achievement.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-text-primary mb-1">
                      {achievement.title}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      Points: {achievement.points}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="text-center mb-20">
          <h2 className="text-3xl font-bold text-white text-text-primary mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-text-secondary text-white mb-8 max-w-2xl mx-auto">
            {userRole === "partner"
              ? "Join our network of gaming experts and start earning today!"
              : "Level up your gaming experience and earn rewards while playing!"}
          </p>
          <button
            onClick={() =>
              router.push(userRole === "partner" ? "/partner" : "/achievements")
            }
            className="px-8 py-3 text-white bg-gray-600 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            {userRole === "partner" ? "Become a Partner" : "Start Playing"}
          </button>
        </div>
      </div>
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => router.push("/feedback")}
          className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-800 transition-all"
        >
          <Star className="w-5 h-5 mr-2" />
          Feedback
        </button>
      </div>
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => router.push("/users")}
          className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-800 transition-all"
        >
          <User className="w-5 h-5 mr-2" />
          Total User: {usercount}
        </button>
      </div>
    </div>
  );
}
