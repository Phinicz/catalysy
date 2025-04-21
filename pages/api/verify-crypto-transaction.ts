import { NextApiRequest, NextApiResponse } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Extract and verify token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Unauthorized - No token provided" });
    }
    const token = authHeader.split(" ")[1];

    // Initialize Supabase client
    const supabase = createPagesServerClient({ req, res });

    // Authenticate user with extracted token
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { transactionHash, amount, itemId } = req.body;
    if (!transactionHash || !amount || !itemId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Verify transaction using Etherscan API
    const etherscanResponse = await axios.get(
      `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${transactionHash}&apikey=${process.env.ETHERSCAN_API_KEY}`
    );

    if (etherscanResponse.data.error) {
      return res.status(400).json({ error: "Invalid transaction hash" });
    }

    const transaction = etherscanResponse.data.result;

    // Verify transaction details
    if (!transaction) {
      return res.status(400).json({ error: "Transaction not found" });
    }

    // Verify transaction was sent to our wallet
    if (
      transaction.to.toLowerCase() !==
      process.env.CRYPTO_WALLET_ADDRESS?.toLowerCase()
    ) {
      return res
        .status(400)
        .json({ error: "Transaction sent to wrong address" });
    }

    // Convert amount from wei to ETH and compare
    const transactionAmount = parseFloat(transaction.value) / 1e18;
    if (Math.abs(transactionAmount - amount) > 0.0001) {
      // Allow small difference for gas fees
      return res.status(400).json({ error: "Transaction amount mismatch" });
    }

    // Get transaction receipt to check confirmation status
    const receiptResponse = await axios.get(
      `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionReceipt&txhash=${transactionHash}&apikey=${process.env.ETHERSCAN_API_KEY}`
    );

    if (!receiptResponse.data.result) {
      return res.status(400).json({ error: "Transaction not confirmed" });
    }

    // Create purchase record
    const { error: purchaseError } = await supabase
      .from("user_purchases")
      .insert({
        user_id: data.user.id,
        item_id: itemId,
        payment_method: "crypto",
        status: "completed",
        transaction_id: transactionHash,
        price_paid: amount,
      });

    if (purchaseError) {
      console.error("Error creating purchase record:", purchaseError);
      return res
        .status(500)
        .json({ error: "Failed to create purchase record" });
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Error verifying transaction:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
