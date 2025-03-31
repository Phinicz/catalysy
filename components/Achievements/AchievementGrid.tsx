import React, { useState } from "react";
import AchievementModal from "./AchievementModal";
import { Achievement } from "@/types/Achievement";
interface AchievementGridProps {
  achievements: Achievement[];
  onSelectAchievement: (achievement: Achievement) => void;
}

// Helper function to determine if an achievement is high points
const isHighPointsAchievement = (points: number) => points >= 1000;

// Helper function to determine if an achievement is expiring soon
const isExpiringSoon = (endDate: string) => {
  const end = new Date(endDate);
  const now = new Date();
  const daysUntilExpiry = Math.ceil(
    (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
};

// Helper function to determine genre based on title/description
const determineGenre = (
  title: string,
  description: string
): Achievement["genre"] => {
  const text = (title + description).toLowerCase();
  if (
    text.includes("battle") ||
    text.includes("win") ||
    text.includes("defeat")
  )
    return "Action";
  if (
    text.includes("dungeon") ||
    text.includes("master") ||
    text.includes("quest")
  )
    return "RPG";
  if (text.includes("strategist") || text.includes("tactics"))
    return "Strategy";
  if (text.includes("race") || text.includes("score") || text.includes("team"))
    return "Sports";
  return "Adventure";
};

// Helper function to determine tier based on points
const determineTier = (points: number): Achievement["tier"] => {
  if (points >= 1000) return "premium";
  if (points >= 500) return "standard";
  return "free";
};

export default function AchievementGrid({
  achievements,
  onSelectAchievement 
}: AchievementGridProps) {
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);

  // Enhance achievements with derived properties
  const enhancedAchievements = achievements.map((achievement) => ({
    ...achievement,
    genre:
      achievement.genre ||
      determineGenre(achievement.title, achievement.description),
    tier: achievement.tier || determineTier(achievement.points),
    isHighPoints:
      achievement.isHighPoints ?? isHighPointsAchievement(achievement.points),
    isExpiringSoon:
      achievement.isExpiringSoon ?? isExpiringSoon(achievement.endDate),
  }));

  const GenreColors = {
    Action: "bg-red-100 text-red-800",
    RPG: "bg-purple-100 text-purple-800",
    Strategy: "bg-blue-100 text-blue-800",
    Sports: "bg-green-100 text-green-800",
    Adventure: "bg-yellow-100 text-yellow-800",
  };

  const TierColors = {
    free: "bg-gray-100 text-gray-800",
    standard: "bg-blue-100 text-blue-800",
    premium: "bg-purple-100 text-purple-800",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {enhancedAchievements.length === 0 ? (
        <div className="col-span-full text-center py-8 bg-surface rounded-lg">
          <p className="text-text-secondary">No achievements available</p>
        </div>
      ) : (
        enhancedAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className="bg-surface rounded-lg overflow-hidden relative"
          >
            {/* Top Left - Genre Badge */}
            <div className="absolute top-2 left-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  GenreColors[achievement.genre || "Adventure"]
                }`}
              >
                {achievement.genre || "Adventure"}
              </span>
            </div>

            {/* Top Right - Points Badge */}
            <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/50 text-white text-sm">
              +{achievement.points} Points
            </div>

            {/* Bottom Right Corner - Status Indicators */}
            <div className="absolute bottom-2 right-2 flex gap-2">
              {achievement.isExpiringSoon && (
                <div
                  className="relative"
                  onMouseEnter={() =>
                    setHoveredTooltip(`timer-${achievement.id}`)
                  }
                  onMouseLeave={() => setHoveredTooltip(null)}
                >
                  <div className="p-1 rounded-full bg-orange-100">
                    <svg
                      className="w-4 h-4 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  {hoveredTooltip === `timer-${achievement.id}` && (
                    <div className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded whitespace-nowrap">
                      Expiring Soon!
                    </div>
                  )}
                </div>
              )}

              {achievement.isHighPoints && (
                <div
                  className="relative"
                  onMouseEnter={() =>
                    setHoveredTooltip(`star-${achievement.id}`)
                  }
                  onMouseLeave={() => setHoveredTooltip(null)}
                >
                  <div className="p-1 rounded-full bg-yellow-100">
                    <svg
                      className="w-4 h-4 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </div>
                  {hoveredTooltip === `star-${achievement.id}` && (
                    <div className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded whitespace-nowrap">
                      High Points Achievement!
                    </div>
                  )}
                </div>
              )}

              {/* Tier Badge */}
              <div
                className="relative"
                onMouseEnter={() => setHoveredTooltip(`tier-${achievement.id}`)}
                onMouseLeave={() => setHoveredTooltip(null)}
              >
                <div
                  className={`p-1 rounded-full ${
                    TierColors[achievement.tier || "free"]
                  }`}
                >
                  {achievement.tier === "premium" ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4l1.465 1.638a2 2 0 01.411 1.187l.1 2.178a2 2 0 001.346 1.765l1.944.68a2 2 0 011.239 1.838l-.082 2.178a2 2 0 00.582 1.541l1.465 1.638a2 2 0 010 2.674l-1.465 1.638a2 2 0 00-.582 1.541l.082 2.178a2 2 0 01-1.239 1.838l-1.944.68a2 2 0 00-1.346 1.765l-.1 2.178a2 2 0 01-.411 1.187L12 20l-1.465-1.638a2 2 0 01-.411-1.187l-.1-2.178a2 2 0 00-1.346-1.765l-1.944-.68a2 2 0 01-1.239-1.838l.082-2.178a2 2 0 00-.582-1.541L4.93 8.357a2 2 0 010-2.674l1.465-1.638a2 2 0 00.582-1.541l-.082-2.178a2 2 0 011.239-1.838l1.944-.68a2 2 0 001.346-1.765l.1-2.178A2 2 0 0110.535 2L12 4z"
                      />
                    </svg>
                  ) : achievement.tier === "standard" ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                  ) : null}
                </div>
                {hoveredTooltip === `tier-${achievement.id}` && (
                  <div className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded whitespace-nowrap">
                    {(achievement.tier || "free").charAt(0).toUpperCase() +
                      (achievement.tier || "free").slice(1)}{" "}
                    Tier
                  </div>
                )}
              </div>
            </div>

            <div className="aspect-video relative">
              <img
                src={achievement.imageUrl}
                alt={achievement.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={achievement.gameIcon}
                  alt={achievement.gameName}
                  className="w-6 h-6 rounded"
                />
                <span className="text-sm text-text-secondary">
                  {achievement.gameName}
                </span>
              </div>
              <h3 className="font-medium text-text-primary mb-1">
                {achievement.title}
              </h3>
              <p className="text-sm text-text-secondary mb-3">
                {achievement.description}
              </p>
              <button
                className="w-full py-2 px-4 bg-primary font-semibold text-white rounded-lg hover:bg-gray-800 transition-colors mb-3"
                onClick={()=>{
                  onSelectAchievement(achievement)
                }}
              >
                Get Reward
              </button>
              <div className="flex items-center justify-between text-xs text-text-tertiary">
                <span>Start: {achievement.startDate}</span>
                <span>End: {achievement.endDate}</span>
              </div>
              <div
                className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  achievement.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {achievement.status === "active" ? "Active" : "Expired"}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
