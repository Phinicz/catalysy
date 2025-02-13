import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { BellRing, Menu, X } from "lucide-react";
import AuthModal from "./AuthModal";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { CustomWalletConnect } from "./CustomWalletConnect";
import { useApi } from "@/context/ApiContext";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: "player" | "partner";
  coins: number;
  gems: number;
  profile_picture: string | null;
}

export default function Navbar() {
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  

  const navigation = [
    { name: "Player Stats", path: "/stats" },
    { name: "Achievements", path: "/achievements" },
    { name: "Rewards", path: "/rewards" },
    { name: "Subscriptions", path: "/subscriptions" },
    ...(profile?.role === "partner"
      ? [{ name: "Challenge", path: "/challenge" }]
      : []),
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  return (
    <nav
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-red-500/80 backdrop-blur-md shadow-lg" : "bg-red-500"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Image
              src="/brand/logo.png"
              alt="Logo"
              width={180}
              height={180}
              className="mr-2 transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-red-200"
            >
              {isMenuOpen ? (
                <X className="w-8 h-8" />
              ) : (
                <Menu className="w-8 h-8" />
              )}
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {profile ? (
              <>
                {navigation.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`text-sm font-medium transition-colors duration-200 ${
                      router.pathname === item.path
                        ? "text-red-200"
                        : "text-white hover:text-red-200"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="flex items-center space-x-4 relative">
                  <CustomWalletConnect />
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="text-white hover:text-red-200"
                  >
                    <BellRing className="w-6 h-6" />
                  </button>

                  {/* Profile Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="flex items-center"
                    >
                      {profile.profile_picture ? (
                        <Image
                          src={profile.profile_picture}
                          alt={profile.username}
                          width={40}
                          height={40}
                          className="rounded-full ring-2 ring-red-500"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
                          {profile.username[0].toUpperCase()}
                        </div>
                      )}
                    </button>

                    {isProfileMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 transition-colors"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Profile Settings
                        </Link>
                        <Link
                          href="/teammember"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 transition-colors"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Team Member
                        </Link>
                        <button
                          onClick={async () => {
                            await supabase.auth.signOut();
                            setIsProfileMenuOpen(false);
                            router.push("/");
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 bg-black text-white rounded-full hover:bg-red-600 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Slide-out Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 md:hidden">
          <div className="px-4 pt-16">
            <div className="flex flex-col space-y-6">
              {profile ? (
                <>
                  {navigation.map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`text-lg font-medium text-center py-3 ${
                        router.pathname === item.path
                          ? "text-red-200 bg-black/20"
                          : "text-white hover:bg-black/10"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="flex justify-center space-x-4 py-6">
                    <CustomWalletConnect />
                    <button
                      onClick={() =>
                        setIsNotificationsOpen(!isNotificationsOpen)
                      }
                      className="text-white hover:text-red-200"
                    >
                      <BellRing className="w-8 h-8" />
                    </button>
                  </div>
                  <div className="text-center py-6">
                    <div className="inline-block">
                      {profile.profile_picture ? (
                        <Image
                          src={profile.profile_picture}
                          alt={profile.username}
                          width={80}
                          height={80}
                          className="rounded-full ring-4 ring-red-500"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center text-3xl">
                          {profile.username[0].toUpperCase()}
                        </div>
                      )}
                      <p className="text-white mt-4">{profile.username}</p>
                      <p className="text-red-200">{profile.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut();
                      setIsMenuOpen(false);
                      router.push("/");
                    }}
                    className="w-full py-2 rounded-lg bg-red-500 text-white hover:bg-red-800 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full py-4 bg-black text-white hover:bg-red-800 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-red-200"
          >
            <X className="w-8 h-8" />
          </button>
        </div>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </nav>
  );
}
