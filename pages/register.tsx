import React, { useState } from "react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { toast } from "react-toastify";
import { useApi } from "../context/ApiContext";

interface FormData {
  displayName: string;
  emailAddress: string;
}

const UserCreationForm: React.FC = () => {
  const { createUser } = useApi();
  const { address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    emailAddress: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    try {
      await createUser({
        walletAddress: address,
        ...formData,
      });
      toast.success("User created successfully!");
      setFormData({ displayName: "", emailAddress: "" });
    } catch (error) {
      toast.error(
        `Failed to create user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create New User</h2>

      {!address ? (
        <button
          onClick={openConnectModal}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors mb-4"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="bg-gray-50 p-3 rounded-lg mb-4 text-sm break-all">
          Connected: {address}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            name="displayName"
            placeholder="Display Name"
            value={formData.displayName}
            onChange={handleInputChange}
            required
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <input
            type="email"
            name="emailAddress"
            placeholder="Email Address"
            value={formData.emailAddress}
            onChange={handleInputChange}
            required
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={!address || isLoading}
          className={`w-full py-2 px-4 rounded transition-colors ${
            !address || isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white`}
        >
          {isLoading ? "Creating..." : "Create User"}
        </button>
      </form>
    </div>
  );
};

export default UserCreationForm;
