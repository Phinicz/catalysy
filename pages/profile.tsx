import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import ImageUpload from "../components/ImageUpload";
import { useAccount } from "wagmi";
import { Copy } from "lucide-react";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: "player" | "partner";
  profile_picture: string | null;
  bio: string | null;
  coins: number;
  gems: number;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { address, isConnected } = useAccount();
  const [editForm, setEditForm] = useState({
    username: "",
    bio: "",
    profile_picture: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        window.location.href = "/";
        return;
      }
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      if (error) throw error;
      setProfile(data);
      setEditForm({
        username: data.username,
        bio: data.bio || "",
        profile_picture: data.profile_picture || "",
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (addr: string | undefined) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;
      const updates = {
        username: editForm.username,
        bio: editForm.bio || null,
        profile_picture: editForm.profile_picture || null,
      };
      const { error } = await supabase
        .from("user_profiles")
        .update(updates)
        .eq("id", session.user.id);
      if (error) throw error;
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-red-500 text-xl">
        Loading...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-red-500 text-xl">
        Profile not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-20 flex justify-center items-center">
      <div className="max-w-3xl w-full px-4">
        <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-red-500 relative">
          {!isEditing ? (
            <div className="space-y-6 text-white">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 border-4 border-red-500 rounded-full overflow-hidden">
                  {profile.profile_picture ? (
                    <img
                      src={profile.profile_picture}
                      alt={profile.username}
                      className="h-32 w-32 object-cover"
                    />
                  ) : (
                    <div className="h-32 w-32 bg-gray-700 flex items-center justify-center text-3xl text-red-500 font-bold">
                      {profile.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-red-500">
                        {profile.username}
                      </h1>
                      <p className="text-sm text-gray-400">{profile.email}</p>
                      <span className="mt-1 inline-block px-3 py-1 text-xs font-medium bg-red-500 text-white rounded-full uppercase">
                        {profile.role}
                      </span>
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-red-600 px-4 py-2 rounded-lg text-white font-bold hover:bg-red-700 transition"
                    >
                      Edit Profile
                    </button>
                  </div>
                  <div className="mt-4">
                    <h3 className="font-medium text-red-500">Bio</h3>
                    <p className="mt-1 text-gray-300">
                      {profile.bio || "No bio yet"}
                    </p>
                  </div>
                  <div className="mt-4">
                    <h3 className="font-medium text-red-500">Wallet</h3>
                    {isConnected ? (
                      <div className="mt-1 flex items-center space-x-2">
                        <p className="text-gray-300 font-mono">
                          {formatAddress(address)}
                        </p>
                        <button
                          onClick={copyAddress}
                          className="p-1 hover:bg-gray-800 rounded-full transition-colors"
                          title="Copy address"
                        >
                          <Copy className="w-4 h-4 text-gray-400" />
                        </button>
                        {copied && (
                          <span className="text-sm text-green-500">
                            Copied!
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="mt-1 text-gray-500">No wallet connected</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-red-500 pt-6">
                <div className="bg-gray-800 p-4 rounded-lg text-center border border-red-500">
                  <h3 className="text-red-500 font-medium">Coins</h3>
                  <p className="text-2xl font-bold text-white">
                    {profile.coins}
                  </p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center border border-red-500">
                  <h3 className="text-red-500 font-medium">Gems</h3>
                  <p className="text-2xl font-bold text-white">
                    {profile.gems}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleUpdateProfile}
              className="space-y-6 text-white"
            >
              <div>
                <label className="block text-sm font-medium text-red-500 mb-2">
                  Profile Picture
                </label>
                <ImageUpload
                  currentImage={profile.profile_picture}
                  onUploadComplete={(url) =>
                    setEditForm((prev) => ({ ...prev, profile_picture: url }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-red-500 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-red-500 bg-black text-white rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-red-500 mb-2">
                  Bio
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-red-500 bg-black text-white rounded-lg"
                ></textarea>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
