import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CreditCard,
  Coins,
  Star,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { loadStripe } from "@stripe/stripe-js";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: number;
    name: string;
    price: number;
    price_og_points?: number | null;
  };
  userOGPoints?: number;
  onOGPointsUpdate?: (newPoints: number) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  item,
  userOGPoints = 0,
  onOGPointsUpdate,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<
    "crypto" | "card" | "og_points" | null
  >(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [showCryptoModal, setShowCryptoModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentOGPoints, setCurrentOGPoints] = useState<number>(userOGPoints);
  const [isLoadingPoints, setIsLoadingPoints] = useState(false);

  const fetchUserOGPoints = async () => {
    try {
      setIsLoadingPoints(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("og_points")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      if (profile) {
        setCurrentOGPoints(profile.og_points);
        if (onOGPointsUpdate) {
          onOGPointsUpdate(profile.og_points);
        }
      }
    } catch (error) {
      console.error("Error fetching OG points:", error);
      setError("Failed to fetch OG points");
    } finally {
      setIsLoadingPoints(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUserOGPoints();
    }
  }, [isOpen]);

  useEffect(() => {
    setCurrentOGPoints(userOGPoints);
  }, [userOGPoints]);

  const handlePayment = async (method: "crypto" | "card" | "og_points") => {
    setError(null);
    setIsProcessing(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      switch (method) {
        case "crypto":
          // Create initial purchase record for crypto
          const { data: cryptoPurchaseData, error: createCryptoPurchaseError } =
            await supabase
              .from("user_purchases")
              .insert({
                user_id: user.id,
                item_id: item.id,
                payment_method: "crypto",
                status: "pending",
                amount_paid: item.price,
              })
              .select()
              .single();

          if (createCryptoPurchaseError) throw createCryptoPurchaseError;

          setTransactionHash("");
          setShowCryptoModal(true);
          break;

        case "card":
          try {
            // Create initial purchase record for card payment
            const { data: cardPurchaseData, error: createCardPurchaseError } =
              await supabase
                .from("user_purchases")
                .insert({
                  user_id: user.id,
                  item_id: item.id,
                  payment_method: "card",
                  status: "pending",
                  amount_paid: item.price,
                })
                .select()
                .single();

            if (createCardPurchaseError) throw createCardPurchaseError;

            // Get the Supabase access token
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData?.session?.access_token;

            if (!token) {
              throw new Error("Failed to retrieve authentication token");
            }

            const response = await fetch("/api/create-merch-checkout-session", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              credentials: "include",
              body: JSON.stringify({
                itemId: item.id,
                itemName: item.name,
                price: item.price,
                userEmail: user.email,
                purchaseId: cardPurchaseData.id, // Pass the purchase ID to update status later
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(
                errorData.error || "Failed to create checkout session"
              );
            }

            const { sessionId } = await response.json();

            const stripe = await loadStripe(
              process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
            );
            if (!stripe) throw new Error("Failed to load Stripe");

            await stripe.redirectToCheckout({ sessionId });
          } catch (error) {
            console.error("Payment error:", error);
            setError(error instanceof Error ? error.message : "Payment failed");
          }
          break;

        case "og_points":
          if (!item.price_og_points) {
            throw new Error("This item cannot be purchased with OG Points");
          }
          if (currentOGPoints < item.price_og_points) {
            throw new Error("Insufficient OG Points");
          }

          // First create the purchase record with pending status
          const { data: purchaseData, error: createPurchaseError } =
            await supabase
              .from("user_purchases")
              .insert({
                user_id: user.id,
                item_id: item.id,
                payment_method: "og_points",
                og_points_spent: item.price_og_points,
                status: "pending", // Start with pending status
              })
              .select()
              .single();

          if (createPurchaseError) throw createPurchaseError;

          // Then deduct points from user profile
          const { error: updateError } = await supabase
            .from("user_profiles")
            .update({
              og_points: currentOGPoints - item.price_og_points,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);

          if (updateError) throw updateError;

          // Update purchase status to completed
          const { error: updatePurchaseError } = await supabase
            .from("user_purchases")
            .update({ status: "completed" })
            .eq("id", purchaseData.id);

          if (updatePurchaseError) throw updatePurchaseError;

          // Update the local state with new OG points
          const newPoints = currentOGPoints - item.price_og_points;
          setCurrentOGPoints(newPoints);
          if (onOGPointsUpdate) {
            onOGPointsUpdate(newPoints);
          }

          alert(`Purchase successful! Remaining OG Points: ${newPoints}`);
          onClose();
          break;
      }
    } catch (error) {
      console.error("Payment error:", error);
      setError(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCryptoTransaction = async () => {
    if (!transactionHash) {
      setError("Please enter your transaction hash");
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get the Supabase access token
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error("Failed to retrieve authentication token");
      }

      // Verify the transaction
      const response = await fetch("/api/verify-crypto-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          transactionHash,
          amount: item.price,
          itemId: item.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to verify transaction");
      }

      // Update purchase status to completed after verification
      const { error: updatePurchaseError } = await supabase
        .from("user_purchases")
        .update({
          status: "completed",
          transaction_hash: transactionHash,
        })
        .eq("item_id", item.id)
        .eq("user_id", user.id)
        .eq("status", "pending");

      if (updatePurchaseError) throw updatePurchaseError;

      alert("Transaction verified successfully!");
      setShowCryptoModal(false);
      onClose();
    } catch (error) {
      console.error("Transaction verification error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to verify transaction"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-gray-800 rounded-xl p-4 sm:p-6 w-full max-w-[90%] sm:max-w-lg mx-auto relative shadow-2xl border border-gray-700/50"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>

          <h2 className="text-2xl font-bold mb-4">Complete Purchase</h2>
          <p className="text-gray-400 mb-6">
            Choose your preferred payment method for {item.name}
          </p>

          {/* Add OG Points display */}
          <div className="mb-4 flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <Star className="text-purple-400" size={20} />
              <span className="text-gray-300">Your OG Points:</span>
            </div>
            {isLoadingPoints ? (
              <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
            ) : (
              <span className="font-bold text-white">{currentOGPoints}</span>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => handlePayment("crypto")}
              disabled={isProcessing}
              className="w-full flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center space-x-3">
                <Coins className="text-yellow-400" size={24} />
                <span className="text-white">Pay with Crypto</span>
              </div>
              <span className="text-gray-300">${item.price}</span>
            </button>

            <button
              onClick={() => handlePayment("card")}
              disabled={isProcessing}
              className="w-full flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center space-x-3">
                <CreditCard className="text-blue-400" size={24} />
                <span className="text-white">Pay with Card</span>
              </div>
              <span className="text-gray-300">${item.price}</span>
            </button>

            {item.price_og_points && (
              <button
                onClick={() => handlePayment("og_points")}
                disabled={
                  isProcessing || currentOGPoints < item.price_og_points
                }
                className="w-full flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center space-x-3">
                  <Star className="text-purple-400" size={24} />
                  <span className="text-white">Pay with OG Points</span>
                </div>
                <span className="text-gray-300">
                  {item.price_og_points} points
                </span>
              </button>
            )}
          </div>

          {isProcessing && (
            <div className="mt-4 text-center text-gray-400">
              Processing payment...
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Crypto Payment Modal */}
      <AnimatePresence>
        {showCryptoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 w-full max-w-md relative"
            >
              <button
                onClick={() => setShowCryptoModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold mb-4">Crypto Payment</h2>
              <div className="space-y-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-400 mb-2">Send exactly:</p>
                  <p className="text-xl font-bold text-white">
                    ${item.price} USD
                  </p>
                  <p className="text-gray-400 mt-2">To this address:</p>
                  <p className="text-white font-mono break-all">
                    YOUR_WALLET_ADDRESS
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-gray-400">Transaction Hash</label>
                  <input
                    type="text"
                    value={transactionHash}
                    onChange={(e) => setTransactionHash(e.target.value)}
                    placeholder="Enter your transaction hash"
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleCryptoTransaction}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center space-x-2 p-4 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 size={20} />
                  <span>Submit Transaction</span>
                </button>
              </div>

              {isProcessing && (
                <div className="mt-4 text-center text-gray-400">
                  Processing transaction...
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

export default PaymentModal;
