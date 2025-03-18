// components/BladesLayout.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function BladesLayout({ children }: any) {
  const router = useRouter();
  const [activeBlade, setActiveBlade] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Define your existing pages as blades
  const blades = [
    {
      id: "marketplace",
      path: "/marketplace",
      title: "marketplace",
      color: "#9370DB",
    }, // Purple
    { id: "media", path: "/media", title: "media", color: "#1E90FF" }, // Blue
    { id: "games", path: "/games", title: "games", color: "#32CD32" }, // Green
    {
      id: "xbox-live",
      path: "/xbox-live",
      title: "xbox live",
      color: "#FF8C00",
    }, // Orange
    // Add all your other pages here
  ];

  // Determine active blade based on current route
  useEffect(() => {
    const path = router.pathname;
    const currentBlade = blades.find((blade) => blade.path === path);

    if (currentBlade) {
      setActiveBlade(currentBlade.id);
    } else {
      // Default blade if on a page not in the list
      setActiveBlade(blades[0].id);
    }
  }, [router.pathname]);

  // Handle blade navigation with animation
  const handleBladeChange = (bladeId:any) => {
    const targetBlade = blades.find((blade) => blade.id === bladeId);
    if (targetBlade && targetBlade.id !== activeBlade) {
      setIsTransitioning(true);

      // Play sound effect
      const sound = new Audio("/sounds/blade-transition.mp3"); // You'll need to add this sound file
      sound.play().catch((e) => console.log("Sound play error:", e));

      // Navigate to the page
      router.push(targetBlade.path);

      // Reset transition state after animation completes
      setTimeout(() => {
        setIsTransitioning(false);
      }, 600);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden flex">
      {/* Blades sidebar */}
      <div className="relative h-screen z-10" style={{ width: "200px" }}>
        {blades.map((blade, index) => {
          const isActive = blade.id === activeBlade;
          const bladeIndex = blades.findIndex((b) => b.id === blade.id);
          const activeIndex = blades.findIndex((b) => b.id === activeBlade);

          // Calculate position for stacked appearance
          const baseOffset = 50; // Base offset for all blades
          const stackOffset = bladeIndex * 15; // Stack offset based on position
          const activeOffset = isActive
            ? 0
            : bladeIndex < activeIndex
            ? -10
            : 30;

          return (
            <div
              key={blade.id}
              className={`absolute left-0 h-screen transform transition-all duration-500 cursor-pointer
                         ${
                           isActive
                             ? "z-10"
                             : "z-" + (10 - Math.abs(bladeIndex - activeIndex))
                         }`}
              style={{
                width: "200px",
                top: `${baseOffset + stackOffset + activeOffset}px`,
                transformOrigin: "left center",
                transform: `translateY(${
                  isActive ? 0 : bladeIndex < activeIndex ? "-40px" : "40px"
                }) 
                           translateX(${isActive ? "0" : "-140px"})`,
                background: `linear-gradient(90deg, ${blade.color} 0%, #2a2a2a 80%)`,
                borderTopRightRadius: "10px",
                borderBottomRightRadius: "10px",
                boxShadow: "2px 4px 8px rgba(0, 0, 0, 0.3)",
                opacity: isActive ? 1 : 0.9,
              }}
              onClick={() => handleBladeChange(blade.id)}
            >
              <div className="h-full flex items-center p-4">
                <span
                  className="text-xl font-bold transform rotate-90 uppercase tracking-wider whitespace-nowrap"
                  style={{ position: "absolute", left: "40px", bottom: "80px" }}
                >
                  {blade.title}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main content area */}
      <div
        className={`flex-1 h-screen transition-all duration-500 
                      ${
                        isTransitioning
                          ? "opacity-0 translate-x-20"
                          : "opacity-100"
                      }`}
      >
        <div className="p-8 h-full overflow-auto">{children}</div>
      </div>

      {/* Xbox guide button */}
      <div className="fixed bottom-8 left-8 z-50">
        <button
          className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center 
                   hover:bg-gray-700 focus:outline-none shadow-lg"
          onClick={() => router.push("/")}
        >
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
            <span className="text-2xl font-bold">X</span>
          </div>
        </button>
      </div>
    </div>
  );
}
