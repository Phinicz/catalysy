interface Achievement {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  points: number;
  startDate: string;
  endDate: string;
  status: "active" | "expired";
  game: {
    name: string;
    icon: string;
  };
}

interface AchievementGridProps {
  achievements: Achievement[];
}

export default function AchievementGrid({
  achievements,
}: AchievementGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {achievements.length === 0 ? (
        <div className="col-span-full text-center py-8 bg-surface rounded-lg">
          <p className="text-text-secondary">No achievements available</p>
        </div>
      ) : (
        achievements.map((achievement) => (
          <div
            key={achievement.id}
            className="bg-surface rounded-lg overflow-hidden"
          >
            <div className="aspect-video relative">
              <img
                src={achievement.imageUrl}
                alt={achievement.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/50 text-white text-sm">
                +{achievement.points} Points
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={achievement.game.icon}
                  alt={achievement.game.name}
                  className="w-6 h-6 rounded"
                />
                <span className="text-sm text-text-secondary">
                  {achievement.game.name}
                </span>
              </div>
              <h3 className="font-medium text-text-primary mb-1">
                {achievement.title}
              </h3>
              <p className="text-sm text-text-secondary mb-3">
                {achievement.description}
              </p>
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
