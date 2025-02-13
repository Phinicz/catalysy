import { useState, useEffect } from "react";
import SlidingBanner from "../components/Banner/SlidingBanner";
import AchievementGrid from "../components/Achievements/AchievementGrid";
import Pagination from "../components/common/Pagination";

const SAMPLE_ACHIEVEMENTS = {
  trending: [
    {
      id: "1",
      title: "Master Strategist",
      description: "Win 50 ranked matches with a win rate above 60%",
      imageUrl: "/placeholders/achivements/4.jpg",
      points: 500,
      startDate: "2024-12-01",
      endDate: "2024-12-31",
      status: "active" as const,
      game: {
        name: "Nyan Heroes",
        icon: "/placeholders/achivements/4.jpg",
      },
    },
    {
      id: "2",
      title: "Dungeon Master",
      description: "Complete all dungeons in hardcore mode",
      imageUrl: "/placeholders/achivements/5.jpg",
      points: 1000,
      startDate: "2024-12-15",
      endDate: "2025-01-15",
      status: "active" as const,
      game: {
        name: "Uldor Test",
        icon: "/api/placeholder/50/50",
      },
    },
  ],
  all: [
    /* ... trending achievements plus more ... */
  ],
};

const BANNER_ITEMS = [
  {
    id: "1",
    imageUrl: "/placeholders/achivements/3.jpg",
    title: "Earn Achievement Points",
    description: "Complete challenges and collect points",
  },
];

export default function AchievementsPage() {
  const [trendingAchievements, setTrendingAchievements] = useState(
    SAMPLE_ACHIEVEMENTS.trending
  );
  const [allAchievements, setAllAchievements] = useState(
    SAMPLE_ACHIEVEMENTS.trending
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(3);

  return (
    <div className="p-8">
      <SlidingBanner items={BANNER_ITEMS} />

      <div className="mt-8">
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">
            Trending Achievements
          </h2>
          <AchievementGrid achievements={trendingAchievements} />
        </section>

        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">All Achievements</h2>
            <input
              type="search"
              placeholder="Search Achievements"
              className="px-4 py-2 border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-red-500 rounded-lg bg-surface text-black "
            />
          </div>
          <AchievementGrid achievements={allAchievements} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </section>
      </div>
    </div>
  );
}
