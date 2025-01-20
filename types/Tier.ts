export type Tier = {
  name: string;
  gameGenre: string;
  rewardRange: string;
  description: string;
  bonuses?: {
    standardBattlePass?: string;
    premiumBattlePass?: string;
  };
};

export type SubscriptionTier = {
  name: string;
  price?: string;
  tiers: Tier[];
};
