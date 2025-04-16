import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import Sidebar from "../components/Layout/Sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains";
import { createStorage } from "wagmi";
import { ApiProvider } from "../context/ApiContext";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BellRing, User, Menu, X } from "lucide-react";
import { CustomWalletConnect } from "../components/CustomWalletConnect";
import { supabase } from "../lib/supabase";
import Image from "next/image";
import Link from "next/link";
import AuthModal from "../components/AuthModal";
import Head from "next/head";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const config = getDefaultConfig({
  appName: "My RainbowKit App",
  projectId: "YOUR_PROJECT_ID",
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: true,
});

// Define blade navigation options with SVG path data for icons
const blades = [
  {
    name: "Dashboard",
    route: "/",
    svgPath:
      "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    name: "Leaderboard",
    route: "/leaderboard",
    svgPath:
      "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    name: "Rewards",
    route: "/rewards",
    svgPath: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  },
  {
    name: "Profile",
    route: "/profile",
    svgPath:
      "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  },
  {
    name: "Stats",
    route: "/stats",
    svgPath:
      "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    name: "Achievements",
    route: "/achievements",
    svgPath:
      "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
  },
  {
    name: "Lootbags",
    route: "/lootbags",
    svgPath:
      "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    name: "Merch Store",
    route: "/merchstore",
    svgPath: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
  },
  {
    name: "Rules",
    route: "/rules",
    svgPath:
      "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  },
  {
    name: "Subscriptions",
    route: "/subscriptions",
    svgPath:
      "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  },
];

// Routes that should bypass the Xbox blades layout
const bypassRoutes = ["/api", "/auth", "/register", "/feedback", "/users"];

interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: "player" | "partner";
  coins: number;
  gems: number;
  profile_picture: string | null;
}

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const queryClient = new QueryClient();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Add router event listeners for loading state
  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => {
      setTimeout(() => setIsLoading(false), 800); // Give animation time to complete
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  // Determine which layout to use based on current route
  const shouldUseStandardLayout = bypassRoutes.some((route) =>
    router.pathname.startsWith(route)
  );

  const showSidebar = ["/stats", "/achievements", "/rewards"].includes(
    router.pathname
  );

  // Find the active blade based on current route
  const [activeBlade, setActiveBlade] = useState(0);
  const [previousBlade, setPreviousBlade] = useState(0);
  const [transitionDirection, setTransitionDirection] = useState("right");

  // For circular blade navigation effect
  const [isNavigating, setIsNavigating] = useState(false);
  const [bladePositions, setBladePositions] = useState<{
    [key: number]: number;
  }>(
    blades.reduce((acc, _, index) => {
      acc[index] = index * 100;
      return acc;
    }, {} as { [key: number]: number })
  );

  // User profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Set active blade based on current route when component mounts or route changes
    const index = blades.findIndex((blade) => blade.route === router.pathname);
    if (index !== -1) {
      setActiveBlade(index);
    }
  }, [router.pathname]);

  useEffect(() => {
    fetchProfile();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error("Error:", error);
      setProfile(null);
    }
  };

  // Handle blade navigation with direction-aware transitions
  const navigateToBlade = (index: number) => {
    if (index === activeBlade || isNavigating) return;

    setIsNavigating(true);
    setPreviousBlade(activeBlade);
    setTransitionDirection(index > activeBlade ? "right" : "left");

    // Rearrange blades for smooth circular navigation
    const newPositions = { ...bladePositions };
    blades.forEach((_, i) => {
      if (i === index) {
        newPositions[i] = 0; // Center the target blade
      } else {
        const offset = i - index;
        newPositions[i] = offset * 100;
      }
    });

    setBladePositions(newPositions);
    setActiveBlade(index);

    // Allow time for animation to complete before routing
    setTimeout(() => {
      router.push(blades[index].route);
      setIsNavigating(false);
    }, 400);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (shouldUseStandardLayout) return;

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        const nextIndex = (activeBlade + 1) % blades.length;
        navigateToBlade(nextIndex);
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        const prevIndex = (activeBlade - 1 + blades.length) % blades.length;
        navigateToBlade(prevIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeBlade, shouldUseStandardLayout, isNavigating]);

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </Head>
      {/* Loading Animation */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ x: "-100vw", rotate: 0 }}
              animate={{
                x: "100vw",
                rotate: 360,
                transition: {
                  x: { duration: 1.5, ease: "easeInOut" },
                  rotate: { duration: 1.5, ease: "linear" },
                },
              }}
              exit={{ x: "100vw", opacity: 0 }}
              className="relative"
            >
              {/* Rocket */}
              <motion.div
                className="w-16 h-16 relative"
                animate={{
                  y: [-10, 10, -10],
                }}
                transition={{
                  y: {
                    duration: 0.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  },
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-full h-full text-green-500 transform -rotate-45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c1.5-1.5 1.5-3.5 0-5s-3.5-1.5-5 0z" />
                  <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                  <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                  <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                </svg>

                {/* Rocket trail */}
                <motion.div
                  className="absolute -right-8 top-1/2 flex space-x-1"
                  animate={{
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 0.3,
                    repeat: Infinity,
                  }}
                >
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-green-300"
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1, 0] }}
                      transition={{
                        duration: 0.5,
                        delay: i * 0.1,
                        repeat: Infinity,
                      }}
                    />
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <ApiProvider>
              <div className="flex flex-col h-screen w-full">
                {!shouldUseStandardLayout ? (
                  <div className="relative flex h-full w-full overflow-hidden bg-gradient-to-b from-gray-900 to-black">
                    {/* Mobile menu toggle button */}
                    <button
                      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                      className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                      {isMobileMenuOpen ? (
                        <X className="w-6 h-6" />
                      ) : (
                        <Menu className="w-6 h-6" />
                      )}
                    </button>

                    {/* Left side navigation with dynamic 3D ribbon effect */}
                    <div
                      className={`fixed md:absolute left-0 top-0 h-full flex items-center justify-start transition-transform duration-300 ease-in-out z-40 ${
                        isMobileMenuOpen
                          ? "translate-x-0"
                          : "-translate-x-full md:translate-x-0"
                      }`}
                    >
                      <div className="h-full w-64 pl-2 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-900/95 backdrop-blur-lg flex flex-col justify-between md:bg-gradient-to-r md:from-gray-900 md:to-transparent">
                        {/* Logo at the top */}
                        <div className="flex justify-center py-4">
                          <Link href="/" className="flex items-center group">
                            <Image
                              src="/brand/logo.png"
                              alt="Logo"
                              width={120}
                              height={120}
                              className="transition-transform duration-300 group-hover:scale-105"
                            />
                          </Link>
                        </div>

                        {/* Navigation buttons */}
                        <div className="flex flex-col items-start space-y-2 py-4 overflow-y-auto overflow-x-hidden max-h-[calc(100vh-200px)]">
                          {blades.map((blade, index) => {
                            const isActive = index === activeBlade;

                            return (
                              <motion.button
                                key={index}
                                onClick={() => {
                                  navigateToBlade(index);
                                  setIsMobileMenuOpen(false);
                                }}
                                className={`flex items-center justify-start py-2 pr-6 pl-4 transition-all rounded-r-lg transform relative ${
                                  isActive
                                    ? "bg-gradient-to-r from-green-600 to-green-700 text-white font-bold shadow-lg shadow-green-500/20 -translate-x-1"
                                    : "text-gray-300 hover:bg-gray-800/40 hover:text-white"
                                }`}
                                initial={false}
                                animate={{
                                  x: isActive ? -1 : 0,
                                  scale: isActive ? 1.05 : 1,
                                }}
                                whileHover={{
                                  x: isActive ? -1 : 8,
                                  backgroundColor: !isActive
                                    ? "rgba(31, 41, 55, 0.7)"
                                    : undefined,
                                }}
                                transition={{
                                  type: "spring",
                                  stiffness: 400,
                                  damping: 25,
                                }}
                              >
                                {/* SVG icon */}
                                <svg
                                  className={`w-4 h-4 mr-2 ${
                                    isActive ? "text-white" : "text-gray-400"
                                  }`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d={blade.svgPath}
                                  />
                                </svg>

                                <span className="text-sm font-medium tracking-wide">
                                  {blade.name}
                                </span>

                                {/* Active indicator */}
                                {isActive && (
                                  <motion.div
                                    layoutId="activeIndicator"
                                    className="absolute right-0 top-0 bottom-0 w-1 bg-green-400"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                  />
                                )}
                              </motion.button>
                            );
                          })}
                        </div>

                        {/* User Profile and wallet connect at the bottom */}
                        <div className="flex flex-col items-start space-y-2 mt-auto mb-4">
                          {/* Notifications button */}
                          <motion.button
                            onClick={() => {
                              setIsNotificationsOpen(!isNotificationsOpen);
                              setIsMobileMenuOpen(false);
                            }}
                            className="flex items-center justify-start py-2 pr-6 pl-4 rounded-r-lg text-gray-300 hover:bg-gray-800/40 hover:text-white w-full"
                            whileHover={{
                              x: 8,
                              backgroundColor: "rgba(31, 41, 55, 0.7)",
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 25,
                            }}
                          >
                            <BellRing className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-sm font-medium tracking-wide">
                              Notifications
                            </span>
                          </motion.button>

                          {/* Wallet Connect */}
                          <div className="flex items-center justify-start py-2 pr-6 pl-4 rounded-r-lg w-full">
                            <CustomWalletConnect />
                          </div>

                          {/* Profile button */}
                          <div className="relative w-full">
                            <motion.button
                              onClick={() => {
                                if (profile) {
                                  setIsProfileMenuOpen(!isProfileMenuOpen);
                                } else {
                                  setIsAuthModalOpen(true);
                                }
                                setIsMobileMenuOpen(false);
                              }}
                              className="flex items-center justify-start py-2 pr-6 pl-4 rounded-r-lg text-gray-300 hover:bg-gray-800/40 hover:text-white w-full"
                              whileHover={{
                                x: 8,
                                backgroundColor: "rgba(31, 41, 55, 0.7)",
                              }}
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 25,
                              }}
                            >
                              {profile ? (
                                <>
                                  {profile.profile_picture ? (
                                    <div className="w-5 h-5 rounded-full overflow-hidden border border-green-500 mr-2">
                                      <Image
                                        src={profile.profile_picture}
                                        alt={profile.username}
                                        width={20}
                                        height={20}
                                        className="object-cover w-full h-full"
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-5 h-5 rounded-full bg-green-700 text-white flex items-center justify-center border border-green-500 mr-2 text-xs">
                                      {profile.username[0].toUpperCase()}
                                    </div>
                                  )}
                                  <span className="text-sm font-medium tracking-wide">
                                    {profile.username}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <User className="w-4 h-4 mr-2 text-gray-400" />
                                  <span className="text-sm font-medium tracking-wide">
                                    Sign In
                                  </span>
                                </>
                              )}
                            </motion.button>

                            {profile && isProfileMenuOpen && (
                              <div className="absolute left-0 mt-2 bottom-10 w-48 bg-gray-800 rounded-lg shadow-lg py-1 ring-1 ring-green-500 ring-opacity-50 z-20">
                                <Link
                                  href="/profile"
                                  className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
                                  onClick={() => {
                                    setIsProfileMenuOpen(false);
                                    setIsMobileMenuOpen(false);
                                  }}
                                >
                                  Profile Settings
                                </Link>
                                <Link
                                  href="/teammember"
                                  className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
                                  onClick={() => {
                                    setIsProfileMenuOpen(false);
                                    setIsMobileMenuOpen(false);
                                  }}
                                >
                                  Team Member
                                </Link>
                                <button
                                  onClick={async () => {
                                    await supabase.auth.signOut();
                                    setIsProfileMenuOpen(false);
                                    setIsMobileMenuOpen(false);
                                    router.push("/");
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
                                >
                                  Sign Out
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Main Content Area with 3D transition effect */}
                    <div
                      ref={contentRef}
                      className="w-full h-full perspective-1000 relative z-30"
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeBlade}
                          initial={{
                            opacity: 0,
                            rotateY: transitionDirection === "right" ? 45 : -45,
                            x: transitionDirection === "right" ? 100 : -100,
                          }}
                          animate={{
                            opacity: 1,
                            rotateY: 0,
                            x: 0,
                          }}
                          exit={{
                            opacity: 0,
                            rotateY: transitionDirection === "right" ? -45 : 45,
                            x: transitionDirection === "right" ? -100 : 100,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                          }}
                          className="w-full h-full md:pl-40 pl-4 pr-4 flex items-center justify-center"
                        >
                          <div className="w-full h-full mx-auto max-w-[1300px] p-4 md:p-6">
                            <div className="w-full h-full rounded-xl overflow-hidden border border-gray-700 shadow-2xl relative">
                              {/* Green glow effect at the top */}
                              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-green-500 to-green-400 opacity-70 shadow-lg shadow-green-500/50" />

                              {/* Content container with glass morphism effect */}
                              <div className="bg-gradient-to-b from-gray-800/80 to-gray-900/80 backdrop-blur-sm w-full h-full overflow-y-auto">
                                <div className="p-4 md:p-6">
                                  <Component {...pageProps} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Dynamic "ripple" effect background elements */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute rounded-full bg-gradient-to-br from-green-500 to-green-700 opacity-0"
                          style={{
                            width: `${(i + 1) * 20}px`,
                            height: `${(i + 1) * 20}px`,
                            left: "50%",
                            top: "50%",
                            x: "-50%",
                            y: "-50%",
                          }}
                          animate={{
                            scale: [0, 5],
                            opacity: [0, 0.03, 0],
                          }}
                          transition={{
                            duration: 6,
                            repeat: Infinity,
                            delay: i * 1.2,
                            ease: "easeInOut",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full">
                    {/* Standard layout for auth, register, etc. */}
                    {showSidebar && (
                      <div className="hidden md:block h-full">
                        <Sidebar />
                      </div>
                    )}
                    {/* Main content - Full width on mobile, adjusted for sidebar on desktop */}
                    <main
                      className={`flex-1 w-full h-full overflow-y-auto ${
                        showSidebar ? "md:ml-64" : ""
                      } transition-all duration-200`}
                    >
                      <Component {...pageProps} />
                    </main>
                  </div>
                )}
              </div>
              <div id="modal-root"></div>
              <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
              />
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
              />
            </ApiProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
}

export default MyApp;
