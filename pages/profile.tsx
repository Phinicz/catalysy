import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import ImageUpload from "../components/ImageUpload";
import { useAccount } from "wagmi";
import {
  Copy,
  Star,
  Shield,
  Zap,
  Rocket,
  Check,
  User,
  CreditCard,
  Info,
  Clock,
} from "lucide-react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useApi } from "@/context/ApiContext";
import { toast } from "react-toastify";
import * as Tooltip from "@radix-ui/react-tooltip";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: "player" | "partner";
  profile_picture: string | null;
  bio: string | null;
  coins: number;
  gems: number;
  twitter_username?: string;
}

interface Subscription {
  id: string;
  name: string;
  max_rank: string;
  achievement_tier: string;
  early_access: boolean;
  free_shipping: boolean;
  OG_Points: number;
  end_date: string;
}

interface ApiRegistrationStatus {
  isRegistegray: boolean;
  displayName?: string;
}

interface TransactionEntry {
  amount: string | number;
  loyaltyAccount: {
    user: {
      id: string;
    };
  };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isApiRegistering, setIsApiRegistering] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiRegistrationStatus>({
    isRegistegray: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { openConnectModal } = useConnectModal();
  const { address, isConnected } = useAccount();
  const { createUser, getUsers, getTransactionEntries } = useApi();
  const [isCheckingApi, setIsCheckingApi] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    bio: "",
    profile_picture: "",
    twitter_username: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [coins, setCoins] = useState(0);
  const [activeTab, setActiveTab] = useState<"profile" | "subscription">(
    "profile"
  );
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    fetchProfile();
    fetchSubscription();
  }, []);

  useEffect(() => {
    if (address) {
      checkApiRegistrationStatus();
    }
  }, [address]);

  useEffect(() => {
    const fetchTransactionEntries = async () => {
      try {
        // First get the user data to get the user ID
        const usersResponse = await getUsers();
        console.log("Users response:", usersResponse);

        const user = usersResponse.data.find(
          (user) => user.walletAddress.toLowerCase() === address?.toLowerCase()
        );

        if (!user) {
          console.log("No user found for address:", address);
          return;
        }

        console.log("Found user:", user);

        // Then get transaction entries
        const transactionResponse = await getTransactionEntries();
        console.log("Transaction response:", transactionResponse);

        // Properly extract the data array from the response
        const transactions = transactionResponse.data || [];

        // Filter transactions for the current user and sum up the amounts
        const userTransactions = transactions.filter(
          (transaction: TransactionEntry) => {
            // Check if the transaction has a loyaltyAccount with a user
            if (transaction.loyaltyAccount?.user?.id) {
              return transaction.loyaltyAccount.user.id === user.id;
            }
            return false;
          }
        );

        console.log("User transactions:", userTransactions);

        // Calculate total coins from valid transactions
        const totalCoins = userTransactions.reduce(
          (sum: number, transaction: TransactionEntry) => {
            const amount = Number(transaction.amount) || 0;
            console.log(
              "Processing transaction amount:",
              transaction.amount,
              "parsed as:",
              amount
            );
            return sum + amount;
          },
          0
        );

        console.log("Total coins calculated:", totalCoins);
        setCoins(totalCoins);
      } catch (error) {
        console.error("Error fetching transaction entries:", error);
      }
    };

    if (address) {
      fetchTransactionEntries();
    }
  }, [address, getUsers, getTransactionEntries]);

  useEffect(() => {
    if (subscription?.end_date) {
      const timer = setInterval(() => {
        const endDate = new Date(subscription.end_date);
        const now = new Date();
        const difference = endDate.getTime() - now.getTime();

        if (difference <= 0) {
          setTimeLeft("Subscription expired");
          clearInterval(timer);
          return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [subscription?.end_date]);

  const checkApiRegistrationStatus = async () => {
    if (!address) return;
    setIsCheckingApi(true);
    try {
      const response = await getUsers();
      console.log("API Response:", response);
      console.log("Current wallet address:", address);

      // Find user with matching wallet address
      const user = response.data?.find((user) => {
        const userWallet = user.walletAddress.toLowerCase();
        const currentWallet = address.toLowerCase();
        console.log("Comparing wallets:", {
          userWallet,
          currentWallet,
          matches: userWallet === currentWallet,
        });
        return userWallet === currentWallet;
      });

      if (user) {
        console.log("Found registered user:", user);
        // Use profile username as display name
        const displayName =
          profile?.username || user.walletAddress?.slice(0, 8);
        console.log("Setting display name:", displayName);
        setApiStatus({
          isRegistegray: true,
          displayName: displayName,
        });
      } else {
        console.log("No registered user found for wallet:", address);
        setApiStatus({ isRegistegray: false });
      }
    } catch (error) {
      console.error("Error checking API registration:", error);
      // Don't reset status on error, keep the current status
      if (!apiStatus.isRegistegray) {
        setApiStatus({ isRegistegray: false });
      }
    } finally {
      setIsCheckingApi(false);
    }
  };

  const handleApiRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !profile) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    try {
      // Remove userId from the registration payload
      const response = await createUser({
        walletAddress: address,
        displayName: profile.username,
        emailAddress: profile.email,
      });

      console.log("API registration response:", response);

      // Add a small delay before checking the status
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await checkApiRegistrationStatus();
      toast.success("Successfully registegray with API!");
      setIsApiRegistering(false);
    } catch (error) {
      console.error("Detailed API registration error:", error);

      if (error instanceof Error) {
        if (error.message.includes("already registegray")) {
          toast.error("This wallet address is already registegray");
        } else if (error.message.includes("invalid")) {
          toast.error(
            "Invalid registration data. Please check your information."
          );
        } else {
          toast.error(`Registration failed: ${error.message}`);
        }
      } else {
        toast.error("Failed to register. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        window.location.href = "/";
        return;
      }
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      if (error) throw error;
      setProfile(data);
      setEditForm({
        username: data.username,
        bio: data.bio || "",
        profile_picture: data.profile_picture || "",
        twitter_username: data.twitter_username || "",
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) return;

      // First, get the user's subscription status and plan_id
      const { data: userSubscription, error: userSubError } = await supabase
        .from("user_subscriptions")
        .select("plan_id, status, end_date")
        .eq("user_id", session.user.id)
        .eq("status", "active")
        .single();

      if (userSubError) {
        console.error("Error fetching user subscription:", userSubError);
        return;
      }

      if (!userSubscription?.plan_id) {
        return;
      }

      // Then, fetch the subscription plan details
      const { data: planData, error: planError } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("id", userSubscription.plan_id)
        .single();

      if (planError) {
        console.error("Error fetching subscription plan:", planError);
        return;
      }

      if (planData) {
        setSubscription({
          ...planData,
          end_date: userSubscription.end_date,
        });
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  const formatAddress = (addr: string | undefined) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      // Basic validation
      if (!editForm.username.trim()) {
        toast.error("Username is required");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        toast.error("You must be logged in to update your profile");
        return;
      }

      // First update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { username: editForm.username },
      });

      if (authError) throw authError;

      // Then update profile - explicitly select columns to update
      const updates = {
        username: editForm.username.trim(),
        bio: editForm.bio?.trim() || null,
        profile_picture: editForm.profile_picture || null,
        twitter_username: editForm.twitter_username?.trim() || null,
      };

      const { error: profileError } = await supabase
        .from("user_profiles")
        .update(updates)
        .eq("id", session.user.id);

      if (profileError) throw profileError;

      await fetchProfile(); // Refresh profile data
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-gray-500 text-xl">
        Loading...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-gray-500 text-xl">
        Profile not found
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 flex justify-center items-center">
      <div className="max-w-3xl w-full px-4">
        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === "profile"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            <User className="w-5 h-5" />
            <span>Profile</span>
          </button>
          <button
            onClick={() => setActiveTab("subscription")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === "subscription"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span>Subscription</span>
          </button>
        </div>

        {/* Profile Tab Content */}
        {activeTab === "profile" && (
          <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-500 relative">
            {!isEditing ? (
              <div className="space-y-6 text-white">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 border-4 border-gray-500 rounded-full overflow-hidden">
                    {profile.profile_picture ? (
                      <img
                        src={profile.profile_picture}
                        alt={profile.username}
                        className="h-32 w-32 object-cover"
                      />
                    ) : (
                      <div className="h-32 w-32 bg-gray-700 flex items-center justify-center text-3xl text-gray-500 font-bold">
                        {profile.username[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-3xl font-bold text-white">
                          {profile.username}
                        </h1>
                        <p className="text-sm text-gray-400">{profile.email}</p>
                        <span className="mt-1 inline-block px-3 py-1 text-xs font-medium bg-gray-500 text-white rounded-full uppercase">
                          {profile.role}
                        </span>
                      </div>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-gray-600 px-4 py-2 rounded-lg text-white font-bold hover:bg-gray-700 transition"
                      >
                        Edit Profile
                      </button>
                    </div>
                    <div className="mt-4">
                      <h3 className="font-medium text-gray-500">Bio</h3>
                      <p className="mt-1 text-gray-300">
                        {profile.bio || "No bio yet"}
                      </p>
                    </div>
                    <div className="mt-4">
                      <h3 className="font-medium text-gray-500">Twitter</h3>
                      <p className="mt-1 text-gray-300">
                        {profile.twitter_username ? (
                          <a
                            href={`https://twitter.com/${profile.twitter_username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            {profile.twitter_username}
                          </a>
                        ) : (
                          "No Twitter connected"
                        )}
                      </p>
                    </div>
                    <div className="mt-4">
                      <h3 className="font-medium text-gray-500">Wallet</h3>
                      {isConnected ? (
                        <div className="mt-1 flex items-center space-x-2">
                          <p className="text-gray-300 font-mono">
                            {formatAddress(address)}
                          </p>
                          <button
                            onClick={copyAddress}
                            className="p-1 hover:bg-gray-800 rounded-full transition-colors"
                            title="Copy address"
                          >
                            <Copy className="w-4 h-4 text-gray-400" />
                          </button>
                          {copied && (
                            <span className="text-sm text-green-500">
                              Copied!
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="mt-1 text-gray-500">
                          No wallet connected
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-gray-500 pt-6">
                  <div className="bg-gray-800 p-4 rounded-lg text-center border border-gray-500">
                    <h3 className="text-gray-500 font-medium">Coins</h3>
                    <p className="text-2xl font-bold text-white">{coins}</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg text-center border border-gray-500">
                    <h3 className="text-gray-500 font-medium">OG Points</h3>
                    <p className="text-2xl font-bold text-white">
                      {subscription?.OG_Points || 0}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleUpdateProfile}
                className="space-y-6 text-white"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Profile Picture
                  </label>
                  <ImageUpload
                    currentImage={profile.profile_picture}
                    onUploadComplete={(url) =>
                      setEditForm((prev) => ({ ...prev, profile_picture: url }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.username}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-500 bg-gray-800 text-white rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-500 bg-gray-800 text-white rounded-lg"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Twitter Username
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter your Twitter username"
                      value={editForm.twitter_username}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          twitter_username: e.target.value.replace(/^@/, ""),
                        }))
                      }
                      className="flex-1 px-3 py-2 border border-gray-500 bg-gray-800 text-white rounded-lg"
                    />
                    {editForm.twitter_username && (
                      <a
                        href={`https://twitter.com/${editForm.twitter_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center"
                      >
                        View Profile
                      </a>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-400">
                    Enter your Twitter username without the @ symbol
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition disabled:bg-gray-600"
                  >
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Subscription Tab Content */}
        {activeTab === "subscription" && (
          <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-500">
            <h2 className="text-xl font-bold text-white mb-4">
              Subscription Details
            </h2>
            {subscription ? (
              <div className="space-y-6">
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-500">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <Star className="w-6 h-6 text-yellow-400" />
                      <h3 className="text-xl font-semibold text-white">
                        {subscription.name}
                      </h3>
                    </div>
                    <Tooltip.Provider delayDuration={0}>
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <button className="p-2 hover:bg-gray-700 rounded-full transition-colors">
                            <Info className="w-5 h-5 text-gray-400" />
                          </button>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content
                            className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm border border-gray-500"
                            sideOffset={5}
                          >
                            You are currently using the {subscription.name} plan
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    </Tooltip.Provider>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-5 h-5 text-purple-400" />
                          <span className="text-gray-300">Max Rank</span>
                        </div>
                        <Tooltip.Provider delayDuration={0}>
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <button className="p-1 hover:bg-gray-600 rounded-full transition-colors">
                                <Info className="w-4 h-4 text-gray-400" />
                              </button>
                            </Tooltip.Trigger>
                            <Tooltip.Portal>
                              <Tooltip.Content
                                className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm border border-gray-500"
                                sideOffset={5}
                              >
                                Your maximum achievable rank is{" "}
                                {subscription.max_rank}
                              </Tooltip.Content>
                            </Tooltip.Portal>
                          </Tooltip.Root>
                        </Tooltip.Provider>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Star className="w-5 h-5 text-yellow-400" />
                          <span className="text-gray-300">
                            Achievement Tier
                          </span>
                        </div>
                        <Tooltip.Provider delayDuration={0}>
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <button className="p-1 hover:bg-gray-600 rounded-full transition-colors">
                                <Info className="w-4 h-4 text-gray-400" />
                              </button>
                            </Tooltip.Trigger>
                            <Tooltip.Portal>
                              <Tooltip.Content
                                className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm border border-gray-500"
                                sideOffset={5}
                              >
                                You are capable of Tier{" "}
                                {subscription.achievement_tier} and will earn{" "}
                                {subscription.OG_Points} OG points on each
                                achievement
                              </Tooltip.Content>
                            </Tooltip.Portal>
                          </Tooltip.Root>
                        </Tooltip.Provider>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Zap className="w-5 h-5 text-blue-400" />
                          <span className="text-gray-300">OG Points</span>
                        </div>
                        <Tooltip.Provider delayDuration={0}>
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <button className="p-1 hover:bg-gray-600 rounded-full transition-colors">
                                <Info className="w-4 h-4 text-gray-400" />
                              </button>
                            </Tooltip.Trigger>
                            <Tooltip.Portal>
                              <Tooltip.Content
                                className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm border border-gray-500"
                                sideOffset={5}
                              >
                                You will receive {subscription.OG_Points} OG
                                points every week
                              </Tooltip.Content>
                            </Tooltip.Portal>
                          </Tooltip.Root>
                        </Tooltip.Provider>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Rocket className="w-5 h-5 text-purple-400" />
                          <span className="text-gray-300">Early Access</span>
                        </div>
                        {subscription.early_access ? (
                          <Check className="w-5 h-5 text-green-400" />
                        ) : (
                          <span className="text-gray-500">Not Available</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Check className="w-5 h-5 text-green-400" />
                          <span className="text-gray-300">Free Shipping</span>
                        </div>
                        {subscription.free_shipping ? (
                          <Check className="w-5 h-5 text-green-400" />
                        ) : (
                          <span className="text-gray-500">Not Available</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mb-6 p-4 bg-gray-700 rounded-lg border border-gray-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-yellow-400" />
                      <span className="text-gray-300">
                        Subscription End Time
                      </span>
                    </div>
                    <Tooltip.Provider delayDuration={0}>
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <button className="p-1 hover:bg-gray-600 rounded-full transition-colors">
                            <Info className="w-4 h-4 text-gray-400" />
                          </button>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content
                            className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm border border-gray-500"
                            sideOffset={5}
                          >
                            Your subscription will end on{" "}
                            {new Date(
                              subscription.end_date
                            ).toLocaleDateString()}
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    </Tooltip.Provider>
                  </div>
                  <div className="mt-2 text-2xl font-bold text-white text-center">
                    {timeLeft}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-500 text-center">
                <p className="text-gray-300 mb-4">No active subscription</p>
                <a
                  href="/subscriptions"
                  className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  View Subscription Plans
                </a>
              </div>
            )}
          </div>
        )}

        {/* API Access Section - Only show on profile tab */}
        {activeTab === "profile" && (
          <div className="mt-6 pt-6 border-t border-gray-500">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-500">API Access</h2>
              {!apiStatus.isRegistegray &&
                !isApiRegistering &&
                !isCheckingApi && (
                  <button
                    onClick={() => setIsApiRegistering(true)}
                    className="bg-gray-600 px-4 py-2 rounded-lg text-white font-bold hover:bg-gray-700 transition"
                  >
                    Register for API
                  </button>
                )}
            </div>

            {isCheckingApi ? (
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-500">
                <p className="text-white text-center">
                  Checking registration status...
                </p>
              </div>
            ) : apiStatus.isRegistegray ? (
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-500">
                <p className="text-white">
                  ✓ Registegray for API access as{" "}
                  <span className="text-white font-semibold">
                    {apiStatus.displayName}
                  </span>
                </p>
              </div>
            ) : isApiRegistering ? (
              <form onSubmit={handleApiRegistration} className="space-y-4">
                <p className="text-gray-400">
                  Register using your profile information:
                </p>
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-500">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">
                        Display Name
                      </label>
                      <p className="text-white">{profile?.username}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">
                        Email
                      </label>
                      <p className="text-white">{profile?.email}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={!isConnected || isLoading}
                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition disabled:bg-gray-600"
                  >
                    {isLoading ? "Registering..." : "Confirm Registration"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsApiRegistering(false)}
                    className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : !isConnected ? (
              <div className="text-center">
                <button
                  onClick={openConnectModal}
                  className="bg-gray-600 px-4 py-2 rounded-lg text-white font-bold hover:bg-gray-700 transition"
                >
                  Connect Wallet to Register
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
