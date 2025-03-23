import { Fragment, useEffect } from "react";
import AuthForm from "./AuthForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"; // Disable scrolling
    } else {
      document.body.style.overflow = ""; // Re-enable scrolling
    }

    return () => {
      document.body.style.overflow = ""; // Clean up when component unmounts
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Overlay to close modal on click */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl bg-black rounded-lg shadow-xl flex flex-col md:flex-row overflow-hidden my-8">
        {/* Image Section */}
        <div className="w-full md:w-1/2 h-48 md:h-auto">
          <img
            src="/brand/apex.jpg"
            alt="Modal Image"
            className="w-full h-full object-cover md:rounded-l-lg"
          />
        </div>

        {/* Form Section */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-center relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-500 z-10"
          >
            ✕
          </button>

          <AuthForm onClose={onClose} />
        </div>
      </div>
    </div>
  );
}
