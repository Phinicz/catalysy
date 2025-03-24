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
                  gems: 0,
                  profile_picture: session.user.user_metadata.avatar_url,
                });

              if (createError) {
                console.error("Profile creation error:", createError);
                throw createError;
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
