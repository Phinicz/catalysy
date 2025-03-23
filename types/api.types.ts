export interface UserMetadata {
  displayName: string;
  emailVerifiedAt: string | null;
  // ... other metadata fields
}

export interface User {
  id: string;
  walletAddress: string;
  userMetadata: UserMetadata[];
  temporaryLoyaltyUser: boolean;
  isSnagSuperAdmin: boolean;
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
  data: {
    loyaltyRuleId: string;
    userId: string;
    status: "completed" | "pending" | "failed";
    message?: string;
  }[];
};
