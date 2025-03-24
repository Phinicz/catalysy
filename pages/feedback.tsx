import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";

export default function FeedbackPage() {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className="min-h-screen  text-white flex flex-col bg-cover bg-center"
      style={{ backgroundImage: "url('/backgrounds/feedback.jpg')" }}
    >
      <header className="p-4  bg-opacity-80">
        <button
          onClick={() => router.back()}
          className="flex items-center text-white hover:text-gray-200"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
      </header>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-grow flex flex-col items-center justify-center p-6 bg-black bg-opacity-70"
      >
        <h1 className="text-3xl font-bold mb-4">We Value Your Feedback</h1>
        <p className="mb-8 text-center text-gray-300">
          Help us improve by sharing your thoughts and suggestions.
        </p>
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg bg-gray-800 p-6 rounded-lg shadow-lg space-y-4"
        >
          <div>
            <label htmlFor="feedback" className="block text-gray-300 mb-2">
              Your Feedback
            </label>
            <textarea
              id="feedback"
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full p-3 bg-gray-900 text-white rounded-lg focus:ring focus:ring-red-500"
              placeholder="Share your thoughts..."
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-300 mb-2">
              Email (Optional)
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-900 text-white rounded-lg focus:ring focus:ring-red-500"
              placeholder="Your email address"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            type="submit"
          >
            Submit Feedback
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
