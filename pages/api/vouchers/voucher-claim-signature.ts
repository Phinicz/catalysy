import { BigNumber } from "ethers";

export interface VoucherClaimSignature {
  rewardContractType: number,
  rewardHolderAddress: string,
  rewardContract: string,
  receiver: string,
  amount: BigNumber | number,
  claimableUntil: number,
  voucherId: string,
  signature: string,
  tokenId?: string,
  eggType?: number
}