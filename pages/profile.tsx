import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Image from "next/image";
import ImageUpload from "../components/ImageUpload";

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
        window.location.href = "/"; // Redirect if not logged in
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          {!isEditing ? (
            // View Mode
            <div className="space-y-6">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  {profile.profile_picture ? (
                    <img
                      src={profile.profile_picture}
                      alt={profile.username}
                      className="h-32 w-32 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-2xl font-medium text-gray-500">
                        {profile.username[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {profile.username}
                      </h1>
                      <p className="text-sm text-gray-500">{profile.email}</p>
                      <span className="mt-1 inline-block px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                        {profile.role}
                      </span>
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Edit Profile
                    </button>
                  </div>

                  <div className="mt-4">
                    <h3 className="font-medium text-gray-900">Bio</h3>
                    <p className="mt-1 text-gray-600">
                      {profile.bio || "No bio yet"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-blue-900 font-medium">Coins</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {profile.coins}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-purple-900 font-medium">Gems</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {profile.gems}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Edit Mode
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture
                </label>
                <ImageUpload
                  currentImage={profile.profile_picture}
                  onUploadComplete={(url) => {
                    setEditForm((prev) => ({ ...prev, profile_picture: url }));
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
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
