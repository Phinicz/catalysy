"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import { subscriptionData } from "../components/subscriptionData";

export default function AchievementSystem() {
  const [selectedSub, setSelectedSub] = useState<string>("Free Subscription");
  const [showSuccess, setShowSuccess] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const getCurrentSubscription = () => {
    return subscriptionData.find((sub) => sub.name === selectedSub);
  };

  const handlePurchase = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000); // Hide after 3 seconds
  };

  return (
    <div className="min-h-screen pt-32  text-white p-8 relative overflow-hidden">
      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50  bg-opacity-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                transition: { duration: 0.3 },
              }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900 p-8 rounded-2xl shadow-2xl relative"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.2,
                }}
                className="w-20 h-20 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center"
              >
                <motion.svg
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="w-12 h-12 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </motion.svg>
              </motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-center"
              >
                <h2 className="text-2xl font-bold text-white mb-2">
                  Purchase Successful!
                </h2>
                <p className="text-gray-400">Welcome to {selectedSub}</p>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3 }}
                  className="h-1 bg-gray-600 mt-4 rounded-full"
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-white mb-4">
          Achievement System
        </h1>
        <p className="text-gray-400">
          Select your subscription tier to view achievements
        </p>
      </motion.div>

      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        {subscriptionData.map((sub) => (
          <motion.button
            key={sub.name}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              selectedSub === sub.name
                ? "bg-gray-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
            onClick={() => setSelectedSub(sub.name)}
          >
            {sub.name}
            {sub.price && <span className="ml-2 text-sm">(${sub.price})</span>}
          </motion.button>
        ))}
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
      >
        {getCurrentSubscription()?.tiers.map((tier: any, index: number) => (
          <motion.div
            key={tier.name}
            variants={itemVariants}
            className="bg-gray-900 rounded-xl p-6 border border-gray-700 hover:border-gray-500 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-300">{tier.name}</h3>
              <motion.div
                className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm font-bold"
                whileHover={{ rotate: 180 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                T{index + 1}
              </motion.div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-gray-400">Reward Range</p>
                <p className="text-white font-semibold">
                  {tier.rewardRange} OG Points
                </p>
              </div>

              <div>
                <p className="text-gray-400">Description</p>
                <p className="text-white">{tier.description}</p>
              </div>

              <motion.div
                className="h-2 bg-gray-800 rounded-full overflow-hidden"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className="h-full bg-gray-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${(index + 1) * 25}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </motion.div>

              {tier.bonuses && (
                <div className="text-sm">
                  <p className="text-gray-400">Bonuses</p>
                  {tier.bonuses.standardBattlePass && (
                    <p className="text-green-500">
                      Standard: {tier.bonuses.standardBattlePass}
                    </p>
                  )}
                  {tier.bonuses.premiumBattlePass && (
                    <p className="text-green-500">
                      Premium: {tier.bonuses.premiumBattlePass}
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center"
      >
        <motion.button
          whileHover={{
            scale: 1.05,
            boxShadow: "0 0 20px rgba(156, 163, 175, 1)",
          }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePurchase}
          className="bg-gray-800 text-white px-12 py-4 rounded-lg font-bold text-lg transform transition-all duration-300 hover:bg-gray-600"
        >
          {selectedSub === "Free Subscription" ? (
            "Upgrade to Premium"
          ) : (
            <>
              Buy {selectedSub}
              <span className="ml-2 text-sm">
                {getCurrentSubscription()?.price
                  ? `($${getCurrentSubscription()?.price}/month)`
                  : ""}
              </span>
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}
