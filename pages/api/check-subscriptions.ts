import { NextApiRequest, NextApiResponse } from "next";
import {
  checkExpiringSubscriptions,
  handleExpiredSubscriptions,
} from "@/utils/subscription-checks";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Verify the request is authorized (you should implement proper authentication)
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Check for expiring subscriptions and send notifications
    await checkExpiringSubscriptions();

    // Handle expired subscriptions
    await handleExpiredSubscriptions();

    return res
      .status(200)
      .json({ message: "Subscription checks completed successfully" });
  } catch (error) {
    console.error("Error in subscription check endpoint:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
