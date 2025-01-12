import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import AuthForm from "./AuthForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          <div className="relative bg-white rounded-lg shadow-xl">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
            >
              ✕
            </button>
            <AuthForm onClose={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
}
