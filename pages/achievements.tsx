import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import SlidingBanner from "../components/Banner/SlidingBanner";
import AchievementGrid from "../components/Achievements/AchievementGrid";
import Pagination from "../components/common/Pagination";
import AchievementModal from "@/components/Achievements/AchievementModal";
import { Achievement } from "@/types/Achievement";
import Modal from "@/components/Layout/Modal";
import { supabase } from "@/lib/supabase";
import { useAdmin } from "@/hooks/useAdmin";

const ITEMS_PER_PAGE = 6; // Number of achievements to show per page

const BANNER_ITEMS = [
  {
    id: "1",
    imageUrl: "/placeholders/achivements/3.jpg",
    title: "Earn Achievement Points",
    description: "Complete challenges and collect points",
  },
];

export default function AchievementsPage() {
  const router = useRouter();
  const { isAdmin } = useAdmin();
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement>();
  const [trendingAchievements, setTrendingAchievements] = useState<
    Achievement[]
  >([]);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, [currentPage]); // Refetch when page changes

  const fetchAchievements = async () => {
    try {
      setIsLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        window.location.href = "/";
        return;
      }

      // Fetch total count for pagination
      const { count } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true });

      if (count !== null) {
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      }

      // Fetch paginated achievements
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .range(
          (currentPage - 1) * ITEMS_PER_PAGE,
          currentPage * ITEMS_PER_PAGE - 1
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Set trending achievements (first 3)
      setTrendingAchievements(data.slice(0, 3));
      // Set all achievements for current page
      setAllAchievements(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="py-20 px-8">
      <SlidingBanner items={BANNER_ITEMS} />

      <div className="mt-8">
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              Trending Achievements
            </h2>
            {isAdmin && (
              <button
                onClick={() => router.push("/admin/create-achievement")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Achievement
              </button>
            )}
          </div>
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
              className="px-4 py-2 border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-lg bg-surface text-black"
            />
          </div>
          <AchievementGrid
            achievements={allAchievements}
            onSelectAchievement={(achievement) => {
              setSelectedAchievement(achievement);
              setIsAchievementModalOpen(true);
            }}
          />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </section>
      </div>

      <Modal
        show={isAchievementModalOpen}
        closeModal={() => setIsAchievementModalOpen(false)}
      >
        {selectedAchievement ? (
          <AchievementModal
            isOpen={isAchievementModalOpen}
            onClose={() => setIsAchievementModalOpen(false)}
            achievement={selectedAchievement}
          />
        ) : null}
      </Modal>
    </div>
  );
}
