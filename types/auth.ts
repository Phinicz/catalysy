export type UserRole = "player" | "partner";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  profile_picture?: string;
  bio?: string;
  coins: number;
  gems: number;
}

