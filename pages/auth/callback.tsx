//pages/auth/callback.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabase";
import AuthModal from "../../components/AuthModal";
import Image from "next/image";
import { Gamepad2, Trophy, Gift } from "lucide-react";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Auth error:", error);
        router.push("/"); // Redirect to home on error
        return;
      }

      if (session) {
        // Check if profile exists
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          router.push("/stats"); // Redirect to dashboard if profile exists
        } else {
          router.push("/"); // Go home if no profile
        }
      } else {
        router.push("/"); // No session, go home
      }
    };

    // Small delay to ensure auth state is updated
    const timer = setTimeout(() => {
      handleCallback();
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      <div className="relative">
        <div className="w-full h-[400px] relative overflow-hidden rounded-lg">
          <Image
            src="/placeholders/achievements/1.jpg"
            alt="Level Up Your Gaming Experience"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
            <div className="absolute bottom-0 left-0 p-8">
              <h1 className="text-4xl font-bold text-white mb-2">
                Level Up Your Gaming Experience
              </h1>
              <p className="text-white/90">
                Complete achievements, earn rewards, and enhance your gameplay
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verifying Your Account
          </h2>
          <p className="text-gray-600">
            Please wait while we complete the authentication process...
          </p>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Play Games */}
          <div className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Gamepad2 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Play Games
            </h3>
            <p className="text-gray-600">
              Connect your gaming accounts and start playing
            </p>
          </div>

          {/* Complete Achievements */}
          <div className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Complete Achievements
            </h3>
            <p className="text-gray-600">Accomplish tasks and earn points</p>
          </div>

          {/* Earn Rewards */}
          <div className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Gift className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Earn Rewards
            </h3>
            <p className="text-gray-600">Redeem points for exclusive rewards</p>
          </div>
        </div>
      </div>

      {/* Featured Games */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Featured Games
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                <div className="aspect-video relative">
                  <Image
                    src={`/placeholders/achievements/${num}.jpg`}
                    alt={`Game ${num}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900">
                    Game Title {num}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Available Achievements: {25 + num * 5}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
