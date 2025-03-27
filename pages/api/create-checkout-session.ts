import { NextApiRequest, NextApiResponse } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    console.log("🔹 Received request:", req.body);

    // Extract and verify token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Unauthorized - No token provided" });
    }
    const token = authHeader.split(" ")[1]; // Extract token

    // Initialize Supabase client
    const supabase = createPagesServerClient({ req, res });

    // Authenticate user with extracted token
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      console.error("❌ Supabase auth error:", error);
      return res.status(401).json({ error: "User not authenticated" });
    }

    const user = data.user;
    console.log("✅ Authenticated user:", user);

    // Validate request body
    const { planId, planName, userEmail } = req.body;
    if (!planId || !planName || !userEmail) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Ensure email matches authenticated user's email
    if (userEmail !== user.email) {
      return res.status(403).json({ error: "Email mismatch" });
    }

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: planId, quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/subscriptions`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        planName,
      },
    });

    return res.status(200).json({ sessionId: checkoutSession.id });
  } catch (error: any) {
    console.error("❌ Error creating checkout session:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
}
