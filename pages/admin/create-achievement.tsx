import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

// This should be stored in environment variables in a real application
const ADMIN_PASSWORD = "admin123";

export default function CreateAchievementPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    gameIcon: "",
    gameName: "",
    gameDeeplink: "",
    points: 0,
    startDate: "",
    endDate: "",
    steps: 1,
    rule_id: "",
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Invalid password");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "points" || name === "steps" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          ...formData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      router.push("/achievements");
    } catch (error) {
      console.error("Error creating achievement:", error);
      setError("Failed to create achievement");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-lg bg-white/10 rounded-2xl p-8 shadow-2xl border border-white/20"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Admin Access
              </h2>
              <p className="mt-2 text-gray-400">Enter password to continue</p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handlePasswordSubmit}>
              <div className="relative group">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full px-4 py-3 rounded-xl bg-gray-800/50 border-2 border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-white/20"
                  placeholder="Admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm text-center"
                >
                  {error}
                </motion.p>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3 px-4 rounded-xl font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-all duration-200"
              >
                Access Admin Panel
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Create Achievement
              </h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => router.push("/achievements")}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div className="relative group">
                    <label className="block text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 rounded-xl bg-gray-800/50 border-2 border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-white/20"
                    />
                  </div>

                  <div className="relative group">
                    <label className="block text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      required
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="block w-full px-4 py-3 rounded-xl bg-gray-800/50 border-2 border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-white/20 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative group">
                      <label className="block text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                        Points
                      </label>
                      <input
                        type="number"
                        id="points"
                        name="points"
                        required
                        min="0"
                        value={formData.points}
                        onChange={handleChange}
                        className="block w-full px-4 py-3 rounded-xl bg-gray-800/50 border-2 border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-white/20"
                      />
                    </div>

                    <div className="relative group">
                      <label className="block text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                        Steps
                      </label>
                      <input
                        type="number"
                        id="steps"
                        name="steps"
                        required
                        min="1"
                        value={formData.steps}
                        onChange={handleChange}
                        className="block w-full px-4 py-3 rounded-xl bg-gray-800/50 border-2 border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-white/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Game Information */}
                <div className="space-y-6">
                  <div className="relative group">
                    <label className="block text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                      Game Name
                    </label>
                    <input
                      type="text"
                      id="gameName"
                      name="gameName"
                      required
                      value={formData.gameName}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 rounded-xl bg-gray-800/50 border-2 border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-white/20"
                    />
                  </div>

                  <div className="relative group">
                    <label className="block text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                      Game Icon URL
                    </label>
                    <input
                      type="url"
                      id="gameIcon"
                      name="gameIcon"
                      required
                      value={formData.gameIcon}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 rounded-xl bg-gray-800/50 border-2 border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-white/20"
                    />
                  </div>

                  <div className="relative group">
                    <label className="block text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                      Achievement Image URL
                    </label>
                    <input
                      type="url"
                      id="imageUrl"
                      name="imageUrl"
                      required
                      value={formData.imageUrl}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 rounded-xl bg-gray-800/50 border-2 border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-white/20"
                    />
                  </div>

                  <div className="relative group">
                    <label className="block text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                      Game Deeplink
                    </label>
                    <input
                      type="url"
                      id="gameDeeplink"
                      name="gameDeeplink"
                      required
                      value={formData.gameDeeplink}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 rounded-xl bg-gray-800/50 border-2 border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-white/20"
                    />
                  </div>
                </div>
              </div>

              {/* Dates and Rule ID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative group">
                  <label className="block text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    id="startDate"
                    name="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 rounded-xl bg-gray-800/50 border-2 border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-white/20"
                  />
                </div>

                <div className="relative group">
                  <label className="block text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    id="endDate"
                    name="endDate"
                    required
                    value={formData.endDate}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 rounded-xl bg-gray-800/50 border-2 border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-white/20"
                  />
                </div>

                <div className="relative group">
                  <label className="block text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                    Rule ID
                  </label>
                  <input
                    type="text"
                    id="rule_id"
                    name="rule_id"
                    required
                    value={formData.rule_id}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 rounded-xl bg-gray-800/50 border-2 border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-white/20"
                  />
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm text-center"
                >
                  {error}
                </motion.p>
              )}

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => router.push("/achievements")}
                  className="px-6 py-3 text-sm font-medium text-gray-300 hover:text-white bg-gray-800/50 rounded-xl hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-all duration-200"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? "Creating..." : "Create Achievement"}
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
