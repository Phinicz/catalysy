import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import UsernameSetupModal from "./UsernameSetupModal";

interface AuthFormProps {
  onClose?: () => void;
}

interface FormState {
  email: string;
  password: string;
  username: string;
  role: "player" | "partner";
}

export default function AuthForm({ onClose }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  const [formState, setFormState] = useState<FormState>({
    email: "",
    password: "",
    username: "",
    role: "player",
  });

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        if (session.user.app_metadata.provider === "google") {
          const { data: profile, error } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (error || !profile) {
            setPendingEmail(session.user.email!);
            setShowUsernameModal(true);
          } else {
            onClose?.();
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formState.email,
          password: formState.password,
          options: {
            data: {
              username: formState.username,
              role: formState.role,
            },
          },
        });

        if (signUpError) throw signUpError;

        const { error: profileError } = await supabase
          .from("user_profiles")
          .insert([
            {
              id: data.user?.id,
              username: formState.username,
              email: formState.email,
              role: formState.role,
              coins: 0,
              gems: 0,
            },
          ]);

        if (profileError) throw profileError;
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formState.email,
          password: formState.password,
        });

        if (signInError) throw signInError;
      }

      onClose?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white rounded-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {mode === "signin" ? "Sign In" : "Create Account"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {mode === "signup" && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Username
            </label>
            <input
              type="text"
              required
              value={formState.username}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, username: e.target.value }))
              }
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Choose a username"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Email
          </label>
          <input
            type="email"
            required
            value={formState.email}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, email: e.target.value }))
            }
            className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Password
          </label>
          <input
            type="password"
            required
            value={formState.password}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, password: e.target.value }))
            }
            className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your password"
          />
        </div>

        {mode === "signup" && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              I am a:
            </label>
            <select
              value={formState.role}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  role: e.target.value as "player" | "partner",
                }))
              }
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="player">Player</option>
              <option value="partner">Partner</option>
            </select>
          </div>
        )}

        {error && (
          <div className="text-red-600 text-sm font-medium">{error}</div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading
            ? "Processing..."
            : mode === "signin"
            ? "Sign In"
            : "Create Account"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {mode === "signin"
            ? "Need an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
              />
            </svg>
            Continue with Google
          </button>
        </div>
      </div>

      {showUsernameModal && (
        <UsernameSetupModal
          isOpen={showUsernameModal}
          onClose={() => {
            setShowUsernameModal(false);
            onClose?.();
          }}
          email={pendingEmail}
        />
      )}
    </div>
  );
}
