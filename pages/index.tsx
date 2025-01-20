//pages/index.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import SlidingBanner from "../components/Banner/SlidingBanner";
import { Gamepad2, Trophy, Gift, Users, Target, Star } from "lucide-react";
import { useRouter } from "next/router";

export default function HomePage() {
  const [userRole, setUserRole] = useState<"player" | "partner" | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUserRole();
  }, []);

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
    bannerItems: [
      {
        id: "1",
        imageUrl: "/placeholders/achivements/1.jpg",
        title: "Level Up Your Gaming Experience",
        description:
          "Complete achievements, earn rewards, and enhance your gameplay",
      },
      {
        id: "2",
        imageUrl: "/placeholders/achivements/2.jpg",
        title: "Join Gaming Challenges",
        description:
          "Compete in daily and weekly challenges to earn exclusive rewards",
      },
      {
        id: "3",
        imageUrl: "/placeholders/achivements/3.jpg",
        title: "Connect with Pro Players",
        description:
          "Get coached by experienced players and improve your skills",
      },
    ],
    howItWorks: [
      {
        icon: <Gamepad2 className="w-8 h-8 text-primary" />,
        title: "Play Games",
        description:
          "Connect your gaming accounts and start playing your favorite games",
      },
      {
        icon: <Trophy className="w-8 h-8 text-primary" />,
        title: "Complete Achievements",
        description:
          "Accomplish in-game tasks and earn points for your success",
      },
      {
        icon: <Gift className="w-8 h-8 text-primary" />,
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
    <div className="min-h-screen py-20  ">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <SlidingBanner items={content.bannerItems} />

        <div className="mt-16 mb-20">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-12">
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
          <h2 className="text-3xl font-bold text-text-primary text-center mb-12">
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
              Array(4)
                .fill(null)
                .map((_, index) => (
                  <div
                    key={index}
                    className="bg-surface rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-video bg-gray-200 relative">
                      <img
                        src={`/placeholders/achivements/${index + 1}.jpg`}
                        alt="Game Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-text-primary mb-1">
                        Game Title {index + 1}
                      </h4>
                      <p className="text-sm text-text-secondary">
                        Available Achievements: {25 + index * 5}
                      </p>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        <div className="text-center mb-20">
          <h2 className="text-3xl font-bold text-text-primary mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-text-secondary mb-8 max-w-2xl mx-auto">
            {userRole === "partner"
              ? "Join our network of gaming experts and start earning today!"
              : "Level up your gaming experience and earn rewards while playing!"}
          </p>
          <button className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
            {userRole === "partner" ? "Become a Partner" : "Start Playing"}
          </button>
        </div>
      </div>
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => router.push("/feedback")}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-all"
        >
          <Star className="w-5 h-5 mr-2" />
          Feedback
        </button>
      </div>
    </div>
  );
}
