export interface VoucherLog {
  actionUserId?: string;
  actionUserEmail?: string;
  apiKey?: string;
  action: 'transfer' | 'giveaway' | 'request-signature' | 'migrate' | 'delete' | 'sync-deposit' | 'trade' | 'accept-offer';
  toUserId: string
  toUserEmail: string
  vouchersData: {
    image?: string;
    receiver?: string;
    tokenId?: string;
    uid: string;
    amount: number;
    contract: string;
    holder: string;
    name: string;
  }[];
  timestamp: string;
}