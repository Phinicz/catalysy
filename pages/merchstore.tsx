import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MerchCard from "../components/MerchCard";
import MerchFilter from "../components/MerchFilter";

// Define types for Merch Item
interface MerchItem {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  crypto: boolean;
  ogPoints: boolean;
  debitCard: boolean;
  description: string;
}

// Sample Merch Data with more gaming-themed items
const merchItems: MerchItem[] = [
  {
    id: 1,
    name: "Catalyst Legendary Hoodie",
    price: 79.99,
    image: "/merchstore/lootbox.png",
    category: "Apparel",
    crypto: true,
    ogPoints: true,
    debitCard: true,
    description: "Ultra-soft gaming hoodie with epic Catalyst logo",
  },
  {
    id: 2,
    name: "Quantum Gaming Mouse",
    price: 129.99,
    image: "/merchstore/lootbox.png",
    category: "Electronics",
    crypto: true,
    ogPoints: false,
    debitCard: true,
    description: "Pro-level gaming mouse with RGB customization",
  },
  {
    id: 3,
    name: "Catalyst Esports Jersey",
    price: 59.99,
    image: "/merchstore/lootbox.png",
    category: "Apparel",
    crypto: true,
    ogPoints: true,
    debitCard: true,
    description: "Official Catalyst Esports team jersey",
  },
  // Add more items...
];

const MerchStorePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [paymentFilter, setPaymentFilter] = useState<string>("All");

  // Filter items based on category and payment method
  const filteredItems = merchItems.filter(
    (item) =>
      (selectedCategory === "All" || item.category === selectedCategory) &&
      (paymentFilter === "All" ||
        (paymentFilter === "Crypto" && item.crypto) ||
        (paymentFilter === "OG Points" && item.ogPoints) ||
        (paymentFilter === "Debit Card" && item.debitCard))
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen  text-gray-100 pt-20 px-4"
    >
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold mb-10 text-center   "
      >
        Catalyst Exclusive Merch Store
      </motion.h1>

      {/* Filters Container */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex justify-center space-x-6 mb-12"
      >
        <MerchFilter
          categories={["All", "Apparel", "Electronics", "Accessories"]}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <MerchFilter
          categories={["All", "Crypto", "OG Points", "Debit Card"]}
          selectedCategory={paymentFilter}
          onCategoryChange={setPaymentFilter}
          title="Payment Method"
        />
      </motion.div>

      {/* Merch Grid */}
      <AnimatePresence>
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                duration: 0.3,
                delay: index * 0.1,
              }}
            >
              <MerchCard item={item} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredItems.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-500 mt-10"
        >
          No items match your current filters.
        </motion.p>
      )}
    </motion.div>
  );
};

export default MerchStorePage;
