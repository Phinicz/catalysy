import type { NextApiRequest, NextApiResponse } from "next";
import { VouchersService } from "./vouchers-service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = req.query;
  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "Missing userId" });
  }
  try {
    const vouchersService = new VouchersService();
    const vouchers = await vouchersService.getVouchersOfUser(userId);
    res.status(200).json({ vouchers });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
