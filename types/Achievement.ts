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
  genre: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tier: "free" | "standard" | "premium";
  game: {
    name: string;
    icon: string;
  };
}
