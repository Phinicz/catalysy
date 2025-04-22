import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  ShoppingCart,
  Gamepad2,
  ChevronDown,
  RefreshCw,
  Search,
  Filter,
  Loader2,
  Star,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import MerchCard from "@/components/MerchCard";
import MerchFilter from "@/components/MerchFilter";
import { MerchItem } from "@/types/MerchPage";

const Merchstore: React.FC = () => {
  const [items, setItems] = useState<MerchItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MerchItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userOGPoints, setUserOGPoints] = useState<number>(0);
  const [purchasedItems, setPurchasedItems] = useState<number[]>([]);

  useEffect(() => {
    fetchMerchItems();
    fetchUserOGPoints();
    fetchPurchasedItems();
  }, []);

  const fetchMerchItems = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Please sign in to view merchandise");
        setIsLoading(false);
        return;
      }

      // First fetch all merch items
      const { data: itemsData, error: itemsError } = await supabase
        .from("merch_items")
        .select("*");

      if (itemsError) throw itemsError;

      // Then fetch user's completed purchases
      const { data: purchasesData, error: purchasesError } = await supabase
        .from("user_purchases")
        .select("item_id")
        .eq("user_id", user.id)
        .eq("status", "completed");

      if (purchasesError) throw purchasesError;

      // Create a set of purchased item IDs for quick lookup
      const purchasedItemIds = new Set(
        purchasesData?.map((purchase) => purchase.item_id) || []
      );

      // Transform the data to match MerchItem type and include purchase status
      const transformedItems: MerchItem[] = itemsData.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price_usd || 0,
        image: item.image_url,
        category: item.category || "Other",
        description: item.description || "",
        crypto: item.crypto || false,
        ogPoints: item.og_points || false,
        debitCard: item.debit_card || false,
        price_og_points: item.price_og_points || null,
        isPurchased: purchasedItemIds.has(item.id),
      }));

      setItems(transformedItems);
      setFilteredItems(transformedItems);
    } catch (error) {
      console.error("Error fetching merch items:", error);
      setError("Failed to load merchandise items");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserOGPoints = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("og_points")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserOGPoints(profile.og_points);
      }
    } catch (error) {
      console.error("Error fetching OG points:", error);
    }
  };

  const fetchPurchasedItems = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all completed purchases for the user
      const { data: purchases, error: purchaseError } = await supabase
        .from("user_purchases")
        .select(
          `
          id,
          item_id,
          status,
          payment_method,
          created_at
        `
        )
        .eq("user_id", user.id)
        .eq("status", "completed");

      if (purchaseError) throw purchaseError;

      if (purchases) {
        // Create a set of purchased item IDs
        const purchasedItemIds = new Set(
          purchases.map((purchase) => parseInt(purchase.item_id))
        );
        setPurchasedItems(Array.from(purchasedItemIds));
      }
    } catch (error) {
      console.error("Error fetching purchased items:", error);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    filterItems(term, selectedCategory);
  };

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    filterItems(searchTerm, category);
  };

  const filterItems = (term: string, category: string | null) => {
    let filtered = items;

    if (term) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(term.toLowerCase())
      );
    }

    if (category) {
      filtered = filtered.filter((item) => item.category === category);
    }

    setFilteredItems(filtered);
  };

  const handleOGPointsUpdate = (newPoints: number) => {
    setUserOGPoints(newPoints);
  };

  // Get unique categories from items
  const categories = ["All", ...new Set(items.map((item) => item.category))];

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
          <p className="mt-2 text-gray-400">Loading merchandise...</p>
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
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-[40vh] bg-gradient-to-br from-purple-900 via-indigo-900 to-gray-900 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
        <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center relative z-10">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold text-white text-center mb-4"
          >
            Merch Store
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-300 text-center max-w-2xl"
          >
            Exclusive merchandise for our community members
          </motion.p>
          {userOGPoints > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 bg-purple-900/50 backdrop-blur-sm px-6 py-3 rounded-full flex items-center gap-2 border border-purple-700/50"
            >
              <Star className="text-purple-400" />
              <span className="text-white font-medium">
                {userOGPoints} OG Points Available
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Search and Filter Section */}
      <div className="container mx-auto px-4 -mt-8 relative z-20">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 shadow-xl"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search merchandise..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-gray-900/50 text-white pl-12 pr-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <MerchFilter
              categories={categories}
              selectedCategory={selectedCategory || "All"}
              onCategoryChange={handleCategoryChange}
            />
          </div>
        </motion.div>
      </div>

      {/* Items Grid */}
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
          </div>
        ) : filteredItems.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * index }}
              >
                <MerchCard
                  item={item}
                  onOGPointsUpdate={handleOGPointsUpdate}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-400 py-12"
          >
            No items found matching your criteria
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Merchstore;
