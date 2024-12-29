import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";
import UsernameSetupModal from "../components/UsernameSetupModal";

export default function HomePage() {
  const router = useRouter();
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const checkUserSetup = async () => {
      if (router.query.needsSetup) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setUserEmail(session.user.email || "");
          setShowSetupModal(true);
        }
      }
    };

    checkUserSetup();
  }, [router.query]);

  const handleSetupComplete = () => {
    setShowSetupModal(false);
    router.replace("/", undefined, { shallow: true });
    window.location.reload(); // Force reload to update navbar
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to GameBoost
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Connect with gaming partners and boost your gameplay
            </p>
          </div>
        </div>
      </main>

      {showSetupModal && (
        <UsernameSetupModal
          isOpen={showSetupModal}
          onClose={handleSetupComplete}
          email={userEmail}
        />
      )}
    </div>
  );
}
