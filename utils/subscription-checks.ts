import { supabase } from "../lib/supabase";
import { createSubscriptionExpiringNotification } from "./notifications";

// Function to check for subscriptions that are about to expire
export async function checkExpiringSubscriptions() {
  try {
    const today = new Date();
    const threeDaysFromNow = new Date(
      today.getTime() + 3 * 24 * 60 * 60 * 1000
    );

    // Get active subscriptions that are about to expire
    const { data: expiringSubscriptions, error } = await supabase
      .from("user_subscriptions")
      .select(
        `
        *,
        user_profiles!inner(id, username),
        subscription_plans!inner(name)
      `
      )
      .eq("status", "active")
      .lt("end_date", threeDaysFromNow.toISOString())
      .gt("end_date", today.toISOString());

    if (error) {
      console.error("Error checking expiring subscriptions:", error);
      return;
    }

    // Send notifications for each expiring subscription
    for (const subscription of expiringSubscriptions) {
      const daysLeft = Math.ceil(
        (new Date(subscription.end_date).getTime() - today.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      // Only notify if 3 days, 2 days, or 1 day left
      if (daysLeft <= 3) {
        await createSubscriptionExpiringNotification(
          subscription.user_id,
          subscription.subscription_plans.name,
          daysLeft
        );
      }
    }

    console.log(
      `Checked ${expiringSubscriptions.length} expiring subscriptions`
    );
  } catch (error) {
    console.error("Error in checkExpiringSubscriptions:", error);
  }
}

// Function to handle expired subscriptions
export async function handleExpiredSubscriptions() {
  try {
    const now = new Date().toISOString();

    // Get expired active subscriptions
    const { data: expiredSubscriptions, error } = await supabase
      .from("user_subscriptions")
      .select(
        `
        *,
        subscription_plans!inner(name)
      `
      )
      .eq("status", "active")
      .lt("end_date", now);

    if (error) {
      console.error("Error checking expired subscriptions:", error);
      return;
    }

    // Update expired subscriptions to inactive
    for (const subscription of expiredSubscriptions) {
      const { error: updateError } = await supabase
        .from("user_subscriptions")
        .update({ status: "expired" })
        .eq("id", subscription.id);

      if (updateError) {
        console.error("Error updating expired subscription:", updateError);
        continue;
      }

      // Get the free plan details
      const { data: freePlan } = await supabase
        .from("subscription_plans")
        .select("id, OG_Points")
        .eq("name", "Free")
        .single();

      if (freePlan) {
        // Update user's profile to free plan benefits
        await supabase
          .from("user_profiles")
          .update({
            subscription: "Free",
            og_points: freePlan.OG_Points,
          })
          .eq("id", subscription.user_id);
      }
    }

    console.log(
      `Processed ${expiredSubscriptions.length} expired subscriptions`
    );
  } catch (error) {
    console.error("Error in handleExpiredSubscriptions:", error);
  }
}
