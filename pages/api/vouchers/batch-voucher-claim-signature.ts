export interface BatchVoucherClaimSignature {
  rewardContractType: number,
  rewardHolderAddress: string,
  rewardContract: string,
  receiver: string,
  tokenIds?: string[],
  amounts: number[],
  claimableUntil: number,
  voucherIds: string[],
  signature: string,
}