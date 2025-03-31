export interface Achievement {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  points: number;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "expired";
  progress?: {
    current: number;
    total: number;
  };
  // Make new fields optional with defaults
  genre?: "Action" | "RPG" | "Strategy" | "Sports" | "Adventure";
  difficulty?: "Easy" | "Medium" | "Hard";
  tier?: "free" | "standard" | "premium";
  isHighPoints?: boolean;
  isExpiringSoon?: boolean;
  gameName: string;
  gameIcon: string;
  gameDeeplink: string;
}
