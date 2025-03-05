import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  ShoppingCart,
  Gamepad2,
  ChevronDown,
  RefreshCw,
  Filter,
  Search,
} from "lucide-react";

// Dummy data for loot items
const dummyLootItems = [
  {
    id: "1",
    name: "Legendary Dragon Sword",
    type: "Weapon",
    rarity: "Legendary",
    purchaseDate: "2024-03-15",
    price: 299.99,
    image: "/lootbag/1.png",
    category: "Weapons",
  },
  {
    id: "2",
    name: "Phoenix Mount",
    type: "Vehicle",
    rarity: "Epic",
    purchaseDate: "2024-02-28",
    price: 199.99,
    image: "/lootbag/2.png",
    category: "Mounts",
  },
  {
    id: "3",
    name: "Stealth Armor Set",
    type: "Armor",
    rarity: "Rare",
    purchaseDate: "2024-03-01",
    price: 149.99,
    image: "/lootbag/3.png",
    category: "Armor",
  },
  {
    id: "4",
    name: "Mystic Spell Tome",
    type: "Consumable",
    rarity: "Epic",
    purchaseDate: "2024-02-20",
    price: 79.99,
    image: "/lootbag/4.png",
    category: "Consumables",
  },
];

const LootBagPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Rarity color mapping
  const rarityColors = {
    Legendary: "bg-orange-500",
    Epic: "bg-purple-500",
    Rare: "bg-blue-500",
    Common: "bg-green-500",
  };

  // Filter categories
  const categories = ["All", "Weapons", "Mounts", "Armor", "Consumables"];

  // Filter logic
  const filteredItems = dummyLootItems.filter(
    (item) =>
      (selectedCategory === "All" || item.category === selectedCategory) &&
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen mt-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white px-4 sm:px-8 py-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <Package size={32} className="text-indigo-400" />
          <h1 className="text-2xl sm:text-3xl font-bold">Loot Bag</h1>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Search your loot..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 p-2 rounded-full transition-colors">
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Category Filters (Horizontal Scroll on Mobile) */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap px-4 py-2 rounded-full transition-all duration-300 text-center ${
                selectedCategory === category
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Loot Grid */}
      {filteredItems.length > 0 ? (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6"
        >
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: index * 0.1,
                type: "spring",
                stiffness: 300,
              }}
              className="bg-gray-800 rounded-2xl p-4 sm:p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-gray-700"
            >
              <div className="relative mb-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-40 sm:h-48 object-cover rounded-xl"
                />
                <div
                  className={`absolute top-2 right-2 ${
                    rarityColors[item.rarity as keyof typeof rarityColors]
                  } text-white px-2 py-1 rounded-full text-xs font-bold`}
                >
                  {item.rarity}
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-indigo-300">
                  {item.name}
                </h3>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">{item.type}</span>
                  <span className="text-green-400 font-bold">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500">
                  Purchased: {item.purchaseDate}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-12">
          <ShoppingCart size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-lg sm:text-xl text-gray-400">
            No items found in your Loot Bag
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default LootBagPage;
