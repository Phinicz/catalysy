import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  GamepadIcon,
  UserIcon,
  MapPin,
  TwitterIcon,
  MailIcon,
} from "lucide-react";
import { useApi } from "../context/ApiContext";
import { LoyaltyAccountsResponse } from "../types/api.types";

// Updated type to include email
interface UserMetadata {
  displayName: string;
  twitterUser?: string | null;
  discordUser?: string | null;
  logoUrl?: string | null;
  location?: string | null;
  email?: string | null;
}

interface LoyaltyAccountEntry {
  id: string;
  userId: string;
  amount: string | number;
  user?: {
    walletAddress: string;
    userMetadata?: Array<{
      displayName?: string;
    }>;
  };
}

const Leaderboard: React.FC = () => {
  const api = useApi();
  const [leaderboardData, setLeaderboardData] = useState<{
    data: LoyaltyAccountEntry[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const response = await api.getLoyaltyAccounts({
          limit: 100,
        });
        setLeaderboardData(response);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [api]);

  const getUserDisplayName = (entry: LoyaltyAccountEntry): string => {
    const metadata = entry.user?.userMetadata?.[0];
    return metadata?.displayName || entry.user?.walletAddress || entry.userId;
  };

  const renderPodiumBadge = (index: number) => {
    const podiumStyles = [
      "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white",
      "bg-gradient-to-r from-gray-400 to-gray-600 text-white",
      "bg-gradient-to-r from-amber-700 to-amber-900 text-white",
    ];

    return index < 3 ? (
      <div
        className={`${podiumStyles[index]} rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-lg`}
      >
        <Trophy size={20} />
      </div>
    ) : (
      <div className="text-gray-500 w-10 h-10 flex items-center justify-center font-bold">
        {index + 1}
      </div>
    );
  };

  if (!leaderboardData) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full mx-auto bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl overflow-hidden"
    >
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <GamepadIcon className="mr-3" size={32} />
          Global Leaderboard
        </h2>
        <div className="text-white text-sm flex items-center space-x-2">
          <span>🏆 Top Players Showcase</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800 text-gray-300 text-sm">
            <tr>
              <th className="p-4 text-left">Rank</th>
              <th className="p-4 text-left">Player</th>
              <th className="p-4 text-center">Token Points</th>
              <th className="p-4 text-center">Loyalty Points</th>
              <th className="p-4 text-center">Cash Points</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData?.data.map((entry, index) => (
              <motion.tr
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
              >
                <td className="p-4 flex items-center justify-center">
                  {renderPodiumBadge(index)}
                </td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                        <UserIcon className="text-gray-300" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-medium">
                          {getUserDisplayName(entry)}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-center text-green-400 font-bold">
                  {entry.amount}
                </td>
                <td className="p-4 text-center text-blue-400">0</td>
                <td className="p-4 text-center text-yellow-400">0</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default Leaderboard;
