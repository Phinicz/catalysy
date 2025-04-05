import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function SubscriptionSuccess() {
  const router = useRouter();
  const { session_id } = router.query;
  const [status, setStatus] = useState("processing");

  useEffect(() => {
    if (session_id) {
      activateSubscription();
    }
  }, [session_id]);

  const activateSubscription = async () => {
    try {
      const response = await fetch("/api/verify-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        credentials: "include",
        body: JSON.stringify({ sessionId: session_id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to verify subscription");
      }

      const { customerId, planName } = await response.json();

      // Get the plan_id based on the plan name
      const { data: planData, error: planError } = await supabase
        .from("subscription_plans")
        .select("id")
        .eq("name", planName)
        .single();

      if (planError || !planData) {
        console.error("Plan error:", planError);
        throw new Error("Failed to find plan");
      }

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("User error:", userError);
        throw new Error("Failed to get user");
      }

      // First, end the current active subscription if it exists
      const { error: endSubscriptionError } = await supabase
        .from("user_subscriptions")
        .update({
          status: "ended",
          end_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("status", "active");

      if (endSubscriptionError) {
        console.error(
          "Error ending current subscription:",
          endSubscriptionError
        );
        throw new Error("Failed to end current subscription");
      }

      // Create new subscription
      const { error: createError } = await supabase
        .from("user_subscriptions")
        .insert({
          id: crypto.randomUUID(),
          user_id: user.id,
          plan_id: planData.id,
          status: "active",
          start_date: new Date().toISOString(),
          end_date: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(), // 30 days from now
          payment_id: customerId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (createError) {
        console.error("Error creating new subscription:", createError);
        throw new Error("Failed to create new subscription");
      }

      setStatus("success");
      setTimeout(() => router.push("/profile"), 2000);
    } catch (error) {
      console.error("Error activating subscription:", error);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
        {status === "processing" && (
          <>
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Activating Your Subscription
            </h2>
            <p className="text-gray-400">
              Please wait while we set up your account...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-12 h-12 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Subscription Activated!
            </h2>
            <p className="text-gray-400">Redirecting you to your profile...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-12 h-12 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Something Went Wrong
            </h2>
            <p className="text-gray-400 mb-4">
              There was an error activating your subscription.
            </p>
            <button
              onClick={() => router.push("/subscriptions")}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
