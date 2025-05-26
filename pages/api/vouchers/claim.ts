import type { NextApiRequest, NextApiResponse } from "next";
import { VouchersService } from "./vouchers-service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { voucherId, address } = req.body;
  if (!voucherId || !address) {
    return res.status(400).json({ error: "Missing voucherId or address" });
  }
  try {
    const vouchersService = new VouchersService();
    const voucher = await vouchersService.getVoucherById(voucherId);
    const claimResult = await vouchersService.getVoucherClaimSignature(
      voucher,
      address
    );
    res.status(200).json(claimResult);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
