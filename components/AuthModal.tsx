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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pt-20">
      {/* Overlay to close modal on click */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-5xl bg-black rounded-lg shadow-xl flex flex-col md:flex-row overflow-hidden">
        {/* Image Section */}
        <div className="w-full md:w-1/2">
          <img
            src="/brand/apex.jpg"
            alt="Modal Image"
            className="w-full h-48 md:h-full object-cover md:rounded-l-lg"
          />
        </div>

        {/* Form Section */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-center relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
          >
            ✕
          </button>

          <AuthForm />
        </div>
      </div>
    </div>
  );
}
