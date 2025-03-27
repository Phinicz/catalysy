import { SubscriptionTier } from "../types/Tier";

export const subscriptionData: SubscriptionTier[] = [
  {
    name: "Free Subscription",
    tiers: [
      {
        name: "Tier 1: Easy",
        gameGenre: "Varies",
        rewardRange: "5-15",
        description: "Low-value, low-effort tasks",
        bonuses: {
          standardBattlePass: "+15% OG Points",
          premiumBattlePass: "+30% OG Points",
        },
      },
      {
        name: "Tier 2: Medium",
        gameGenre: "Varies",
        rewardRange: "20-40",
        description: "Moderate effort with a limited selection of achievements",
        bonuses: {
          standardBattlePass: "+15% OG Points",
          premiumBattlePass: "+30% OG Points",
        },
      },
    ],
  },
  {
    name: "Standard Subscription",
    price: "14.99",
    tiers: [
      {
        name: "Tier 1: Easy",
        gameGenre: "Varies",
        rewardRange: "10-25",
        description: "Higher payout for basic achievements",
        bonuses: {
          premiumBattlePass: "+20% OG Points",
        },
      },
      {
        name: "Tier 2: Medium",
        gameGenre: "Varies",
        rewardRange: "40-80",
        description: "Full access to medium achievements",
        bonuses: {
          premiumBattlePass: "+20% OG Points",
        },
      },
      {
        name: "Tier 3: Hard",
        gameGenre: "Varies",
        rewardRange: "100-200",
        description: "Full access to challenging achievements",
        bonuses: {
          premiumBattlePass: "+20% OG Points",
        },
      },
      {
        name: "Tier 4: Epic/Seasonal",
        gameGenre: "Varies",
        rewardRange: "300-450",
        description: "Limited access to seasonal achievements",
        bonuses: {
          premiumBattlePass: "+20% OG Points",
        },
      },
    ],
  },
  {
    name: "Premium Subscription",
    price: "34.99",
    tiers: [
      {
        name: "Tier 1: Easy",
        gameGenre: "Varies",
        rewardRange: "15-30",
        description: "Accessible for all. Low-value, low-effort tasks",
      },
      {
        name: "Tier 2: Medium",
        gameGenre: "Varies",
        rewardRange: "60-100",
        description: "Moderate effort with a wide selection of achievements",
      },
      {
        name: "Tier 3: Hard",
        gameGenre: "Varies",
        rewardRange: "150-300",
        description:
          "Full access to challenging and exclusive hard-tier achievements",
      },
      {
        name: "Tier 4: Epic/Seasonal",
        gameGenre: "Varies",
        rewardRange: "400-500",
        description:
          "Full access to limited seasonal events with top-tier rewards and prestige",
      },
    ],
  },
];
