import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ShoppingCart, Loader2 } from "lucide-react";
import { MerchItem } from "@/types/MerchPage";
import PaymentModal from "./PaymentModal";
import { supabase } from "@/lib/supabase";

interface MerchCardProps {
  item: MerchItem;
  onOGPointsUpdate?: (newPoints: number) => void;
}

const MerchCard: React.FC<MerchCardProps> = ({ item, onOGPointsUpdate }) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [userOGPoints, setUserOGPoints] = useState<number>(0);
  const [isLoadingPoints, setIsLoadingPoints] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const fetchUserOGPoints = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("OG_Points")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserOGPoints(profile.OG_Points);
      }
    } catch (error) {
      console.error("Error fetching OG Points:", error);
    } finally {
      setIsLoadingPoints(false);
    }
  };

  useEffect(() => {
    fetchUserOGPoints();
  }, []);

  const handleBuyNow = async () => {
    if (item.isPurchased) {
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const handleOGPointsUpdate = (newPoints: number) => {
    setUserOGPoints(newPoints);
    if (onOGPointsUpdate) {
      onOGPointsUpdate(newPoints);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{
          scale: 1.02,
          boxShadow: "0 20px 30px rgba(0,0,0,0.3)",
        }}
        className={`relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden border border-gray-700 transform transition-all duration-300 h-full flex flex-col ${
          item.isPurchased ? "opacity-75" : ""
        }`}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {item.isPurchased && (
          <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
            <div className="bg-green-600/80 text-white px-4 py-2 rounded-lg font-medium">
              Already Purchased
            </div>
          </div>
        )}
        <div className="relative group w-full">
          <motion.div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <motion.img
            src={item.image}
            alt={item.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full h-48 object-cover transform transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {item.crypto && (
              <motion.span
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-lg backdrop-blur-sm"
              >
                Crypto
              </motion.span>
            )}
            {item.ogPoints && (
              <motion.span
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-purple-600 to-purple-500 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-lg backdrop-blur-sm"
              >
                OG Points
              </motion.span>
            )}
            {item.debitCard && (
              <motion.span
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-lg backdrop-blur-sm"
              >
                Card
              </motion.span>
            )}
          </div>
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-bold mb-2 text-white tracking-tight line-clamp-1"
          >
            {item.name}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-4"
          >
            {item.description}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-between mt-auto"
          >
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white">
                ${item.price.toFixed(2)}
              </span>
              {item.ogPoints && (
                <span className="text-sm text-purple-400 flex items-center gap-1 mt-0.5">
                  <Star className="w-4 h-4" />
                  {item.price_og_points} OG Points
                </span>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBuyNow}
              disabled={item.isPurchased}
              className={`${
                item.isPurchased
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              } text-white px-4 py-2 rounded-lg font-medium shadow-lg transition-all duration-300 flex items-center gap-2 text-sm whitespace-nowrap`}
            >
              <ShoppingCart className="w-4 h-4" />
              {item.isPurchased ? "Purchased" : "Buy Now"}
            </motion.button>
          </motion.div>
        </div>

        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: isHovered
              ? "linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.1) 50%, transparent 55%)"
              : "none",
            backgroundSize: "200% 200%",
            backgroundPosition: isHovered ? "100% 100%" : "0% 0%",
          }}
          transition={{ duration: 0.6 }}
        />
      </motion.div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        item={item}
        userOGPoints={userOGPoints}
        onOGPointsUpdate={handleOGPointsUpdate}
        isPurchased={item.isPurchased}
      />
    </>
  );
};

export default MerchCard;
