import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

type Voucher = {
  id: string;
  uid?: string;
  name: string;
  amount: number;
  contract: string;
  contractType: string;
  tokenId?: string;
  category?: string;
  receiver?: string | null;
  claimed?: boolean;
  image?: string;
};

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        setError("Not authenticated");
        return;
      }
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("email", user.email)
        .single();
      if (profileError || !profile) {
        setError("User profile not found");
        return;
      }
      setUserId(profile.id);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`/api/vouchers/user?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setVouchers(data.vouchers || []);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch vouchers");
        setLoading(false);
      });
  }, [userId]);

  const claimVoucher = async (voucher: Voucher) => {
    setClaiming(voucher.id);
    setError(null);
    try {
      const address = prompt("Enter your wallet address to claim:") || "";
      const res = await fetch("/api/vouchers/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voucherId: voucher.id, address }),
      });
      const data = await res.json();
      console.log(data, "here is claimed data voucher");
      if (res.ok) {
        alert("Voucher claimed! Signature: " + data.signature);
      } else {
        setError(data.error || "Failed to claim voucher");
      }
    } catch (e) {
      setError("Failed to claim voucher");
    }
    setClaiming(null);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 ">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-500">
          Your Vouchers
        </h1>

        <AnimatePresence>
          {loading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-lg font-medium text-gray-600"
            >
              Loading...
            </motion.p>
          )}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-lg font-medium text-red-500"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {vouchers.map((voucher) => (
              <motion.div
                key={voucher.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 0 20px rgba(79, 70, 229, 0.3)",
                }}
                className="relative bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300"
              >
                {/* Decorative Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-50" />

                <div className="relative p-6">
                  {voucher.image && (
                    <motion.img
                      src={voucher.image}
                      alt={voucher.name}
                      className="w-32 h-32 object-cover rounded-lg mx-auto mb-4 border border-gray-200"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    />
                  )}
                  <h2 className="text-xl font-semibold text-gray-900 text-center mb-3">
                    {voucher.name}
                  </h2>
                  <div className="space-y-2 text-gray-700">
                    <p className="text-sm">
                      <span className="font-medium text-indigo-600">
                        Amount:
                      </span>{" "}
                      {voucher.amount}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-indigo-600">
                        Category:
                      </span>{" "}
                      {voucher.category || "N/A"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-indigo-600">Type:</span>{" "}
                      {voucher.contractType}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-indigo-600">
                        Token ID:
                      </span>{" "}
                      {voucher.tokenId || "N/A"}
                    </p>
                  </div>
                  <motion.button
                    onClick={() => claimVoucher(voucher)}
                    disabled={claiming === voucher.id}
                    whileHover={{ scale: 1.05, backgroundColor: "#3730A3" }}
                    whileTap={{ scale: 0.95 }}
                    className={`mt-6 w-full py-3 px-4 rounded-lg text-white font-semibold transition-all duration-200 ${
                      claiming === voucher.id
                        ? "bg-indigo-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    } shadow-md`}
                  >
                    {claiming === voucher.id ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-2 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                          />
                        </svg>
                        Claiming...
                      </span>
                    ) : (
                      "Claim"
                    )}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
