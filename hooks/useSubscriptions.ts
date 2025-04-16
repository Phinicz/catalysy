import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface Subscription {
  id: string;
  created_at: string;
  name: string;
  price: number;
  max_rank: string;
  multiplier: string;
  achievement_tier: string;
  store_perks: any;
  early_access: boolean;
  free_shipping: boolean;
  updated_at: string;
  OG_Points: number;
  stripe_price_id: string;
}

interface UserSubscription {
  plan_id: string;
  status: string;
  end_date: string;
}

export function useSubscriptions() {
  const [data, setData] = useState<Subscription[] | null>(null);
  const [currentSubscription, setCurrentSubscription] =
    useState<Subscription | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        console.log("Fetching subscription plans...");

        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;

        // Fetch all subscription plans
        const { data: plans, error: plansError } = await supabase
          .from("subscription_plans")
          .select(
            `
            id,
            created_at,
            name,
            price,
            max_rank,
            multiplier,
            achievement_tier,
            store_perks,
            early_access,
            free_shipping,
            updated_at,
            OG_Points,
            stripe_price_id
          `
          )
          .order("price", { ascending: true });

        if (plansError) throw plansError;

        // Set all available plans
        setData(plans);

        // If user is logged in, fetch their current subscription
        if (user) {
          const { data: userSub, error: userSubError } = await supabase
            .from("user_subscriptions")
            .select("plan_id, status, end_date")
            .eq("user_id", user.id)
            .eq("status", "active")
            .single();

          if (!userSubError && userSub) {
            // Find the subscription plan details
            const currentPlan = plans.find(
              (plan) => plan.id === userSub.plan_id
            );
            if (currentPlan) {
              setCurrentSubscription(currentPlan);
            }
          }
        }
      } catch (err) {
        console.error("Detailed error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch subscriptions"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchSubscriptions();
  }, []);

  return { data, currentSubscription, error, isLoading };
}
