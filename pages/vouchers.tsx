import { useEffect, useState } from "react";

type Voucher = {
  id: string;
  uid?: string;
  name: string;
  amount: number;
  contract: string;
  contractType: string;
  tokenId?: string;
  category?: string;
  receiver?: string | null;
  claimed?: boolean;
  // ...add other fields as needed
};

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Replace with your actual userId logic
  const userId = "USER_ID_HERE";

  useEffect(() => {
    setLoading(true);
    fetch(`/api/vouchers/user?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setVouchers(data.vouchers || []);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch vouchers");
        setLoading(false);
      });
  }, []);

  const claimVoucher = async (voucher: Voucher) => {
    setClaiming(voucher.id);
    setError(null);
    try {
      // Replace with actual user wallet address
      const address = prompt("Enter your wallet address to claim:") || "";
      const res = await fetch("/api/vouchers/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voucherId: voucher.id, address }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Voucher claimed! Signature: " + data.signature);
        // Optionally update UI to show claimed
      } else {
        setError(data.error || "Failed to claim voucher");
      }
    } catch (e) {
      setError("Failed to claim voucher");
    }
    setClaiming(null);
  };

  return (
    <div style={{ padding: 32 }}>
      <h1>Your Vouchers</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {vouchers.map((voucher) => (
          <li key={voucher.id} style={{ marginBottom: 16 }}>
            <b>{voucher.name}</b> (Amount: {voucher.amount}, TokenId:{" "}
            {voucher.tokenId})
            <br />
            <button
              onClick={() => claimVoucher(voucher)}
              disabled={claiming === voucher.id}
            >
              {claiming === voucher.id ? "Claiming..." : "Claim"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
