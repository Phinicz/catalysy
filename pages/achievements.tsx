import { useState, useEffect } from "react";
import SlidingBanner from "../components/Banner/SlidingBanner";
import AchievementGrid from "../components/Achievements/AchievementGrid";
import Pagination from "../components/common/Pagination";
import AchievementModal from "@/components/Achievements/AchievementModal";
import { Achievement } from "@/types/Achievement";
import Modal from "@/components/Layout/Modal";

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
        deeplink: "https://store.steampowered.com/app/588650/Dead_Cells",
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
        icon: "/placeholders/achivements/4.jpg",
        deeplink: "https://store.steampowered.com/app/588650/Dead_Cells",
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
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement>();

  const [trendingAchievements, setTrendingAchievements] = useState(
    SAMPLE_ACHIEVEMENTS.trending
  );
  const [allAchievements, setAllAchievements] = useState(
    SAMPLE_ACHIEVEMENTS.trending
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(3);

  return (
    <div className="py-20 px-8">
      <SlidingBanner items={BANNER_ITEMS} />

      <div className="mt-8">
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">
            Trending Achievements
          </h2>
          <AchievementGrid
            achievements={trendingAchievements}
            onSelectAchievement={(achievement) => {
              setSelectedAchievement(achievement);
              setIsAchievementModalOpen(true);
            }}
          />
        </section>

        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">All Achievements</h2>
            <input
              type="search"
              placeholder="Search Achievements"
              className="px-4 py-2 border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-lg bg-surface text-black "
            />
          </div>
          <AchievementGrid
            achievements={allAchievements}
            onSelectAchievement={(achievement) => {
              setSelectedAchievement(achievement);
              setIsAchievementModalOpen(true);
            }}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </section>
      </div>
        <Modal show={isAchievementModalOpen} closeModal={() => setIsAchievementModalOpen(false)}>
          {selectedAchievement ? (
            <AchievementModal
              isOpen={isAchievementModalOpen}
              onClose={() => setIsAchievementModalOpen(false)}
              achievement={selectedAchievement}
            />
          ): null}
        </Modal>
    </div>
  );
}
