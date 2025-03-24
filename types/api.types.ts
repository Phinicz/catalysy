export interface UserMetadata {
  displayName: string;
  emailVerifiedAt: string | null;
  // ... other metadata fields
}

export interface User {
  id: string;
  temporaryLoyaltyUser: boolean;
  isSnagSuperAdmin: boolean;
  walletAddress: string;
  walletType: string;
  displayName?: string;
  emailAddress?: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  websiteId: string;
  userId: string;
  bio: string | null;
  discordUserId: string | null;
  telegramUserId: string | null;
  twitterUserId: string | null;
  steamUserId: string | null;
  epicAccountIdentifier: string | null;
  instagramUserId: string | null;
  emailVerifiedAt: string | null;
  discordVerifiedAt: string | null;
  telegramVerifiedAt: string | null;
  twitterVerifiedAt: string | null;
  steamVerifiedAt: string | null;
  epicVerifiedAt: string | null;
  instagramVerifiedAt: string | null;
  isBlocked: boolean;
  location: string | null;
  logoUrl: string | null;
  portfolioUrl: string | null;
  meta: any | null;
  userGroup: any | null;
  userGroupId: string | null;
  walletGroupIdentifier: string | null;
  externalIdentifier: string | null;
}

export interface ApiResponse {
  data: User[];
  hasNextPage: boolean;
}

export interface CreateUserData {
  walletAddress: string;
  displayName: string;
  emailAddress: string;
  discordUserId?: string;
  telegramUserId?: string;
}

export interface UserCountResponse {
  totalCount: number;
}

export interface UserCountParams {
  organizationId?: string;
  websiteId?: string;
}

export type LoyaltyRule = {
  id: string;
  name: string;
  type: string;
  network: string;
  amount: string;
  rewardType: string;
  frequency: string;
};

export type LoyaltyRulesResponse = {
  data: LoyaltyRule[];
};

export type RuleProcessingStatus = {
  message: string;
  rewarded: boolean;
};
