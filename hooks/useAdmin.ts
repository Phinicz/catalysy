import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
          setIsAdmin(false);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("admin")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching admin status:", profileError);
          setIsAdmin(false);
          return;
        }

        setIsAdmin(!!profile?.admin);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAdminStatus();
  }, []);

  return { isAdmin, isLoading };
}
