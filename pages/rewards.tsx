import { useState, useEffect } from "react";
import { useApi } from "../context/ApiContext";
import { useAccount } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Wallet, CheckCircle2, XCircle, Clock3 } from "lucide-react";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { LoyaltyRule } from "@/types/api.types";

const categories = ["all", "once", "daily", "weekly", "monthly"] as const;

interface UserTask {
  user_id: string;
  task_id: string;
  status: "completed" | "ongoing";
  created_at: string;
  progress: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  rule_id: string;
}

export default function RewardsPage() {
  const [rules, setRules] = useState<LoyaltyRule[]>([]);
  const [userTasks, setUserTasks] = useState<UserTask[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof categories)[number]>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [completingRule, setCompletingRule] = useState<string | null>(null);
  const [ruleStatus, setRuleStatus] = useState<Record<string, any>>({});
  const [pointsBalance, setPointsBalance] = useState(0);
  const [claimedRules, setClaimedRules] = useState<Record<string, boolean>>({});

  const api = useApi();
  const { address } = useAccount();

  // Fetch user's tasks (both completed and ongoing)
  const fetchUserTasks = async () => {
    console.log("Starting fetchUserTasks");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("Session:", session);
      if (!session?.user) {
        console.log("No user session found");
        return;
      }

      const { data, error } = await supabase
        .from("user_tasks")
        .select("*")
        .eq("user_id", session.user.id);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      console.log("Fetched user tasks:", data);
      setUserTasks(data || []);
    } catch (error) {
      console.error("Error in fetchUserTasks:", error);
    }
  };

  // Fetch all tasks to get rule_ids
  const fetchTasks = async () => {
    console.log("Starting fetchTasks");
    try {
      const { data, error } = await supabase.from("tasks").select("*");

      if (error) {
        console.error("Supabase error in fetchTasks:", error);
        throw error;
      }
      console.log("Fetched all tasks:", data);
      setTasks(data || []);
    } catch (error) {
      console.error("Error in fetchTasks:", error);
    }
  };

  const fetchRules = async () => {
    console.log("Starting fetchRules");
    try {
      const response = await api.getLoyaltyRules();
      console.log("Fetched rules:", response.data);
      setRules(response.data);
    } catch (err) {
      console.error("Failed to fetch loyalty rules:", err);
      toast.error("Failed to load rewards");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPointsBalance = async () => {
    console.log("Starting fetchPointsBalance");
    try {
      const response = await api.getLoyaltyAccounts();
      const totalPoints = response.data.reduce(
        (sum, account) => sum + account.amount,
        0
      );
      console.log("Fetched points balance:", totalPoints);
      setPointsBalance(totalPoints);
    } catch (err) {
      console.error("Failed to fetch points balance:", err);
    }
  };

  const checkRewardStatus = async (ruleId: string) => {
    if (!address) return;
    try {
      const response = await api.getRuleProcessingStatus(address, ruleId);
      console.log("Response:", response);

      // If we get "already been rewarded" message, mark as claimed
      if (response.message?.includes("already been rewarded")) {
        setClaimedRules((prev) => ({
          ...prev,
          [ruleId]: true,
        }));
        return true;
      }
      return response.rewarded;
    } catch (error: any) {
      console.log("Error checking reward status:", error);
      // If error message contains "already been rewarded", mark as claimed
      if (error.message?.includes("already been rewarded")) {
        setClaimedRules((prev) => ({
          ...prev,
          [ruleId]: true,
        }));
        return true;
      }
      return false;
    }
  };

  const completeRule = async (ruleId: string, ruleName: string) => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      // First check if already claimed
      const isAlreadyClaimed = await checkRewardStatus(ruleId);
      if (isAlreadyClaimed) {
        setRuleStatus((prev) => ({
          ...prev,
          [ruleId]: {
            status: "completed",
            message: "Already claimed",
          },
        }));
        setClaimedRules((prev) => ({
          ...prev,
          [ruleId]: true,
        }));
        toast.success("You have already claimed this reward");
        return;
      }

      setCompletingRule(ruleId);
      const response = await api.completeLoyaltyRule(ruleId, address);
      console.log("Response:", response);

      if (response.rewarded) {
        setRuleStatus((prev) => ({
          ...prev,
          [ruleId]: {
            status: "completed",
            message: response.message || "Rule completed successfully",
          },
        }));
        setClaimedRules((prev) => ({
          ...prev,
          [ruleId]: true,
        }));
        toast.success(`Successfully claimed: ${ruleName}`);
        fetchPointsBalance();
      } else {
        throw new Error(response.message || "Failed to complete rule");
      }
    } catch (err) {
      console.error("Error completing rule:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to complete rule";
      toast.error(`Failed to claim reward: ${errorMessage}`);
    } finally {
      setCompletingRule(null);
    }
  };

  useEffect(() => {
    console.log("Initial useEffect triggered");
    fetchRules();
    fetchTasks();
  }, []);

  useEffect(() => {
    console.log("User tasks useEffect triggered");
    fetchUserTasks();
    fetchPointsBalance();
  }, []);

  // Add effect to check reward status when rules are loaded
  useEffect(() => {
    const checkAllRewardsStatus = async () => {
      console.log("Checking rewards status...");
      console.log("Current rules:", rules);
      console.log("Current address:", address);

      if (!rules.length || !address) {
        console.log("No rules or address available yet");
        return;
      }

      for (const rule of rules) {
        console.log(`Checking status for rule: ${rule.id}`);
        const isClaimed = await checkRewardStatus(rule.id);
        console.log(`Rule ${rule.id} claimed:`, isClaimed);
      }
    };

    checkAllRewardsStatus();
  }, [rules, address, api]);

  // Get completed task IDs from user_tasks
  const completedTaskIds = userTasks
    .filter((task) => task.status === "completed")
    .map((task) => task.task_id);

  // Get tasks with their rule_ids for completed tasks
  const completedTasksWithRuleIds = tasks
    .filter((task) => completedTaskIds.includes(task.id))
    .filter((task) => task.rule_id); // Only include tasks that have a rule_id

  // Get rule_ids from completed tasks
  const completedRuleIds = completedTasksWithRuleIds.map(
    (task) => task.rule_id
  );

  // Filter rules to only show those that match completed achievements
  const filteredRules = rules
    .filter((rule) => completedRuleIds.includes(rule.id))
    .filter((rule) => {
      const matchesCategory =
        selectedCategory === "all" ||
        rule.frequency?.toLowerCase() === selectedCategory;
      const matchesSearch =
        rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.type.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });

  // Find achievement details for a rule
  const getAchievementForRule = (ruleId: string) => {
    const task = tasks.find((task) => task.rule_id === ruleId);
    return task || null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Award className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <p className="text-xl text-blue-300 font-medium">
            Loading Rewards...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="relative h-[300px] rounded-lg overflow-hidden mb-8">
        {filteredRules.length > 0 ? (
          <div className="relative h-full">
            <img
              src={getAchievementForRule(filteredRules[0].id)?.imageUrl || ""}
              alt={getAchievementForRule(filteredRules[0].id)?.title || ""}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-2">
                Complete Achievements to Unlock Rewards
              </h1>
            </div>
          </div>
        )}
      </div>

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-primary text-white border-2 border-white"
                    : "bg-surface text-text-secondary hover:bg-background"
                }`}
              >
                {category.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="w-full sm:w-auto">
            <input
              type="search"
              placeholder="Search rewards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 rounded-lg border border-[var(--color-border)] bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRules.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-text-secondary">
              Complete achievements to unlock rewards
            </p>
          </div>
        ) : (
          filteredRules.map((rule) => {
            const achievement = getAchievementForRule(rule.id);
            const isPending = completingRule === rule.id;
            const status = ruleStatus[rule.id];
            const isCompleted = status?.status === "completed";
            const isClaimed = claimedRules[rule.id];

            return (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface rounded-xl overflow-hidden border border-[var(--color-border)]"
              >
                {achievement && (
                  <div className="relative h-48">
                    <img
                      src={achievement.imageUrl}
                      alt={achievement.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary">
                        {achievement?.title || rule.name}
                      </h3>
                      <p className="text-sm text-text-secondary mt-1">
                        {achievement?.description || rule.type}
                      </p>
                    </div>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-900/30 text-blue-400">
                      {rule.amount} points
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Network</span>
                      <span className="text-text-primary">{rule.network}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Frequency</span>
                      <span className="text-text-primary capitalize">
                        {rule.frequency}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6">
                    {!address ? (
                      <button
                        disabled
                        className="w-full px-4 py-2 rounded-lg bg-gray-500/20 text-gray-400 cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Wallet className="w-4 h-4" />
                        Connect Wallet
                      </button>
                    ) : isClaimed ? (
                      <button
                        disabled
                        className="w-full px-4 py-2 rounded-lg bg-green-500/20 text-green-400 cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Claimed
                      </button>
                    ) : isPending ? (
                      <button
                        disabled
                        className="w-full px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Clock3 className="w-4 h-4 animate-spin" />
                        Processing...
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          completeRule(rule.id, achievement?.title || rule.name)
                        }
                        className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
                      >
                        Claim Reward
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
