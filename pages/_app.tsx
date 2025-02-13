import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Layout/Sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAccount, WagmiProvider } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains";
import { ApiProvider } from "../context/ApiContext";
const config = getDefaultConfig({
  appName: "My RainbowKit App",
  projectId: "YOUR_PROJECT_ID",
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const gamePaths = ["/stats", "/achievements", "/rewards"];
  const showSidebar = gamePaths.includes(router.pathname);
  const queryClient = new QueryClient();

  return (
    <>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <div className="min-h-screen bg-background">
              <ApiProvider>
                <Navbar />
                <div className="flex">
                  {/* Sidebar - Hidden on mobile by default */}
                  {showSidebar && (
                    <div className="hidden md:block">
                      <Sidebar />
                    </div>
                  )}
                  {/* Main content - Full width on mobile, adjusted for sidebar on desktop */}
                  <main
                    className={`flex-1 w-full ${
                      showSidebar ? "md:ml-64" : ""
                    } transition-all duration-200`}
                  >
                    <Component {...pageProps} />
                  </main>
                </div>
              </ApiProvider>
            </div>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
}

export default MyApp;
