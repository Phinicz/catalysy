import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "@/context/ApiContext";
import { LoyaltyRule } from "@/types/api.types";
import { Award, Clock, Network, TrendingUp, Star, Layers } from "lucide-react";

export default function LoyaltyRulesPage() {
  const [rules, setRules] = useState<LoyaltyRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await api.getLoyaltyRules();
        setRules(response.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch loyalty rules"
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchRules();
  }, []);

  // Loading Component
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatType: "loop",
          }}
          className="flex flex-col items-center"
        >
          <div className="h-16 w-16 mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl text-gray-200 tracking-wide"
          >
            Loading Loyalty Rules...
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  // Error Component
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="bg-red-900/30 p-8 rounded-xl shadow-2xl border border-red-800 text-center"
        >
          <p className="text-red-300 font-bold text-2xl mb-4">Error Occurred</p>
          <p className="text-red-200">{error}</p>
        </motion.div>
      </motion.div>
    );
  }

  // Stats Variants
  const statsVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 pt-24 px-4 pb-12"
    >
      {/* Header Section */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto mb-12 text-center"
      >
        <h1 className="text-4xl font-bold text-blue-400 mb-4">
          Loyalty Rules Dashboard
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Explore and manage the intricate details of our loyalty program,
          designed to reward and empower our most dedicated members.
        </p>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
      >
        <motion.div
          variants={statsVariants}
          className="bg-gray-800 rounded-xl p-6 border border-blue-900/30 hover:border-blue-600 transition-all group"
        >
          <div className="flex items-center mb-4">
            <Layers className="text-blue-500 mr-3" />
            <p className="text-sm text-blue-300 font-medium">Total Rules</p>
          </div>
          <p className="text-3xl font-bold text-white group-hover:text-blue-400 transition-colors">
            {rules.length}
          </p>
        </motion.div>

        <motion.div
          variants={statsVariants}
          className="bg-gray-800 rounded-xl p-6 border border-purple-900/30 hover:border-purple-600 transition-all group"
        >
          <div className="flex items-center mb-4">
            <Star className="text-purple-500 mr-3" />
            <p className="text-sm text-purple-300 font-medium">Active Rules</p>
          </div>
          <p className="text-3xl font-bold text-white group-hover:text-purple-400 transition-colors">
            {rules.filter((rule) => rule.type === "Bonus").length}
          </p>
        </motion.div>

        <motion.div
          variants={statsVariants}
          className="bg-gray-800 rounded-xl p-6 border border-green-900/30 hover:border-green-600 transition-all group"
        >
          <div className="flex items-center mb-4">
            <TrendingUp className="text-green-500 mr-3" />
            <p className="text-sm text-green-300 font-medium">Total Rewards</p>
          </div>
          <p className="text-3xl font-bold text-white group-hover:text-green-400 transition-colors">
            {rules.reduce((sum, rule) => sum + parseInt(rule.amount || "0"), 0)}
          </p>
        </motion.div>
      </motion.div>

      {/* Table Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="container mx-auto"
      >
        <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-700">
                <tr>
                  {[
                    "Name",
                    "Type",
                    "Network",
                    "Amount",
                    "Reward Type",
                    "Frequency",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {rules.map((rule, index) => (
                    <motion.tr
                      key={rule.id}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.05,
                      }}
                      className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-blue-400 font-medium">
                              {rule.name.charAt(0)}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-white">
                            {rule.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-900/30 text-blue-400">
                          {rule.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {rule.network}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-white">
                          {rule.amount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-900/30 text-green-400 capitalize">
                          {rule.rewardType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-900/30 text-purple-400 capitalize">
                          {rule.frequency}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
