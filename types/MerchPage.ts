export interface MerchCardProps {
  item: {
    id: number;
    name: string;
    price: number;
    image: string;
    crypto: boolean;
    ogPoints: boolean;
    debitCard: boolean;
  };
}

export interface MerchFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  title?: string;
}

export interface MerchItem {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  crypto: boolean;
  ogPoints: boolean;
  debitCard: boolean;
  price_og_points: number | null;
  isPurchased: boolean;
}
