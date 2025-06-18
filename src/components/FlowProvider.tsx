import { useEffect } from "react";
import "../lib/flow"; // Import Flow configuration

interface FlowProviderProps {
  children: React.ReactNode;
}

export const FlowProvider = ({ children }: FlowProviderProps) => {
  useEffect(() => {
    // Initialize Flow when the app starts
    console.log("Flow initialized");
  }, []);

  return <>{children}</>;
}; 