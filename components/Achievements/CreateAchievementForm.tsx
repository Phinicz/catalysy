import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { createNewAchievementNotification } from "@/utils/notifications";

interface CreateAchievementFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateAchievementForm({
  isOpen,
  onClose,
  onSuccess,
}: CreateAchievementFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setError("");

    try {
      // Step 1: Create achievement
      console.log("[Debug Step 1] Creating achievement...");
      const { data: achievementData, error: achievementError } = await supabase
        .from("tasks")
        .insert({
          ...formData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (achievementError) {
        console.error(
          "[Debug Step 1] Error creating achievement:",
          achievementError
        );
        throw achievementError;
      }
      console.log(
        "[Debug Step 1] Achievement created successfully:",
        achievementData
      );

      // Step 2: Get all users to notify
      console.log("[Debug Step 2] Fetching users for notifications...");
      const { data: users, error: usersError } = await supabase
        .from("user_profiles")
        .select("id");

      if (usersError) {
        console.error("[Debug Step 2] Error fetching users:", usersError);
        // Don't throw here - we still want to close modal even if notifications fail
      } else if (users) {
        // Step 3: Send notifications to all users
        console.log("[Debug Step 3] Sending notifications to users...");
        for (const user of users) {
          try {
            await createNewAchievementNotification(
              user.id,
              formData.title,
              formData.points,
              formData.gameName
            );
            console.log(`[Debug Step 3] Notification sent to user ${user.id}`);
          } catch (notifError) {
            console.error(
              `[Debug Step 3] Error sending notification to user ${user.id}:`,
              notifError
            );
          }
        }
      }

      onClose(); // Close the modal on success
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating achievement:", error);
      setError("Failed to create achievement");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            Create New Achievement
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
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
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="points"
                    className="block text-sm font-medium text-gray-300"
                  >
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
                    className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="steps"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Steps Required
                  </label>
                  <input
                    type="number"
                    id="steps"
                    name="steps"
                    required
                    min="1"
                    value={formData.steps}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Game Information */}
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="gameName"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Game Name
                  </label>
                  <input
                    type="text"
                    id="gameName"
                    name="gameName"
                    required
                    value={formData.gameName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="gameIcon"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Game Icon URL
                  </label>
                  <input
                    type="url"
                    id="gameIcon"
                    name="gameIcon"
                    required
                    value={formData.gameIcon}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="imageUrl"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Achievement Image URL
                  </label>
                  <input
                    type="url"
                    id="imageUrl"
                    name="imageUrl"
                    required
                    value={formData.imageUrl}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="gameDeeplink"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Game Deeplink
                  </label>
                  <input
                    type="url"
                    id="gameDeeplink"
                    name="gameDeeplink"
                    required
                    value={formData.gameDeeplink}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Dates and Rule ID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-gray-300"
                >
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  id="startDate"
                  name="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-gray-300"
                >
                  End Date
                </label>
                <input
                  type="datetime-local"
                  id="endDate"
                  name="endDate"
                  required
                  value={formData.endDate}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="rule_id"
                  className="block text-sm font-medium text-gray-300"
                >
                  Rule ID
                </label>
                <input
                  type="text"
                  id="rule_id"
                  name="rule_id"
                  required
                  value={formData.rule_id}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Achievement"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
