//pages/auth/callback.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabase";

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

      if (session?.user) {
        // Check if profile exists
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (!profile) {
          // If no profile exists, create one for Google users
          if (session.user.app_metadata.provider === "google") {
            await supabase.from("user_profiles").insert({
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
          }
        }
      }

      // Always redirect to home after handling auth
      router.push("/");
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
