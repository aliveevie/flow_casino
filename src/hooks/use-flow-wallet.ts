import { useState, useEffect } from "react";
import * as fcl from "@onflow/fcl";
import "../lib/flow"; // Import Flow configuration

export const useFlowWallet = () => {
  const [user, setUser] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Subscribe to user changes
    const unsubscribe = fcl.currentUser.subscribe((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      await fcl.authenticate();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      await fcl.unauthenticate();
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  return {
    user,
    isConnected: !!user?.addr,
    isConnecting,
    connectWallet,
    disconnectWallet,
    address: user?.addr,
  };
}; 