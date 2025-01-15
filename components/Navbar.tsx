import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { BellRing, Menu, X } from "lucide-react";
import AuthModal from "./AuthModal";

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
  const [scrolled, setScrolled] = useState(false);

  const navigation = [
    { name: "Player Stats", path: "/stats" },
    { name: "Achievements", path: "/achievements" },
    { name: "Rewards", path: "/rewards" },
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
        console.log(data, "Here is the data");

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
        scrolled ? "bg-white/80 backdrop-blur-md shadow-md" : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <Image
                src="/brand/logo.png"
                alt="Logo"
                width={180}
                height={180}
                className="mr-2 transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            {profile && (
              <div className="hidden md:ml-6 md:flex md:space-x-1">
                {navigation.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200
                      ${
                        router.pathname === item.path
                          ? "text-blue-600"
                          : "text-gray-600 hover:text-blue-600"
                      }
                      group
                    `}
                  >
                    {item.name}
                    <span
                      className={`absolute bottom-0 left-0 w-full h-0.5 transform origin-left transition-transform duration-300
                      ${
                        router.pathname === item.path
                          ? "bg-blue-600 scale-x-100"
                          : "bg-blue-400 scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-4">
            {profile ? (
              <>
                {/* Currency Display */}
                <div className="hidden md:flex items-center gap-4 mr-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                    <span className="text-blue-600 font-semibold">
                      {profile.coins}
                    </span>
                    <span className="text-sm text-blue-400">Coins</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-full">
                    <span className="text-purple-600 font-semibold">
                      {profile.gems}
                    </span>
                    <span className="text-sm text-purple-400">Gems</span>
                  </div>
                </div>

                {/* Notifications */}
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                >
                  <BellRing className="w-6 h-6" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
                </button>

                {/* Profile Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-3 p-1 rounded-full hover:bg-gray-50 transition-colors duration-200"
                  >
                    {profile.profile_picture ? (
                      <Image
                        src={profile.profile_picture}
                        alt={profile.username}
                        width={40}
                        height={40}
                        className="rounded-full ring-2 ring-white"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center ring-2 ring-white">
                        <span className="text-white font-medium">
                          {profile.username[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-700">
                        {profile.username}
                      </p>
                      <p className="text-xs text-gray-500">{profile.role}</p>
                    </div>
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 ring-1 ring-black ring-opacity-5 transform opacity-100 scale-100 transition-all duration-200">
                      <div className="md:hidden px-4 py-2 border-b border-gray-100">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Coins</span>
                          <span className="text-sm font-medium text-blue-600">
                            {profile.coins}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Gems</span>
                          <span className="text-sm font-medium text-purple-600">
                            {profile.gems}
                          </span>
                        </div>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile Settings
                      </Link>
                      <button
                        onClick={async () => {
                          await supabase.auth.signOut();
                          setIsMenuOpen(false);
                          router.push("/");
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {profile && (
        <div className="md:hidden border-t border-gray-100">
          <div className="grid grid-cols-3 gap-1 px-2 py-3">
            {navigation.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`text-center py-2 text-sm font-medium rounded-md transition-colors duration-200
                  ${
                    router.pathname === item.path
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-500 hover:text-blue-600 hover:bg-gray-50"
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </nav>
  );
}
