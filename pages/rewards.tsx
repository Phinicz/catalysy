import { useState } from "react";
import RewardCard from "../components/Rewards/RewardCard";

const SAMPLE_REWARDS = [
  {
    id: "1",
    title: "Exclusive Character Skin",
    description: "Limited edition skin for your favorite character",
    imageUrl: "/placeholders/achivements/1.jpg",
    category: "COSMETIC",
    points: 1000,
  },
  {
    id: "2",
    title: "Premium Battle Pass",
    description: "Get instant access to premium rewards",
    imageUrl: "/placeholders/achivements/2.jpg",
    category: "PASS",
    points: 2000,
  },
  {
    id: "3",
    title: "Rare Mount",
    description: "Show off with this exclusive mount",
    imageUrl: "/placeholders/achivements/4.jpg",
    category: "MOUNT",
    points: 1500,
  },
  {
    id: "4",
    title: "Weapon Skin Bundle",
    description: "Collection of unique weapon skins",
    imageUrl: "/placeholders/achivements/3.jpg",
    category: "BUNDLE",
    points: 3000,
  },
  {
    id: "5",
    title: "Player Title",
    description: "Unique display title for your profile",
    imageUrl: "/placeholders/achivements/4.jpg",
    category: "TITLE",
    points: 500,
  },
  {
    id: "6",
    title: "Emote Pack",
    description: "Set of exclusive emotes",
    imageUrl: "/placeholders/achivements/5.jpg",
    category: "COSMETIC",
    points: 800,
  },
  {
    id: "7",
    title: "Profile Banner",
    description: "Customize your profile with this rare banner",
    imageUrl: "/placeholders/achivements/4.jpg",
    category: "COSMETIC",
    points: 700,
  },
  {
    id: "8",
    title: "Season Pass Bundle",
    description: "Get the next 3 season passes",
    imageUrl: "/placeholders/achivements/4.jpg",
    category: "BUNDLE",
    points: 5000,
  },
];

const categories = ["ALL", "COSMETIC", "PASS", "MOUNT", "BUNDLE", "TITLE"];

export default function RewardsPage() {
  const [rewards] = useState(SAMPLE_REWARDS);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRewards = rewards.filter((reward) => {
    const matchesCategory =
      selectedCategory === "ALL" || reward.category === selectedCategory;
    const matchesSearch =
      reward.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reward.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-8">
      <div className="relative h-[300px] rounded-lg overflow-hidden mb-8">
        <img
          src="/placeholders/achivements/4.jpg"
          alt="Rewards"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
          <div className="absolute bottom-0 left-0 p-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Claim Your Rewards
            </h1>
            <p className="text-white/90">
              Use your points to unlock exclusive gaming rewards
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        {/* Categories and Search */}
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
                {category}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredRewards.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-text-secondary">
              No rewards found matching your criteria
            </p>
          </div>
        ) : (
          filteredRewards.map((reward) => (
            <RewardCard key={reward.id} {...reward} />
          ))
        )}
      </div>
    </div>
  );
}
