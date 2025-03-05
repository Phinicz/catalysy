import React from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  GamepadIcon,
  UserIcon,
  MapPin,
  TwitterIcon,
  MailIcon,
} from "lucide-react";

// Updated type to include email
interface UserMetadata {
  displayName: string;
  twitterUser?: string | null;
  discordUser?: string | null;
  logoUrl?: string | null;
  location?: string | null;
  email?: string | null;
}

// Function to generate a fake email based on display name
const generateFakeEmail = (displayName: string) => {
  // Convert display name to lowercase and replace any non-alphanumeric characters
  const sanitizedName = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 10);

  const domains = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "protonmail.com",
  ];

  const randomDomain = domains[Math.floor(Math.random() * domains.length)];

  return `${sanitizedName}${Math.floor(Math.random() * 999)}@${randomDomain}`;
};

// Fake data structure matching the API response format
const fakeLoyaltyData = [
  {
    id: "0x7e57...bec8",
    user: {
      walletAddress: "0x7e57...bec8",
      userMetadata: [
        {
          displayName: "0x7e57...bec8",
          twitterUser: null,
          discordUser: null,
          logoUrl: null,
          location: null,
          email: null,
        },
      ],
    },
    amount: "60",
  },
  {
    id: "0x1b92...171a",
    user: {
      walletAddress: "0x1b92...171a",
      userMetadata: [
        {
          displayName: "thanksvanar",
          twitterUser: "thanksvanar",
          discordUser: null,
          logoUrl: null,
          location: "Seoul, Republic of Korea",
          email: null,
        },
      ],
    },
    amount: "60",
  },
  {
    id: "0xf28a...2af9",
    user: {
      walletAddress: "0xf28a...2af9",
      userMetadata: [
        {
          displayName: "0xf28a...2af9",
          twitterUser: null,
          discordUser: null,
          logoUrl: null,
          location: null,
          email: null,
        },
      ],
    },
    amount: "50",
  },
  {
    id: "0xf28a...2af9",
    user: {
      walletAddress: "0xf28a...2af9",
      userMetadata: [
        {
          displayName: "0xf28a...2af9",
          twitterUser: null,
          discordUser: null,
          logoUrl: null,
          location: null,
          email: null,
        },
      ],
    },
    amount: "50",
  },
  {
    id: "0xf28a...2af9",
    user: {
      walletAddress: "0xf28a...2af9",
      userMetadata: [
        {
          displayName: "0xf28a...2af9",
          twitterUser: null,
          discordUser: null,
          logoUrl: null,
          location: null,
          email: null,
        },
      ],
    },
    amount: "50",
  },
  {
    id: "0xf28a...2af9",
    user: {
      walletAddress: "0xf28a...2af9",
      userMetadata: [
        {
          displayName: "0xf28a...2af9",
          twitterUser: null,
          discordUser: null,
          logoUrl: null,
          location: null,
          email: null,
        },
      ],
    },
    amount: "50",
  },
  {
    id: "0xf28a...2af9",
    user: {
      walletAddress: "0xf28a...2af9",
      userMetadata: [
        {
          displayName: "0xf28a...2af9",
          twitterUser: null,
          discordUser: null,
          logoUrl: null,
          location: null,
          email: null,
        },
      ],
    },
    amount: "50",
  },
  {
    id: "0xf28a...2af9",
    user: {
      walletAddress: "0xf28a...2af9",
      userMetadata: [
        {
          displayName: "0xf28a...2af9",
          twitterUser: null,
          discordUser: null,
          logoUrl: null,
          location: null,
          email: null,
        },
      ],
    },
    amount: "50",
  },
  {
    id: "0xf28a...2af9",
    user: {
      walletAddress: "0xf28a...2af9",
      userMetadata: [
        {
          displayName: "0xf28a...2af9",
          twitterUser: null,
          discordUser: null,
          logoUrl: null,
          location: null,
          email: null,
        },
      ],
    },
    amount: "50",
  },
].map((entry) => {
  const metadata = entry.user.userMetadata[0];
  return {
    ...entry,
    user: {
      ...entry.user,
      userMetadata: [
        {
          ...metadata,
          email: generateFakeEmail(metadata.displayName),
        },
      ],
    },
  };
});

const Leaderboard: React.FC = () => {
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full mt-16 mx-auto bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl overflow-hidden"
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
              <th className="p-4 text-left">Location</th>
              <th className="p-4 text-left">Social</th>
            </tr>
          </thead>
          <tbody>
            {fakeLoyaltyData.map((entry, index) => {
              const metadata = entry.user.userMetadata[0];
              return (
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
                          {metadata.logoUrl ? (
                            <img
                              src={metadata.logoUrl}
                              alt={metadata.displayName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserIcon className="text-gray-300" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-medium">
                            {metadata.displayName}
                          </span>
                          <p className="text-xs text-gray-400 flex items-center">
                            <MailIcon
                              size={12}
                              className="mr-2 text-indigo-400"
                            />
                            {metadata.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center text-green-400 font-bold">
                    {entry.amount}
                  </td>
                  <td className="p-4 text-center text-blue-400">0</td>
                  <td className="p-4 text-center text-yellow-400">0</td>
                  <td className="p-4 text-gray-300">
                    {metadata.location ? (
                      <div className="flex items-center space-x-2">
                        <MapPin size={16} className="text-indigo-400" />
                        <span>{metadata.location}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    {metadata.twitterUser && (
                      <a
                        href={`https://twitter.com/${metadata.twitterUser}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <TwitterIcon size={16} className="mr-2" />
                        {metadata.twitterUser}
                      </a>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default Leaderboard;
