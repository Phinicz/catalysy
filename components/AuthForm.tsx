//components/AuthForm.tsx
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [formState, setFormState] = useState<FormState>({
    email: "",
    password: "",
    username: "",
    role: "player",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
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
            });

          if (profileError) throw profileError;

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
      <div className="bg-white rounded-lg p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Verify Your Email
          </h2>
          <p className="text-gray-600 mb-6">
            We've sent a verification link to <br />
            <span className="font-medium">{confirmationEmail}</span>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Please click the link in the email to verify your account. Check
            your spam folder if you don't see it.
          </p>
          <button
            onClick={() => {
              setShowConfirmation(false);
              setFormState({
                email: "",
                password: "",
                username: "",
                role: "player",
              });
            }}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Back to {mode === "signin" ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black rounded-lg p-8">
      <h2 className="text-2xl font-bold text-white mb-6">
        {mode === "signin" ? "Sign In" : "Create Account"}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 w-full max-w-md mx-auto p-4"
      >
        {mode === "signup" && (
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">
              Username
            </label>
            <input
              type="text"
              required
              value={formState.username}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, username: e.target.value }))
              }
              className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-700 text-base"
              placeholder="Choose a username"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-white mb-1.5">
            Email
          </label>
          <input
            type="email"
            required
            value={formState.email}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, email: e.target.value }))
            }
            className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1.5">
            Password
          </label>
          <input
            type="password"
            required
            value={formState.password}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, password: e.target.value }))
            }
            className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-700 text-base"
            placeholder="Enter your password"
          />
        </div>

        {mode === "signup" && (
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">
              I am a:
            </label>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() =>
                  setFormState((prev) => ({ ...prev, role: "player" }))
                }
                className={`flex-1 px-3 py-2 rounded-lg text-center font-medium focus:outline-none transition-colors ${
                  formState.role === "player"
                    ? "bg-red-600 text-white"
                    : "bg-white text-black border border-white"
                }`}
              >
                Player
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormState((prev) => ({ ...prev, role: "partner" }))
                }
                className={`flex-1 px-3 py-2 rounded-lg text-center font-medium focus:outline-none transition-colors ${
                  formState.role === "partner"
                    ? "bg-red-600 text-white"
                    : "bg-white text-black border border-white"
                }`}
              >
                Partner
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="text-red-600 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-red-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 disabled:opacity-50 transition-colors text-base"
        >
          {isLoading
            ? "Processing..."
            : mode === "signin"
            ? "Sign In"
            : "Create Account"}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
          }}
          className="w-full text-sm text-white hover:text-white/50 font-medium py-2"
        >
          {mode === "signin"
            ? "Need an account? Sign up"
            : "Already have an account? Sign in"}
        </button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-red-500 rounded-sm text-white">
              Or continue with
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-700 transition-opacity"
        >
          <svg
            className="w-5 h-5"
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
