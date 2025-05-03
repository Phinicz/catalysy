import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ArrowLeft,
  ArrowRight,
  Trophy,
  Wallet,
  Crown,
  Target,
  Gift,
  Sparkles,
} from "lucide-react";

interface Step {
  title: string;
  content: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  {
    title: "Welcome to Catalysy",
    content:
      "Welcome to Catalysy, where you can play and earn rewards! Get ready for an exciting journey of gaming and rewards.",
    icon: <Sparkles className="w-8 h-8 text-green-400" />,
  },
  {
    title: "Get Started",
    content:
      "Make sure to sign up if you don't have an account and connect your wallet to start earning rewards.",
    icon: <Wallet className="w-8 h-8 text-green-400" />,
  },
  {
    title: "Premium Benefits",
    content:
      "Consider purchasing a subscription to unlock more benefits and features of the platform. (Optional)",
    icon: <Crown className="w-8 h-8 text-green-400" />,
  },
  {
    title: "Choose Your Achievement",
    content:
      "Head to the achievements page and select an achievement that interests you. Track your progress on the stats page.",
    icon: <Target className="w-8 h-8 text-green-400" />,
  },
  {
    title: "Claim Your Rewards",
    content:
      "Once you've completed your achievements, visit the claim page to collect your well-deserved rewards.",
    icon: <Gift className="w-8 h-8 text-green-400" />,
  },
  {
    title: "Thank You!",
    content:
      "Thank you for visiting Catalysy! We hope you enjoy your gaming and rewards journey with us.",
    icon: <Trophy className="w-8 h-8 text-green-400" />,
  },
];

export default function TutorialModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Show tutorial on every page load
    setIsOpen(true);
  }, []);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsOpen(false);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999]">
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-lg bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-xl border border-green-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Green glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent rounded-2xl" />

            <button
              onClick={handleClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="mt-3 text-center">
              <div className="flex justify-center mb-4">
                {steps[currentStep].icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {steps[currentStep].title}
              </h3>
              <p className="text-gray-300 text-lg">
                {steps[currentStep].content}
              </p>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg z-50 ${
                  currentStep === 0
                    ? "bg-gray-700 cursor-not-allowed text-gray-500"
                    : "bg-gray-700/50 hover:bg-gray-700 text-white"
                } transition-colors`}
              >
                <ArrowLeft className="h-5 w-5" />
                Back
              </button>

              <div className="flex gap-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      index === currentStep ? "bg-green-500" : "bg-gray-600"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white transition-colors z-50"
              >
                {currentStep === steps.length - 1 ? "Finish" : "Next"}
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
