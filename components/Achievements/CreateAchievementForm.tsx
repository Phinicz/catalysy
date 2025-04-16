import { useState } from "react";
import { supabase } from "@/lib/supabase";

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

    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          ...formData,
          created_at: new Date().toISOString(),
          status: "active",
        })
        .select()
        .single();

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating achievement:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
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
            </button>

            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                Create New Achievement
              </h2>

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

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-800 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:bg-blue-500 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Creating..." : "Create Achievement"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
