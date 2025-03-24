//components/AuthForm.tsx
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useConnectModal } from "@rainbow-me/rainbowkit";

interface AuthFormProps {
  onClose?: () => void;
}

interface FormState {
  email: string;
  password: string;
  username: string;
  role: "player" | "partner";
  twitter_username: string;
}

export default function AuthForm({ onClose }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [formState, setFormState] = useState<FormState>({
    email: "",
    password: "",
    username: "",
    role: "player",
    twitter_username: "",
  });
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
        if (!isConnected || !address) {
          throw new Error("Please connect your wallet first");
        }

        // First create the auth user
        const { data: authData, error: signUpError } =
          await supabase.auth.signUp({
            email: formState.email,
            password: formState.password,
            options: {
              data: {
                username: formState.username,
                role: formState.role,
              },
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          });

        if (signUpError) throw signUpError;
        if (!authData.user) throw new Error("Signup failed");

        // Wait for a short time to ensure the user is created in the database
        await new Promise((resolve) => setTimeout(resolve, 1000));

        try {
          // Create user profile
          const { error: profileError } = await supabase
            .from("user_profiles")
            .insert({
              id: authData.user.id,
              username: formState.username,
              email: formState.email,
              role: formState.role,
              coins: 0,
              gems: 0,
              wallet_address: address,
              twitter_username: formState.twitter_username,
            });

          if (profileError) {
            console.error("Profile creation error:", profileError);
            throw profileError;
          }

          // Show confirmation message
          setConfirmationEmail(formState.email);
          setShowConfirmation(true);
        } catch (err) {
          console.error("Profile creation error:", err);
          // Clean up auth user if profile creation fails
          await supabase.auth.signOut();
          throw new Error("Failed to create profile. Please try again.");
        }
      } else {
        // Handle sign in
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: formState.email,
            password: formState.password,
          });

        if (signInError) {
          if (signInError.message.includes("Email not confirmed")) {
            setConfirmationEmail(formState.email);
            setShowConfirmation(true);
            throw new Error(
              "Please check your email to confirm your account before signing in."
            );
          }
          throw signInError;
        }

        if (data?.user) {
          const { data: profile, error: profileError } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();

          if (profileError) {
            console.error("Profile fetch error:", profileError);
            throw new Error("Error loading user profile");
          }

          onClose?.();
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
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
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (showConfirmation) {
    return (
      <div className="text-center">
        <div className="mb-3">
          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg
              className="w-5 h-5 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white mb-2">
            Check Your Email
          </h2>
          <p className="text-gray-400 mb-3">
            We've sent a verification link to <br />
            <span className="font-medium text-white">{confirmationEmail}</span>
          </p>
          <p className="text-sm text-gray-500 mb-3">
            Please click the link in the email to verify your account.
          </p>
          <button
            onClick={() => {
              setShowConfirmation(false);
              setFormState({
                email: "",
                password: "",
                username: "",
                role: "player",
                twitter_username: "",
              });
            }}
            className="text-red-400 hover:text-red-300 font-medium transition-colors"
          >
            Back to {mode === "signin" ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4 text-center">
        {mode === "signin" ? "Welcome Back" : "Create Your Account"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-2.5">
        {mode === "signup" && (
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Username
              </label>
              <input
                type="text"
                required
                value={formState.username}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
                className="w-full px-3 py-1.5 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-white placeholder-gray-400 transition-colors"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Twitter Handle
              </label>
              <input
                type="text"
                value={formState.twitter_username}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    twitter_username: e.target.value,
                  }))
                }
                className="w-full px-3 py-1.5 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-white placeholder-gray-400 transition-colors"
                placeholder="@username (optional)"
              />
            </div>
          </div>
        )}

        {mode === "signup" && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Connect Wallet
            </label>
            {!isConnected ? (
              <button
                type="button"
                onClick={openConnectModal}
                className="w-full px-3 py-1.5 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Connect Wallet
              </button>
            ) : (
              <div className="w-full px-3 py-1.5 text-white border border-gray-700 rounded-lg bg-gray-800/50 flex items-center justify-between">
                <span className="font-mono text-sm">
                  {address
                    ? `${address.slice(0, 6)}...${address.slice(-4)}`
                    : ""}
                </span>
                <button
                  type="button"
                  onClick={openConnectModal}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Change
                </button>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={formState.email}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full px-3 py-1.5 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-white placeholder-gray-400 transition-colors"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={formState.password}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, password: e.target.value }))
              }
              className="w-full px-3 py-1.5 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-white placeholder-gray-400 transition-colors"
              placeholder="Enter your password"
            />
          </div>
        </div>

        {mode === "signup" && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              I am a:
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setFormState((prev) => ({ ...prev, role: "player" }))
                }
                className={`flex-1 px-3 py-1.5 rounded-lg text-center font-medium focus:outline-none transition-all duration-200 ${
                  formState.role === "player"
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                    : "bg-gray-800/50 text-gray-400 border border-gray-700 hover:bg-gray-800"
                }`}
              >
                Player
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormState((prev) => ({ ...prev, role: "partner" }))
                }
                className={`flex-1 px-3 py-1.5 rounded-lg text-center font-medium focus:outline-none transition-all duration-200 ${
                  formState.role === "partner"
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                    : "bg-gray-800/50 text-gray-400 border border-gray-700 hover:bg-gray-800"
                }`}
              >
                Partner
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="text-red-400 text-sm font-medium text-center bg-red-500/10 py-1 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <button
            type="submit"
            disabled={isLoading || (mode === "signup" && !isConnected)}
            className="w-full bg-red-500 text-white py-1.5 px-4 rounded-lg font-medium hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-red-500/20"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : mode === "signin" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
            }}
            className="w-full text-sm text-gray-400 hover:text-white font-medium py-1 transition-colors"
          >
            {mode === "signin"
              ? "Need an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900 text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 border border-gray-700 rounded-lg text-sm font-medium text-white bg-gray-800/50 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-900 transition-colors"
        >
          <svg
            className="w-4 h-4"
            aria-hidden="true"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
          </svg>
          Continue with Google
        </button>
      </form>
    </div>
  );
}
