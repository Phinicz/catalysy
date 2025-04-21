import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, ShoppingCart, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Purchase {
  id: string;
  created_at: string;
  item: {
    id: number;
    name: string;
    price: number;
    image: string;
    description: string;
  };
  payment_method: "crypto" | "card" | "og_points";
  status: "pending" | "completed" | "failed";
  price_paid: number;
}

const Lootbags: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Please sign in to view your purchases");
        setIsLoading(false);
        return;
      }

      // First, fetch the purchases
      const { data: purchasesData, error: purchasesError } = await supabase
        .from("user_purchases")
        .select(
          `
          id,
          created_at,
          payment_method,
          status,
          price_paid,
          item_id
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (purchasesError) throw purchasesError;

      if (!purchasesData || purchasesData.length === 0) {
        setPurchases([]);
        setIsLoading(false);
        return;
      }

      // Then, fetch the associated items
      const itemIds = purchasesData.map((purchase) => purchase.item_id);
      const { data: itemsData, error: itemsError } = await supabase
        .from("merch_items")
        .select(
          `
          id,
          name,
          price_usd,
          image_url,
          description
        `
        )
        .in("id", itemIds);

      if (itemsError) throw itemsError;

      // Create a map of items for easy lookup
      const itemsMap = new Map(itemsData?.map((item) => [item.id, item]) || []);

      // Combine the data
      const transformedData: Purchase[] = purchasesData.map((purchase) => ({
        id: purchase.id,
        created_at: purchase.created_at,
        payment_method: purchase.payment_method,
        status: purchase.status,
        price_paid: purchase.price_paid,
        item: {
          id: itemsMap.get(purchase.item_id)?.id || 0,
          name: itemsMap.get(purchase.item_id)?.name || "Unknown Item",
          price: itemsMap.get(purchase.item_id)?.price_usd || 0,
          image: itemsMap.get(purchase.item_id)?.image_url || "",
          description: itemsMap.get(purchase.item_id)?.description || "",
        },
      }));

      setPurchases(transformedData);
    } catch (err) {
      console.error("Error fetching purchases:", err);
      setError("Failed to load your purchases");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
          <p className="mt-2 text-gray-400">Loading your purchases...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen pt-20 px-4"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center space-x-3 mb-8">
          <Package size={32} className="text-indigo-400" />
          <h1 className="text-3xl font-bold text-white">Your Loot Bag</h1>
        </div>

        {purchases.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {purchases.map((purchase, index) => (
              <motion.div
                key={purchase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700"
              >
                <div className="relative">
                  <img
                    src={purchase.item.image}
                    alt={purchase.item.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        purchase.status === "completed"
                          ? "bg-green-500/20 text-green-400"
                          : purchase.status === "pending"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {purchase.status.charAt(0).toUpperCase() +
                        purchase.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {purchase.item.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {purchase.item.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">
                        Purchased on{" "}
                        {new Date(purchase.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Paid with{" "}
                        {purchase.payment_method === "og_points"
                          ? `${purchase.price_paid} OG Points`
                          : purchase.payment_method === "crypto"
                          ? "Crypto"
                          : "Card"}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-indigo-400">
                      ${purchase.item.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <ShoppingCart size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-xl text-gray-400">
              Your loot bag is empty. Visit the merch store to make your first
              purchase!
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Lootbags;
