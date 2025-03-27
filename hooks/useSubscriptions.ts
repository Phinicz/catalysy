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
}

export function useSubscriptions() {
  const [data, setData] = useState<Subscription[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        console.log("Fetching subscription plans...");
        const { data, error } = await supabase
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

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        console.log("Fetched subscription plans:", data);
        if (data) {
          setData(data);
        } else {
          console.log("No data returned from query");
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

  return { data, error, isLoading };
}
