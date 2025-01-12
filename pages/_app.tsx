import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Layout/Sidebar";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const gamePaths = ["/stats", "/achievements", "/rewards"];
  const showSidebar = gamePaths.includes(router.pathname);

  return (
    <div className="min-h-screen bg-background">
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
    </div>
  );
}

export default MyApp;
