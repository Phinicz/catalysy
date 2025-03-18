import { useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";

const blades = [
  { name: "Dashboard", route: "/" },
  { name: "Games", route: "/games" },
  { name: "Leaderboard", route: "/leaderboard" },
  { name: "Battle Pass", route: "/battle-pass" },
  { name: "Rewards", route: "/rewards" },
];

export default function XboxDashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeBlade, setActiveBlade] = useState(0);
  const router = useRouter();

  return (
    <div className="relative flex h-screen w-full bg-black">
      {/* Left Sidebar (Active Blade Name) */}
      <div className="absolute left-0 top-0 h-full w-32 flex items-center justify-center bg-gray-900 text-white text-lg font-bold rotate-180 origin-left">
        {blades[activeBlade].name.toUpperCase()}
      </div>

      {/* Blade Navigation */}
      <motion.div
        animate={{ x: -activeBlade * 100 + "vw" }}
        className="flex w-full transition-transform duration-500"
      >
        {/* Render Pages Dynamically */}
        {blades.map((blade, index) => (
          <div
            key={index}
            className="w-screen h-screen flex items-center justify-center text-white text-4xl"
          >
            {activeBlade === index ? children : null}
          </div>
        ))}
      </motion.div>

      {/* Right Blades Menu */}
      <div className="absolute right-0 top-0 h-full w-32 flex flex-col items-end justify-center">
        {blades.map((blade, index) => (
          <button
            key={index}
            onClick={() => {
              setActiveBlade(index);
              router.push(blade.route);
            }}
            className={`p-3 text-lg font-semibold transition-all ${
              activeBlade === index
                ? "text-black bg-white rounded-lg px-4"
                : "text-gray-300"
            }`}
          >
            {blade.name}
          </button>
        ))}
      </div>
    </div>
  );
}
