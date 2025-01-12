import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import AuthModal from "./AuthModal";
import { BellRing } from "lucide-react";

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

  const navigation = [
    { name: "Player Stats", path: "/stats" },
    { name: "Achievements", path: "/achievements" },
    { name: "Rewards", path: "/rewards" },
  ];

  const isGamePath = navigation.some((item) => item.path === router.pathname);

  useEffect(() => {
    fetchProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });

    return () => {
      subscription.unsubscribe();
    };
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
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-900">GameBoost</span>
            </Link>

            {profile && (
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium
                      ${
                        router.pathname === item.path
                          ? "border-indigo-500 text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-4">
            {profile ? (
              <>
                {/* Profile Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-2"
                  >
                    {profile.profile_picture ? (
                      <Image
                        src={profile.profile_picture}
                        alt={profile.username}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-white">
                          {profile.username[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="hidden md:block">
                      <p className="text-sm font-medium text-gray-900">
                        {profile.username}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-600">
                          {profile.coins} Coins
                        </span>
                        <span className="text-xs text-purple-600">
                          {profile.gems} Gems
                        </span>
                      </div>
                    </div>
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                      {/* Show coins/gems on mobile */}
                      <div className="md:hidden px-4 py-2 border-b border-gray-100">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Coins</span>
                          <span className="text-sm text-blue-600">
                            {profile.coins}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Gems</span>
                          <span className="text-sm text-purple-600">
                            {profile.gems}
                          </span>
                        </div>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>

                {/* Notifications */}
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2 text-gray-500 hover:text-gray-700"
                >
                  <BellRing className="w-6 h-6" />
                  {/* Add notification count badge if needed */}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {profile && (
        <div className="md:hidden border-t border-gray-200">
          <div className="grid grid-cols-3 gap-1 px-2 py-3">
            {navigation.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`text-center py-2 text-sm font-medium ${
                  router.pathname === item.path
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
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
