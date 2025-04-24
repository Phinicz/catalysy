import { useState } from "react";
import { supabase } from "../lib/supabase";

interface UsernameSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export default function UsernameSetupModal({
  isOpen,
  onClose,
  email,
}: UsernameSetupModalProps) {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<"player" | "partner">("player");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Create user profile
      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert([
          {
            id: user.id,
            username,
            email,
            role,
            coins: 0,
            points: 0,
            profile_picture: user.user_metadata.avatar_url,
          },
        ]);

      if (profileError) throw profileError;

      await supabase.auth.updateUser({
        data: { username, role },
      });

      window.location.href = "/";
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-[var(--color-overlay)]" />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          <div className="bg-surface rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Complete Your Profile
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  Choose a Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 text-text-primary bg-surface border border-[var(--color-border)] rounded-md shadow-sm
                    focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  I am a:
                </label>
                <select
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value as "player" | "partner")
                  }
                  className="mt-1 block w-full px-3 py-2 text-text-primary bg-surface border border-[var(--color-border)] rounded-md shadow-sm
                    focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="player">Player</option>
                  <option value="partner">Partner</option>
                </select>
              </div>

              {error && (
                <div className="text-[var(--color-error)] text-sm">{error}</div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium 
                  text-text-inverse bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                  disabled:opacity-50"
              >
                {isLoading ? "Setting up..." : "Complete Setup"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
