import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "@/context/ApiContext";
import { LoyaltyRule, RuleProcessingStatus } from "@/types/api.types";
import {
  Award,
  Clock,
  Network,
  TrendingUp,
  Star,
  Layers,
  CheckCircle2,
  XCircle,
  Clock3,
  Wallet,
  AlertCircle,
} from "lucide-react";
import { useAccount } from "wagmi";

type RuleStatusState = {
  loyaltyRuleId: string;
  status: "completed" | "pending" | "failed" | "not_completed";
  completedAt: string | null;
  message?: string;
}[];

export default function LoyaltyRulesPage() {
  const [rules, setRules] = useState<LoyaltyRule[]>([]);
  const [ruleStatus, setRuleStatus] = useState<RuleStatusState>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completingRule, setCompletingRule] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(
    null
  );
  const api = useApi();
  const { address } = useAccount();

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

  const refreshRuleStatus = useCallback(async () => {
    if (!address) return;
    try {
      setIsStatusLoading(true);
      const statusPromises = rules.map(async (rule) => {
        try {
          const response = await api.getRuleProcessingStatus(address, rule.id);
          return {
            loyaltyRuleId: rule.id,
            status: "completed" as const,
            completedAt: new Date().toISOString(),
            message: response.message,
          };
        } catch (error: any) {
          // If error message contains "already been rewarded", it means the rule is completed
          if (error.message?.includes("already been rewarded")) {
            return {
              loyaltyRuleId: rule.id,
              status: "completed" as const,
              completedAt: new Date().toISOString(),
              message: error.message,
            };
          }
          // For any other error, mark as not completed
          return {
            loyaltyRuleId: rule.id,
            status: "not_completed" as const,
            completedAt: null,
            message: error.message || "Rule not completed",
          };
        }
      });

      const allStatuses = await Promise.all(statusPromises);
      setRuleStatus(allStatuses);
    } catch (err) {
      console.error("Failed to fetch rule status:", err);
    } finally {
      setIsStatusLoading(false);
    }
  }, [address, api, rules]);

  useEffect(() => {
    fetchRules();
  }, []);

  useEffect(() => {
    refreshRuleStatus();
    const intervalId = setInterval(refreshRuleStatus, 15000); // Reduced to 15 seconds
    return () => clearInterval(intervalId);
  }, [address, refreshRuleStatus]);

  const completeRule = async (ruleId: string, ruleName: string) => {
    if (!address) return;

    try {
      setCompletingRule(ruleId);

      const response = await api.completeLoyaltyRule(ruleId, address);

      if (response.rewarded) {
        setRuleStatus((prev) => [
          ...prev.filter((status) => status.loyaltyRuleId !== ruleId),
          {
            loyaltyRuleId: ruleId,
            status: "completed",
            completedAt: new Date().toISOString(),
            message: response.message || "Rule completed successfully",
          },
        ]);
        setShowSuccessMessage(`Successfully completed: ${ruleName}`);
      } else {
        throw new Error(response.message || "Failed to complete rule");
      }
      setTimeout(() => setShowSuccessMessage(null), 5000);
    } catch (err) {
      console.error("Error completing rule:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to complete rule";

      // Handle specific error cases
      if (errorMessage.includes("already been rewarded")) {
        setRuleStatus((prev) => [
          ...prev.filter((status) => status.loyaltyRuleId !== ruleId),
          {
            loyaltyRuleId: ruleId,
            status: "completed",
            completedAt: new Date().toISOString(),
            message: "Rule already completed",
          },
        ]);
        setShowSuccessMessage(`${ruleName} has already been completed!`);
      } else if (errorMessage.includes("Empty response from server")) {
        setShowSuccessMessage(
          `Server error: Please try again in a few moments`
        );
      } else if (errorMessage.includes("Invalid response from server")) {
        setShowSuccessMessage(
          `Server error: Please try again in a few moments`
        );
      } else {
        setShowSuccessMessage(
          `Failed to complete ${ruleName}: ${errorMessage}`
        );
      }
      setTimeout(() => setShowSuccessMessage(null), 5000);
    } finally {
      setCompletingRule(null);
    }
  };

  // Calculate stats
  const completedRules = ruleStatus.filter(
    (status) => status.status === "completed"
  ).length;
  const totalPoints = rules
    .filter((rule) =>
      ruleStatus.find(
        (status: any) =>
          status.loyaltyRuleId === rule.id && status.status === "completed"
      )
    )
    .reduce((sum, rule) => sum + parseInt(rule.amount || "0"), 0);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900"
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Star className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <p className="text-xl text-blue-300 font-medium">
            Loading Loyalty Rules...
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 pt-20 px-4 pb-12"
    >
      {/* Success Message */}
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 bg-green-500/90 text-white px-6 py-3 rounded-lg shadow-xl z-50 flex items-center"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            {showSuccessMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="container mx-auto mb-12">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Loyalty Rules Dashboard
          </h1>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            Complete tasks, earn rewards, and track your progress in our loyalty
            program.
          </p>
          {!address && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex items-center justify-center gap-2 text-yellow-400"
            >
              <Wallet className="w-5 h-5" />
              <p>Connect your wallet to start earning rewards</p>
            </motion.div>
          )}
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 rounded-xl p-6 border border-blue-700/50 backdrop-blur-sm"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Layers className="text-blue-400 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-blue-300">Total Rules</p>
                <p className="text-2xl font-bold text-white">{rules.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 rounded-xl p-6 border border-purple-700/50 backdrop-blur-sm"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <CheckCircle2 className="text-purple-400 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-purple-300">Completed Rules</p>
                <p className="text-2xl font-bold text-white">
                  {address ? `${completedRules}/${rules.length}` : "-"}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gradient-to-br from-green-900/50 to-green-800/30 rounded-xl p-6 border border-green-700/50 backdrop-blur-sm"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Award className="text-green-400 w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-green-300">Total Points</p>
                <p className="text-2xl font-bold text-white">
                  {address ? totalPoints : "-"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Rules Table */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 overflow-hidden backdrop-blur-sm">
          <div className="p-6 border-b border-gray-700/50">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-400" />
              Loyalty Rules Leaderboard
            </h2>
            <p className="text-gray-400 mt-2">
              Track your progress and complete tasks to earn rewards
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead>
                <tr className="bg-gray-800/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Rule Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Network
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Frequency
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <AnimatePresence>
                  {rules.map((rule, index) => {
                    const status = ruleStatus.find(
                      (status) => status.loyaltyRuleId === rule.id
                    );
                    const isCompleted = status?.status === "completed";
                    return (
                      <motion.tr
                        key={rule.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={`hover:bg-gray-800/30 transition-colors ${
                          isCompleted ? "bg-green-900/10" : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {index < 3 ? (
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  index === 0
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : index === 1
                                    ? "bg-gray-400/20 text-gray-400"
                                    : "bg-amber-600/20 text-amber-400"
                                }`}
                              >
                                <span className="font-bold">{index + 1}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 font-medium">
                                {index + 1}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div
                              className={`h-12 w-12 flex-shrink-0 rounded-lg ${
                                isCompleted
                                  ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20"
                                  : "bg-gradient-to-br from-blue-500/20 to-purple-500/20"
                              } flex items-center justify-center`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-6 h-6 text-green-400" />
                              ) : (
                                <span className="text-blue-400 font-medium">
                                  {rule.name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-white">
                                {rule.name}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {rule.type}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Network className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-gray-300">
                              {rule.network}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm font-medium text-white">
                              {rule.amount}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-purple-400" />
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-900/30 text-purple-400 capitalize">
                              {rule.frequency}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {address ? (
                            <div className="flex items-center gap-3">
                              {isStatusLoading && !status ? (
                                <span className="flex items-center text-yellow-400">
                                  <Clock3 className="w-5 h-5 mr-1.5 animate-spin" />
                                  Checking Status...
                                </span>
                              ) : status?.status === "completed" ? (
                                <motion.span
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="flex items-center gap-2"
                                >
                                  <span className="flex items-center text-green-400">
                                    <CheckCircle2 className="w-5 h-5 mr-1.5" />
                                    Completed
                                  </span>
                                  <button
                                    disabled
                                    className="px-4 py-1.5 text-xs font-medium rounded-lg bg-green-500/20 text-green-300 cursor-not-allowed"
                                  >
                                    Rule Completed
                                  </button>
                                </motion.span>
                              ) : status?.status === "failed" ? (
                                <span
                                  className="flex items-center text-red-400"
                                  title={status.message}
                                >
                                  <XCircle className="w-5 h-5 mr-1.5" />
                                  Failed
                                </span>
                              ) : status?.status === "pending" ? (
                                <span className="flex items-center text-yellow-400">
                                  <Clock3 className="w-5 h-5 mr-1.5 animate-spin" />
                                  Pending
                                </span>
                              ) : (
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() =>
                                      completeRule(rule.id, rule.name)
                                    }
                                    disabled={
                                      completingRule === rule.id ||
                                      isStatusLoading
                                    }
                                    className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 transform hover:scale-105
                                      ${
                                        completingRule === rule.id ||
                                        isStatusLoading
                                          ? "bg-blue-500/30 text-blue-300 cursor-not-allowed"
                                          : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-blue-500/25"
                                      }`}
                                  >
                                    {completingRule === rule.id ? (
                                      <span className="flex items-center">
                                        <Clock3 className="w-4 h-4 mr-1.5 animate-spin" />
                                        Completing...
                                      </span>
                                    ) : isStatusLoading ? (
                                      <span className="flex items-center">
                                        <Clock3 className="w-4 h-4 mr-1.5 animate-spin" />
                                        Checking...
                                      </span>
                                    ) : (
                                      "Complete Rule"
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 flex items-center">
                              <Wallet className="w-4 h-4 mr-1.5" />
                              Connect Wallet
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
