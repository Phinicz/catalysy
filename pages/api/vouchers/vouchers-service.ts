import { ethers, BigNumber } from "ethers"; // Top-level import for ethers
import { supabase } from "@/lib/supabase";
import { Voucher } from "./voucher";
import { Asset } from "../assets/asset";

// Helper: contract type to uint8
const contractTypeToUint8 = (contractType: string) => {
  switch (contractType) {
    case "ERC721":
      return 0;
    case "ERC1155":
      return 1;
    case "ERC20":
      return 2;
    default:
      return 0;
  }
};

// Helper: random uint256 string
const getRandomUint256 = () => {
  return BigNumber.from(ethers.utils.randomBytes(32)).toString();
};

const PRIVATE_KEY = process.env.PRIVATE_KEY!;

// Helper: getSigner (placeholder, must be implemented for real signing)
const getSigner = (): ethers.Wallet => {
  if (!PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is not set in environment variables");
  }
  return new ethers.Wallet(PRIVATE_KEY);
};

export class VouchersService {
  public async getVouchersOfUser(uid: string): Promise<Voucher[]> {
    const { data, error } = await supabase
      .from("vouchers")
      .select("*")
      .eq("userId", uid);
    if (error || !data) throw new Error("Vouchers not found");
    return data.map((row: any) => ({ ...row, uid: row.id }));
  }

  public async getVoucherById(voucherId: string): Promise<Voucher> {
    const { data, error } = await supabase
      .from("vouchers")
      .select("*")
      .eq("id", voucherId)
      .single();
    if (error || !data) throw new Error("Voucher not found");
    return { ...data, uid: data.id };
  }

  // Convert asset to voucher for a user
  public async giveVoucherToUser(
    userId: string,
    asset: Asset,
    amount: number,
    overrideTokenId?: string
  ) {
    const auxTokenId = overrideTokenId || asset.tokenId;
    const receiverVouchers = await this.getVouchersOfUser(userId);
    const receiverVoucher = receiverVouchers.find(
      (v) => v.contract === asset.contract && v.tokenId === auxTokenId
    );
    let voucherId = "";
    if (receiverVoucher) {
      const { error } = await supabase
        .from("vouchers")
        .update({ amount: receiverVoucher.amount + amount })
        .eq("id", receiverVoucher.uid);
      if (error) throw new Error("Failed to update voucher");
      voucherId = receiverVoucher.uid;
    } else {
      const { data: newVoucher, error } = await supabase
        .from("vouchers")
        .insert({
          userId,
          assetId: asset.uid || asset.id,
          holder: asset.holder,
          contract: asset.contract,
          contractType: asset.contractType,
          type: asset.type,
          name: asset.name,
          amount,
          image: asset.image,
          tokenId: auxTokenId,
          blockchainId: getRandomUint256(),
          category: asset.category,
          receiver: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) {
        console.error("Supabase insert error:", error);
        throw new Error(error.message || "Failed to create voucher");
      }
      if (!newVoucher) throw new Error("No voucher returned from insert");
      voucherId = newVoucher.id;
    }
    return voucherId;
  }

  // User signs/claims a voucher
  public async getVoucherClaimSignature(voucher: Voucher, address: string) {
    await supabase
      .from("vouchers")
      .update({ receiver: address })
      .eq("id", voucher.uid);
    const signature = await this.getTokenSignature(voucher, address);
    return {
      rewardContractType: contractTypeToUint8(voucher.contractType),
      rewardHolderAddress: voucher.holder || ethers.constants.AddressZero,
      rewardContract: voucher.contract,
      receiver: address,
      tokenId: voucher.tokenId || "0",
      amount:
        voucher.contractType === "ERC20"
          ? ethers.utils.parseEther(voucher.amount.toString())
          : voucher.amount,
      claimableUntil: 0,
      voucherId: voucher.blockchainId,
      signature,
    };
  }

  private async getTokenSignature(voucher: Voucher, address: string) {
    const signer = getSigner(); // <-- implement this for your environment
    const amount =
      voucher.contractType === "ERC20"
        ? ethers.utils.parseEther(voucher.amount.toString())
        : voucher.amount;
    const values = [
      voucher.holder || ethers.constants.AddressZero,
      contractTypeToUint8(voucher.contractType),
      voucher.contract,
      address,
      voucher.tokenId || "0",
      amount,
      0,
      ethers.BigNumber.from(voucher.blockchainId), // Use ethers.BigNumber.from
    ];
    const hash = ethers.utils.solidityKeccak256(
      [
        "address",
        "uint8",
        "address",
        "address",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
      ],
      values
    );
    const signature = await signer.signMessage(ethers.utils.arrayify(hash));
    return signature;
  }
}
