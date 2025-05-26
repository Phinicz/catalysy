import type { NextApiRequest, NextApiResponse } from "next";
import { VouchersService } from "./vouchers-service";
import { AssetsService } from "../assets/assets-service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, assetId, amount, overrideTokenId } = req.body;
  if (!userId || !assetId || !amount) {
    return res
      .status(400)
      .json({ error: "Missing required fields: userId, assetId, amount" });
  }

  try {
    const assetsService = new AssetsService();
    const asset = await assetsService.getAsset(assetId);
    if (!asset) {
      return res.status(404).json({ error: "Asset not found" });
    }

    const vouchersService = new VouchersService();
    const voucherId = await vouchersService.giveVoucherToUser(
      userId,
      asset,
      amount,
      overrideTokenId
    );
    return res.status(200).json({ success: true, voucherId });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
}
