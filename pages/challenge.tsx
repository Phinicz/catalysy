import React, { useState } from "react";
import { Trophy, Sparkles, Gift } from "lucide-react";

const Challenge = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    reward: "",
    criteria: "",
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // Handle form submission to admin dashboard
    // console.log("Form submitted:", formData);
  };

  return (
    <div className=" bg-black p-6">
      <div className="max-w-2xl  md:py-24 py-[150px] mx-auto animate-fade-in">
        <div className="bg-zinc-900 border-2 border-red-500 rounded-lg shadow-xl">
          {/* Header */}
          <div className="p-6 border-b border-red-500/20">
            <div className="flex items-center gap-3 mb-4 animate-slide-in">
              <Trophy className="w-8 h-8 text-red-500" />
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">
                Submit Your Challenge
              </h1>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Challenge Title */}
              <div className="space-y-2 animate-fade-in">
                <label className="block text-white text-sm font-medium">
                  Challenge Title
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-zinc-800 border border-red-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="Enter challenge title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              {/* Description */}
              <div className="space-y-2 animate-fade-in">
                <label className="block text-white text-sm font-medium">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-2 bg-zinc-800 border border-red-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all min-h-32 resize-y"
                  placeholder="Describe your challenge or achievement"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              {/* Reward */}
              <div className="space-y-2 animate-fade-in">
                <label className="block text-white text-sm font-medium flex items-center gap-2">
                  <Gift className="w-4 h-4 text-red-500" />
                  Reward
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-zinc-800 border border-red-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="Enter reward details"
                  value={formData.reward}
                  onChange={(e) =>
                    setFormData({ ...formData, reward: e.target.value })
                  }
                />
              </div>

              {/* Completion Criteria */}
              <div className="space-y-2 animate-fade-in">
                <label className="block text-white text-sm font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-red-500" />
                  Completion Criteria
                </label>
                <textarea
                  className="w-full px-4 py-2 bg-zinc-800 border border-red-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-y"
                  placeholder="What are the criteria for completing this challenge?"
                  value={formData.criteria}
                  onChange={(e) =>
                    setFormData({ ...formData, criteria: e.target.value })
                  }
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4 animate-fade-in">
                <button
                  type="submit"
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium transition-colors duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Submit Challenge
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Add required styles to head */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            transform: translateX(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .animate-slide-in {
          animation: slideIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Challenge;
