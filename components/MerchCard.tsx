import React from "react";
import { motion } from "framer-motion";
import { MerchItem } from "@/types/MerchPage";
interface MerchCardProps {
  item: MerchItem;
}

const MerchCard: React.FC<MerchCardProps> = ({ item }) => {
  return (
    <motion.div
      whileHover={{
        scale: 1.05,
        boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
      }}
      className="bg-gray-800 rounded-xl overflow-hidden border-2 border-gray-700 transform transition-all"
    >
      <div className="relative">
        <motion.img
          src={item.image}
          alt={item.name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full h-80 object-cover filter brightness-90 hover:brightness-110 transition-all"
        />
        <div className="absolute top-4 right-4 flex space-x-2">
          {item.crypto && (
            <span className="bg-blue-600/70 text-white text-xs px-2 py-1 rounded">
              Crypto
            </span>
          )}
          {item.ogPoints && (
            <span className="bg-green-600/70 text-white text-xs px-2 py-1 rounded">
              OG Points
            </span>
          )}
          {item.debitCard && (
            <span className="bg-purple-600/70 text-white text-xs px-2 py-1 rounded">
              Debit
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        <h2 className="text-2xl font-bold mb-2 text-gray-100">{item.name}</h2>
        <p className="text-gray-400 mb-4 text-sm">{item.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-gray-100">
            ${item.price.toFixed(2)}
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Add to Cart
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default MerchCard;
