import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useApi } from "../context/ApiContext";
import { toast } from "react-toastify";

export const CustomWalletConnect = () => {
  const { address, isConnected } = useAccount();
  const { getLoyaltyRules, completeLoyaltyRule } = useApi();
  const [isProcessingRule, setIsProcessingRule] = useState(false);

  useEffect(() => {
    const handleWalletConnect = async () => {
      if (isConnected && address && !isProcessingRule) {
        try {
          setIsProcessingRule(true);
          // Get all loyalty rules
          const rulesResponse = await getLoyaltyRules();

          // Find the wallet connect rule
          const walletConnectRule = rulesResponse.data.find(
            (rule) => rule.type === "WalletConnect"
          );

          if (walletConnectRule) {
            // Complete the rule
            await completeLoyaltyRule(walletConnectRule.id, address);
            toast.success("Wallet connection reward claimed successfully!");
          }
        } catch (error) {
          console.error("Error processing wallet connect rule:", error);
          if (error instanceof Error) {
            toast.error(`Failed to process reward: ${error.message}`);
          } else {
            toast.error("Failed to process wallet connection reward");
          }
        } finally {
          setIsProcessingRule(false);
        }
      }
    };

    handleWalletConnect();
  }, [address, isConnected, getLoyaltyRules, completeLoyaltyRule]);

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="bg-gray-600 text-white font-medium py-2 px-4 rounded hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2"
                  >
                    Connect Wallet
                  </button>
                );
              }
              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="bg-gray-600 text-white font-medium py-2 px-4 rounded hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2"
                  >
                    Wrong network
                  </button>
                );
              }
              return (
                <div className="flex gap-3">
                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="bg-gray-600 text-white font-medium py-2 px-4 rounded hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2"
                  >
                    {account.displayName}
                    {account.displayBalance
                      ? ` (${account.displayBalance})`
                      : ""}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
