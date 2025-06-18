import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFlowWallet } from "@/hooks/use-flow-wallet";
import { Wallet, CheckCircle, XCircle } from "lucide-react";

export const FlowStatus = () => {
  const { isConnected, address } = useFlowWallet();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Flow Wallet Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? (
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Connected
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                Disconnected
              </div>
            )}
          </Badge>
        </div>
        
        {isConnected && address && (
          <div className="space-y-2">
            <span className="text-sm font-medium">Address:</span>
            <div className="text-sm font-mono bg-muted p-2 rounded">
              {address}
            </div>
          </div>
        )}
        
        {!isConnected && (
          <p className="text-sm text-muted-foreground">
            Click the "Connect Flow Wallet" button in the header to connect your wallet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}; 