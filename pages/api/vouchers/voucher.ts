export interface Voucher {
  blockchainId: string;
  uid: string;
  amount: number;
  category: string;
  contract: string;
  contractType: "ERC20" | "ERC721" | "ERC1155";
  holder?: string | null;
  name: string;
  type: "blockchain" | "game";
  userId: string;
  image?: string;
  receiver?: string;
  tokenId?: string;
  createdAt: string;
  updatedAt: string;
}
