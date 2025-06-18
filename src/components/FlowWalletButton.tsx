import { Button } from "@/components/ui/button";
import { Wallet, Loader2 } from "lucide-react";
import { useFlowWallet } from "@/hooks/use-flow-wallet";

export const FlowWalletButton = () => {
  const { isConnected, isConnecting, connectWallet, disconnectWallet, address } = useFlowWallet();

  const handleClick = () => {
    if (isConnected) {
      disconnectWallet();
    } else {
      connectWallet();
    }
  };

  const getButtonText = () => {
    if (isConnecting) return "Connecting...";
    if (isConnected) return "Disconnect Wallet";
    return "Connect Flow Wallet";
  };

  const getDisplayAddress = () => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isConnecting}
      variant={isConnected ? "outline" : "default"}
      className="flex items-center gap-2"
    >
      {isConnecting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Wallet className="h-4 w-4" />
      )}
      {isConnected ? getDisplayAddress() : getButtonText()}
    </Button>
  );
}; 