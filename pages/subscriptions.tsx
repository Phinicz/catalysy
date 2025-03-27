"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSubscriptions } from "../hooks/useSubscriptions";
import {
  Check,
  Star,
  Rocket,
  Shield,
  Zap,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "@/lib/supabase";
const PlanBadge = ({ children, color = "bg-gray-700" }: any) => (
  <motion.span
    className={`inline-flex items-center justify-center p-1 rounded-full ${color}`}
    whileHover={{ scale: 1.2, rotate: 5 }}
    whileTap={{ scale: 0.9 }}
  >
    {children}
  </motion.span>
);

const SubscriptionPage = () => {
  const { data: subscriptionsData, error, isLoading } = useSubscriptions();
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: any) => {
    try {
      setLoadingPlan(plan.id);

      // Get user and token from Supabase Auth
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Please sign in to subscribe");
      }

      console.log("Authenticated user:", user);

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile error:", profileError);
        throw new Error("Failed to fetch user profile");
      }

      console.log("User profile:", profile);

      // Get the Supabase access token
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      console.log("Token:", token);

      if (!token) {
        throw new Error("Failed to retrieve authentication token");
      }

      // Call API to create a Stripe checkout session
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Pass token explicitly
        },
        credentials: "include", // Ensure cookies are sent
        body: JSON.stringify({
          planId: plan.stripe_price_id,
          planName: plan.name,
          userEmail: user.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.error || "Failed to create checkout session");
      }

      const { sessionId } = await response.json();

      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
      );
      if (!stripe) throw new Error("Failed to load Stripe");

      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error("Error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoadingPlan(null);
    }
  };

  // Error and Loading states remain similar to previous version
  if (error) {
    return (
      <div className="pt-28 px-4 bg-[#0a0a0a] min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400"
        >
          <h2 className="text-xl font-bold mb-2">
            Error Loading Subscriptions
          </h2>
          <p>{error}</p>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="pt-28 px-4 bg-[#0a0a0a] min-h-screen flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.6, 1, 0.6],
            transition: { repeat: Infinity, duration: 1.5 },
          }}
          className="bg-gray-900 rounded-lg p-6 text-gray-300 max-w-md w-full text-center"
        >
          <div className="flex justify-center mb-4">
            <Rocket className="w-12 h-12 text-purple-500 animate-pulse" />
          </div>
          <p className="text-xl">Loading your epic plans...</p>
        </motion.div>
      </div>
    );
  }

  if (!subscriptionsData) {
    return (
      <div className="pt-28 px-4 bg-[#0a0a0a] min-h-screen">
        <div className="bg-gray-900 rounded-lg p-4 text-gray-300 text-center">
          <p>No subscription plans available</p>
        </div>
      </div>
    );
  }

  // Plan configuration
  const getPlanConfig = (planName: any) => {
    switch (planName) {
      case "Premium":
        return {
          gradient: "from-purple-900/70 via-purple-800/50 to-black",
          textColor: "text-purple-300",
          accentColor: "bg-purple-600",
          icon: <Star className="w-8 h-8 text-yellow-400" />,
          glowColor: "group-hover:shadow-[0_0_60px_-15px_rgba(168,85,247,0.6)]",
        };
      case "Standard":
        return {
          gradient: "from-blue-900/70 via-blue-800/50 to-black",
          textColor: "text-blue-300",
          accentColor: "bg-blue-600",
          icon: <Shield className="w-8 h-8 text-blue-400" />,
          glowColor: "group-hover:shadow-[0_0_60px_-15px_rgba(59,130,246,0.6)]",
        };
      default:
        return {
          gradient: "from-gray-900/70 via-gray-800/50 to-black",
          textColor: "text-gray-300",
          accentColor: "bg-gray-600",
          icon: <Rocket className="w-8 h-8 text-gray-400" />,
          glowColor:
            "group-hover:shadow-[0_0_60px_-15px_rgba(156,163,175,0.6)]",
        };
    }
  };

  return (
    <div className="min-h-screen  py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center mb-16"
      >
        <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
          Unlock Your Gaming Potential
        </h1>
        <p className="text-gray-400 text-xl max-w-2xl mx-auto">
          Choose the perfect plan to elevate your gaming experience and access
          exclusive rewards
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {subscriptionsData.map((plan, index) => {
          const planConfig = getPlanConfig(plan.name);

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.2,
                duration: 0.5,
              }}
              onHoverStart={() => setHoveredPlan(plan.id)}
              onHoverEnd={() => setHoveredPlan(null)}
              className={`group relative rounded-2xl overflow-hidden 
                bg-gradient-to-br ${planConfig.gradient} 
                border-2 ${
                  plan.name === "Premium"
                    ? "border-purple-800"
                    : plan.name === "Standard"
                    ? "border-blue-800"
                    : "border-gray-800"
                }
                transform transition-all duration-300
                ${planConfig.glowColor}
                shadow-xl`}
            >
              {/* Popular Badge */}
              {plan.name === "Premium" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute top-4 right-4 z-10"
                >
                  <span className="px-4 py-2 bg-purple-700 text-white text-xs rounded-full shadow-lg">
                    Most Popular
                  </span>
                </motion.div>
              )}

              <div className="p-6 relative z-0">
                {/* Plan Header */}
                <div className="text-center mb-6 flex flex-col items-center">
                  {planConfig.icon}
                  <h3
                    className={`text-3xl font-bold mt-2 mb-1 ${planConfig.textColor}`}
                  >
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-white">
                      ${plan.price}
                    </span>
                    <span className="text-gray-400 ml-1">/month</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-6">
                  {[
                    {
                      icon: <Check className="w-4 h-4 text-white" />,
                      color:
                        plan.max_rank === "VIP"
                          ? "bg-yellow-600"
                          : plan.max_rank === "Epic"
                          ? "bg-purple-600"
                          : "bg-gray-600",
                      text: `Max Rank: ${plan.max_rank}`,
                    },
                    {
                      icon: <Zap className="w-4 h-4 text-white" />,
                      color: "bg-blue-600",
                      text: `${plan.OG_Points} OG Points`,
                    },
                    ...(plan.achievement_tier
                      ? [
                          {
                            icon: <TrendingUp className="w-4 h-4 text-white" />,
                            color: "bg-green-600",
                            text: `${plan.achievement_tier} Achievement Tier`,
                          },
                        ]
                      : []),
                    ...(plan.early_access
                      ? [
                          {
                            icon: <Rocket className="w-4 h-4 text-white" />,
                            color: "bg-purple-600",
                            text: "Early Access",
                          },
                        ]
                      : []),
                    ...(plan.free_shipping
                      ? [
                          {
                            icon: <Check className="w-4 h-4 text-white" />,
                            color: "bg-indigo-600",
                            text: "Free Shipping",
                          },
                        ]
                      : []),
                  ].map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center space-x-2"
                    >
                      <PlanBadge color={feature.color}>
                        {feature.icon}
                      </PlanBadge>
                      <span className="text-gray-300">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Hover Details */}
                <AnimatePresence>
                  {hoveredPlan === plan.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="absolute inset-x-0 bottom-20 bg-black/80 p-4 text-center"
                    >
                      <p className="text-gray-300 text-sm">
                        Unlock exclusive features and take your gaming to the
                        next level!
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Subscribe Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors 
                    ${planConfig.accentColor} text-white
                    hover:brightness-110 
                    shadow-lg
                    disabled:opacity-50 disabled:cursor-not-allowed`}
                  onClick={() => handleSubscribe(plan)}
                  disabled={loadingPlan === plan.id}
                >
                  {loadingPlan === plan.id ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : plan.price === 0 ? (
                    "Get Started"
                  ) : (
                    "Subscribe Now"
                  )}
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionPage;
