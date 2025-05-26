export interface Asset {
  id: string;
  uid?: string;
  name: string;
  category: string;
  description?: string;
  contract: string;
  holder?: string;
  contractType: string;
  tokenId?: string;
  type: string;
  property?: string;
  image?: string;
  amount?: number;
  blockchainId?: string;
  receiver?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
