//pages/auth/callback.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth error:", error);
          router.push("/"); // Redirect to home on error
          return;
        }

        if (session?.user) {
          // Wait for a short time to ensure the user is created in the database
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Check if profile exists
          const { data: profile, error: profileError } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profileError && profileError.code !== "PGRST116") {
            // PGRST116 is "not found" error
            throw profileError;
          }

          if (!profile) {
            // If no profile exists, create one for Google users
            if (session.user.app_metadata.provider === "google") {
              // Get the free plan ID and benefits
              const { data: freePlan, error: planError } = await supabase
                .from("subscription_plans")
                .select("id, OG_Points")
                .eq("name", "Free")
                .single();

              if (planError) {
                console.error("Error fetching free plan:", planError);
                throw planError;
              }

              const { error: createError } = await supabase
                .from("user_profiles")
                .insert({
                  id: session.user.id,
                  username:
                    session.user.user_metadata.full_name ||
                    session.user.email?.split("@")[0],
                  email: session.user.email,
                  role: "player",
                  coins: 0,
                  points: 0,
                  profile_picture: session.user.user_metadata.avatar_url,
                  subscription: "Free",
                  og_points: freePlan.OG_Points || 500, // Default to 500 if not specified in plan
                });

              if (createError) {
                console.error("Profile creation error:", createError);
                throw createError;
              }

              // Create subscription record for Google OAuth users
              const { error: subscriptionError } = await supabase
                .from("user_subscriptions")
                .insert({
                  user_id: session.user.id,
                  plan_id: freePlan.id,
                  status: "active",
                  start_date: new Date().toISOString(),
                });

              if (subscriptionError) {
                console.error(
                  "Subscription creation error:",
                  subscriptionError
                );
                throw subscriptionError;
              }
            }
          }
        }

        // Always redirect to home after handling auth
        router.push("/");
      } catch (error) {
        console.error("Callback error:", error);
        router.push("/"); // Redirect to home on error
      }
    };

    handleCallback();
  }, [router]);

  // Simple loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">Please wait...</h2>
      </div>
    </div>
  );
}
